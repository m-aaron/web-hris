import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import { buildFilterQuery, generateExcelFile } from "../utils/excelExportUtil.js";
import { checkEmployeeCompletion, updateEmployeeStatusIfComplete } from "../helpers/employeeStatusHelper.js";
import { STATUS } from "../constants/employmentConstant.js";


// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = asyncHandler(async (req, res) => {

    const { employeeNumber, employmentType } = req.body;

    // Validate required fields
    if (!employeeNumber || !employmentType) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    if (!["TEACHING", "NON_TEACHING"].includes(employmentType)) {
        return res.status(400).json({ message: "Invalid employment type. Must be 'TEACHING' or 'NON TEACHING'.", success: false });
    }

    // Check if employee number already exists
    const employeeNoResult = await pool.query(
        `SELECT 1 FROM employees WHERE employee_no = $1`,
        [employeeNumber]
    );

    // If employee number already exists, return conflict error
    if (employeeNoResult.rows.length > 0) {
        return res.status(409).json({ message: "Employee number already exists.", success: false });
    }

    // Insert new employee record
    const employeeResult = await pool.query(
        `
            INSERT INTO employees (employee_no, employment_type)
            VALUES ($1, $2)
            RETURNING *
        `,
        [employeeNumber , employmentType]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(500).json({ message: "Failed to create employee.", success: false });
    }

    await updateEmployeeStatusIfComplete(employeeResult.rows[0].id, pool);

    res.status(201).json({ message: "Employee created successfully.", success: true, employee: employeeResult.rows[0] });
});

// @desc    Update employee details (currently only employee number and type)
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { employmentType } = req.body;

    // Validate required fields
    if (!employmentType) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    if (!["TEACHING", "NON_TEACHING"].includes(employmentType)) {
        return res.status(400).json({ message: "Invalid employment type. Must be 'TEACHING' or 'NON TEACHING'.", success: false });
    }

    const checkResult = await pool.query(
        `SELECT id FROM employees WHERE id = $1`,
        [id]
    );

    // If employee does not exist, return not found error
    if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    }

    const employeeResult = await pool.query(
        `
            UPDATE employees
            SET employment_type = $1
            WHERE id = $2
            RETURNING *
        `,
        [employmentType, id]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(500).json({ message: "Failed to update employee.", success: false });
    }

    res.status(200).json({ message: "Employee updated successfully.", success: true, employee: employeeResult.rows[0] });
});

// @desc    Update employee photo
// @route   PUT /api/employees/:id/photo
// @access  Private
export const updateEmployeePhoto = asyncHandler(async (req, res) => {

    const { id } = req.params;

    // Check if file is uploaded
    if(!req.file) {
        return res.status(400).json({ message: "No file uploaded.", success: false });
    };

    // Check if employee exists
    const employeeResult = await pool.query(
        `SELECT photo_url FROM employees WHERE id = $1`,
        [id]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    const oldPhotoUrl = employeeResult.rows[0].photo_url;

    // If there is an old photo, delete it from the server
    if (oldPhotoUrl) {
        const oldPhotoPath = path.join(process.cwd(), oldPhotoUrl);
        if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
        };
    };

    const fileName = crypto.randomUUID() + ".webp";
    const uploadDir = path.join("uploads", "profile");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    };

    const outputPath = path.join(uploadDir, fileName);

    // Process and save the image
    await sharp(req.file.buffer)        
        .resize(600, 600, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(outputPath);

    const photoUrl = `/uploads/profile/${fileName}`;

    const updateResult = await pool.query(
        `UPDATE employees SET photo_url = $1 WHERE id = $2`,
        [photoUrl, id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update employee photo.", success: false });
    };
    
    res.status(200).json({ message: "Employee photo updated successfully.", success: true, photoUrl });

});

// @desc    Get employees with pagination and filtering
// @route   GET /api/employees
// @access  Private
export const getEmployees = asyncHandler(async (req, res) => {

    const {
        search = "",
        page = 1,
        limit = 10,
        type,
        status,
        record_status,
        basis,
        sex,
        regularization_filter,
        on_leave_today,
        sort = "date_hired_desc"
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClauses = [];
    let values = [];
    let index = 1;

    const normalizedSearch = search.toUpperCase().replace("-", "_");

    const allowedRecordStatuses = ["DRAFT", "SUBMITTED", "ARCHIVED"];
    const normalizedRecordStatus = record_status
        ? String(record_status).toUpperCase().trim()
        : "";

    if (normalizedRecordStatus === "ALL") {
        // No status clause: include all record statuses.
    } else if (normalizedRecordStatus && allowedRecordStatuses.includes(normalizedRecordStatus)) {
        whereClauses.push(`e.status = $${index}`);
        values.push(normalizedRecordStatus);
        index++;
    } else {
        // Keep existing behavior when no record status filter is provided.
        whereClauses.push(`e.status = $${index}`);
        values.push("SUBMITTED");
        index++;
    }

    // Global Search
    if (normalizedSearch) {
        whereClauses.push(`
            (
                LOWER(pd.first_name) LIKE LOWER($${index})
                OR LOWER(pd.last_name) LIKE LOWER($${index})
                OR LOWER(e.employee_no) LIKE LOWER($${index})
                OR LOWER(e.employment_type) LIKE LOWER($${index})
                OR LOWER(ed.employment_status) LIKE LOWER($${index})
                OR LOWER(ed.employment_basis) LIKE LOWER($${index})
            )
        `);
        values.push(`%${normalizedSearch}%`);
        index++;
    }

    // Filters
    if (type) {
        whereClauses.push(`e.employment_type = $${index}`);
        values.push(type);
        index++;
    }

    if (status) {
        whereClauses.push(`ed.employment_status = $${index}`);
        values.push(status);
        index++;
    }

    if (basis) {
        whereClauses.push(`ed.employment_basis = $${index}`);
        values.push(basis);
        index++;
    }

    if (sex) {
        whereClauses.push(`pd.sex = $${index}`);
        values.push(sex);
        index++;
    }

    // Regularization filter (computed)
    if (regularization_filter === "near_30_days") {
        whereClauses.push(`
            (
                CASE
                    WHEN ed.employment_status = 'PROBATIONARY'
                        AND e.employment_type = 'TEACHING'
                        THEN ed.date_hired + INTERVAL '3 years'
                    WHEN ed.employment_status = 'PROBATIONARY'
                        AND e.employment_type = 'NON_TEACHING'
                        THEN ed.date_hired + INTERVAL '6 months'
                END
            ) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        `);
    }

    if (regularization_filter === "overdue") {
        whereClauses.push(`
            (
                CASE
                    WHEN ed.employment_status = 'PROBATIONARY'
                        AND e.employment_type = 'TEACHING'
                        THEN ed.date_hired + INTERVAL '3 years'
                    WHEN ed.employment_status = 'PROBATIONARY'
                        AND e.employment_type = 'NON_TEACHING'
                        THEN ed.date_hired + INTERVAL '6 months'
                END
            ) < CURRENT_DATE
            AND ed.employment_status != 'REGULAR'
        `);
    }

    // Leave filter - employees on leave today
    if (on_leave_today === "true") {
        whereClauses.push(`
            e.id IN (
                SELECT DISTINCT la.employee_id
                FROM leave_applications la
                JOIN leave_application_types lat ON la.id = lat.leave_application_id
                WHERE la.status = 'APPROVED'
                AND lat.date_from <= CURRENT_DATE
                AND lat.date_to >= CURRENT_DATE
            )
        `);
    }

    const whereQuery = whereClauses.length
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

    const sortOptions = {
        name_asc: "pd.last_name ASC NULLS LAST, pd.first_name ASC NULLS LAST",
        name_desc: "pd.last_name DESC NULLS LAST, pd.first_name DESC NULLS LAST",
        date_hired_asc: "ed.date_hired ASC NULLS LAST",
        date_hired_desc: "ed.date_hired DESC NULLS LAST",
        status_asc: "ed.employment_status ASC NULLS LAST",
        status_desc: "ed.employment_status DESC NULLS LAST",
        type_asc: "e.employment_type ASC NULLS LAST",
        type_desc: "e.employment_type DESC NULLS LAST",
        employee_no_asc: "e.employee_no ASC NULLS LAST",
        employee_no_desc: "e.employee_no DESC NULLS LAST"
    };

    const orderBy = sortOptions[sort] || "ed.date_hired DESC";

    const dataQuery = `
        SELECT 
            e.id,
            e.employee_no,
            e.employment_type,
            e.status AS record_status,
            e.photo_url,
            ed.employment_status,
            ed.employment_basis,
            ed.date_hired,
            pd.first_name,
            pd.last_name,
            pd.middle_name,
            pd.name_extension,
            pd.sex,
            pd.birth_date,

            -- Computed Regularization Date
            CASE
                WHEN e.employment_type = 'TEACHING'
                    THEN ed.date_hired + INTERVAL '3 years'
                WHEN e.employment_type = 'NON_TEACHING'
                    THEN ed.date_hired + INTERVAL '6 months'
            END AS regularization_date,

            CASE
                WHEN (
                    CASE
                        WHEN e.employment_type = 'TEACHING'
                            THEN ed.date_hired + INTERVAL '3 years'
                        WHEN e.employment_type = 'NON_TEACHING'
                            THEN ed.date_hired + INTERVAL '6 months'
                    END
                ) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                AND ed.employment_status != 'REGULAR'
                THEN 'near_30_days'

                WHEN (
                    CASE
                        WHEN e.employment_type = 'TEACHING'
                            THEN ed.date_hired + INTERVAL '3 years'
                        WHEN e.employment_type = 'NON_TEACHING'
                            THEN ed.date_hired + INTERVAL '6 months'
                    END
                ) < CURRENT_DATE
                AND ed.employment_status != 'REGULAR'
                THEN 'overdue'

                ELSE NULL
            END AS regularization_flag,

            -- Birthday Flag
            CASE 
                WHEN EXTRACT(MONTH FROM pd.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(DAY FROM pd.birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
                THEN 'birthday_today'

                WHEN (
                    MAKE_DATE(
                        EXTRACT(YEAR FROM CURRENT_DATE)::int,
                        EXTRACT(MONTH FROM pd.birth_date)::int,
                        EXTRACT(DAY FROM pd.birth_date)::int
                    )
                    BETWEEN CURRENT_DATE 
                    AND CURRENT_DATE + INTERVAL '7 days'
                )
                THEN 'birthday_soon'

                ELSE NULL
            END AS birthday_flag

        FROM employees e
        LEFT JOIN personal_data pd ON e.id = pd.employee_id
        LEFT JOIN employment_data ed ON e.id = ed.employee_id
        ${whereQuery}
        ORDER BY ${orderBy}
        LIMIT $${index}
        OFFSET $${index + 1}
    `;

    values.push(limit);
    values.push(offset);

    const result = await pool.query(dataQuery, values);

    const countResult = await pool.query(
        `
        SELECT COUNT(*)
        FROM employees e
        LEFT JOIN personal_data pd ON e.id = pd.employee_id
        LEFT JOIN employment_data ed ON e.id = ed.employee_id
        ${whereQuery}
        `,
        values.slice(0, values.length - 2)
    );

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            total: Number(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(countResult.rows[0].count / limit)
        }
    });

});

// @desc    Archive an employee
// @route   PUT /api/employees/:id/archive
// @access  Private
export const archiveEmployee = asyncHandler(async (req, res) => {

    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required." });
    };

    // Check if employee exist
    const checkResult = await pool.query(
        `SELECT id FROM employees WHERE id = $1`,
        [id]
    );
    if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "No employee found to archive." });
    };

    const result = await pool.query(
        `UPDATE employees SET status = $1 WHERE id = $2`,
        ['ARCHIVED', id]
    );

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to archive employee." });
    };

    res.status(200).json({ message: "Employee archived successfully", success: true });

});

// @desc    Restore archived employee to SUBMITTED or DRAFT
// @route   PUT /api/employees/:id/restore
// @access  Private
export const restoreEmployee = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { targetStatus } = req.body || {};

    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }

    const requestedStatus = targetStatus
        ? String(targetStatus).toUpperCase().trim()
        : null;

    const allowedStatuses = ["SUBMITTED", "DRAFT"];
    if (requestedStatus && !allowedStatuses.includes(requestedStatus)) {
        return res.status(400).json({
            message: "Invalid restore status. Allowed values are SUBMITTED or DRAFT.",
            success: false,
        });
    }

    const employeeResult = await pool.query(
        `SELECT id, status FROM employees WHERE id = $1`,
        [id]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(404).json({ message: "No employee found to restore.", success: false });
    }

    const currentStatus = employeeResult.rows[0].status;
    if (currentStatus !== "ARCHIVED") {
        return res.status(400).json({
            message: "Only archived employees can be restored.",
            success: false,
        });
    }

    const isComplete = await checkEmployeeCompletion(id, pool);

    let finalStatus = requestedStatus;
    if (!finalStatus) {
        finalStatus = isComplete ? "SUBMITTED" : "DRAFT";
    }

    if (finalStatus === "SUBMITTED" && !isComplete) {
        return res.status(400).json({
            message: "Cannot restore to SUBMITTED. Required sections are incomplete.",
            success: false,
        });
    }

    const restoreResult = await pool.query(
        `UPDATE employees
        SET status = $1
        WHERE id = $2
        RETURNING id, status`,
        [finalStatus, id]
    );

    if (restoreResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to restore employee.", success: false });
    }

    res.status(200).json({
        message: `Employee restored as ${finalStatus}.`,
        success: true,
        recordStatus: restoreResult.rows[0].status,
    });
});

// @desc    Bulk archive employees
// @route   PUT /api/employees/bulk-archive
// @access  Private
export const bulkArchiveEmployees = asyncHandler(async (req, res) => {

    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
        message: "Employee IDs are required.",
        success: false,
        });
    }

    // Check if employees exist
    const checkResult = await pool.query(
        `SELECT id FROM employees WHERE id = ANY($1::uuid[])`,
        [ids]
    );

    if (checkResult.rowCount === 0) {
        return res.status(404).json({
        message: "No employees found to archive.",
        success: false,
        });
    }

    // Update to ARCHIVED
    const result = await pool.query(
        `UPDATE employees 
        SET status = $1 
        WHERE id = ANY($2::uuid[])`,
        ["ARCHIVED", ids]
    );

    if (result.rowCount === 0) {
        return res.status(500).json({
        message: "Failed to archive employees.",
        success: false,
        });
    };

    res.status(200).json({
        message: "Employees archived successfully",
        success: true,
        archived_count: result.rowCount,
    });

});

// @desc    Change employee status (e.g. from PROBATIONARY to REGULAR)
// @route   PUT /api/employees/:id/status
// @access  Private
export const changeEmployeeStatus = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { newStatus } = req.body;

    // Validate input
    if (!id || !newStatus) {
        return res.status(400).json({ message: "Employee ID and new status are required." });
    };

    const upperStatus = newStatus.toUpperCase();

    if (!Object.values(STATUS).includes(upperStatus)) {
        return res.status(400).json({ message: "Invalid status value." });
    };

    // Check if employee exist
    const checkResult = await pool.query(
        `SELECT id FROM employees WHERE id = $1`,
        [id]
    );
    if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "No employee found to update." });
    };

    const result = await pool.query(
        `UPDATE employment_data 
        SET employment_status = $1 
        WHERE employee_id = $2`,
        [upperStatus, id]
    );

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update employee status." });
    };

    res.status(200).json({ message: "Employee status updated successfully", success: true });

});

// @desc    Export employees to Excel
// @route   GET /api/employees/export
// @access  Private
export const exportEmployeesExcel = asyncHandler(async (req, res) => {
    const { dataQuery, values } = buildFilterQuery(req.query);

    const result = await pool.query(dataQuery, values);

    if (result.rows.length === 0) {
        return res.status(400).json({ message: "No employees found to export.", success: false });
    };

    await generateExcelFile(result.rows, res);
});

// @desc    Export selected employees to Excel
// @route   POST /api/employees/export-selected
// @access  Private
export const exportSelectedEmployeesExcel = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !ids.length) {
        return res.status(400).json({ message: "No employee IDs provided.", success: false });
    }

    // Explicit ID export should include selected rows regardless of record status.
    const { dataQuery, values } = buildFilterQuery({ ids, record_status: "ALL" });

    const result = await pool.query(dataQuery, values);

    if (result.rows.length === 0) {
        return res.status(400).json({ message: "No employees found to export.", success: false });
    };

    await generateExcelFile(result.rows, res);
});

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const employeeResult = await pool.query(
        `SELECT 
            id,
            employee_no,
            employment_type,
            status,
            photo_url,
            updated_at AS employee_updated_at
        FROM employees 
        WHERE id = $1`,
        [id]
    );

    const personalDataResult = await pool.query(
        `SELECT 
            last_name,
            first_name,
            middle_name,
            name_extension,
            sex,
            birth_date,
            civil_status,
            citizenship,
            religion,
            blood_type,
            address,
            email,
            contact_number,
            updated_at AS personal_data_updated_at
        FROM personal_data 
        WHERE employee_id = $1`,
        [id]
    );

    const familyBackgroundResult = await pool.query(
        `SELECT 
            spouse,
            spouse_occupation,
            nearest_kin_name,
            nearest_kin_address,
            nearest_kin_contact_number,
            updated_at AS family_background_updated_at
        FROM family_background
        WHERE employee_id = $1`,
        [id]
    );

    const childrenResult = await pool.query(
        `SELECT 
            id,
            children_name,
            birth_date,
            office_school,
            occupation,
            updated_at AS children_updated_at
        FROM childrens 
        WHERE employee_id = $1`,
        [id]
    );

    const employmentDataResult = await pool.query(
        `SELECT 
            date_hired,
            position_id,
            salary,
            designation_id,
            sss,
            pagibig,
            tax,
            philhealth,
            peraa,
            employment_status,
            employment_basis,
            official_working_hours,
            other_employment,
            other_employment_working_hours,
            updated_at AS employment_data_updated_at
        FROM employment_data
        WHERE employee_id = $1`,
        [id]
    );

    const educationResult = await pool.query(
        `SELECT
            id,
            title,
            school,
            year_started,
            year_finished,
            updated_at AS education_updated_at
        FROM educational_qualifications
        WHERE employee_id = $1`,
        [id]
    );

    const educationMajorResult = await pool.query(
        `SELECT 
            em.id,
            em.education_id,
            em.major_name,
            em.updated_at AS education_major_updated_at
        FROM education_majors em
        JOIN educational_qualifications eq ON em.education_id = eq.id
        WHERE eq.employee_id = $1`,
        [id]
    );

    const educationMinorResult = await pool.query(
        `SELECT 
            emn.id,
            emn.education_id,
            emn.minor_name,
            emn.updated_at AS education_minor_updated_at
        FROM education_minors emn
        JOIN educational_qualifications eq ON emn.education_id = eq.id
        WHERE eq.employee_id = $1`,
        [id]
    );

    const educationHonorsResult = await pool.query(
        `SELECT 
            eh.id,
            eh.education_id,
            eh.honor_name,
            eh.updated_at AS education_honor_updated_at
        FROM education_honors eh
        JOIN educational_qualifications eq ON eh.education_id = eq.id
        WHERE eq.employee_id = $1`,
        [id]
    );

    const educationScholarshipResult = await pool.query(
        `SELECT 
            es.id,
            es.education_id,
            es.scholarship_name,
            es.updated_at AS education_scholarship_updated_at
        FROM education_scholarships es
        JOIN educational_qualifications eq ON es.education_id = eq.id
        WHERE eq.employee_id = $1`,
        [id]
    );

    const examinationResult = await pool.query(
        `SELECT 
            id,
            title,
            date_taken,
            rating,
            updated_at AS examination_updated_at
        FROM examinations_taken
        WHERE employee_id = $1`,
        [id]
    );

    const trainingResult = await pool.query(
        `SELECT 
            id,
            title,
            place,
            date_from,
            date_to,
            hours,
            conducted_by,
            updated_at AS training_updated_at
        FROM training_programs
        WHERE employee_id = $1`,
        [id]
    );

    const historyResult = await pool.query(
        `SELECT 
            id,
            start_date,
            end_date,
            position,
            employer,
            salary,
            reason_for_leaving,
            updated_at AS history_updated_at
        FROM employment_history
        WHERE employee_id = $1`,
        [id]
    );

    const otherInfoResult = await pool.query(
        `SELECT
            has_criminal_case,
            criminal_case_details,
            has_admin_offense,
            admin_offense_details,
            was_separated_employment,
            separation_details,
            updated_at AS other_information_updated_at
        FROM other_information
        WHERE employee_id = $1`,
        [id]
    );

    const referenceResult = await pool.query(
        `SELECT 
            id,
            name,
            address,
            contact_number,
            updated_at AS reference_updated_at
        FROM employee_references
        WHERE employee_id = $1`,
        [id]
    );

    res.json({
        message: "Employee retrieved successfully.",
        success: true,
        data: {
            employee: employeeResult.rows[0],
            personal: personalDataResult.rows[0],
            family: familyBackgroundResult.rows[0],
            children: childrenResult.rows,
            employment: employmentDataResult.rows[0],
            education: educationResult.rows,
            education_majors: educationMajorResult.rows,
            education_minors: educationMinorResult.rows,
            education_honors: educationHonorsResult.rows,
            education_scholarships: educationScholarshipResult.rows,
            examinations: examinationResult.rows,
            trainings: trainingResult.rows,
            history: historyResult.rows,
            other_information: otherInfoResult.rows[0],
            references: referenceResult.rows
        }
    });

});



/*
    POSITION AND DESIGNATION ENDPOINTS
    These are used to populate the dropdown options in the employee form.
 */

// @desc    Get all positions
// @route   GET /api/employees/positions
// @access  Private
export const getAllPositions = asyncHandler(async (req, res) => {

    const result = await pool.query(
        `SELECT id, name FROM positions ORDER BY name ASC`
    );

    res.json({
        message: "Positions retrieved successfully.",
        success: true,
        positions: result.rows
    });

});

export const getAllDesignations = asyncHandler(async (req, res) => {

    const result = await pool.query(
        `SELECT id, name FROM designations ORDER BY name ASC`
    );

    res.json({
        message: "Designations retrieved successfully.",
        success: true,
        designations: result.rows
    });

});


// @desc    Get all active employees (for dropdown selection)
// @route   GET /api/employees/active
// @access  Private
export const getAllActiveEmployees = asyncHandler(async (req, res) => {

    const result = await pool.query(
        `SELECT
            e.id,
            e.employee_no,
            e.status,
            pd.first_name,
            pd.middle_name,
            pd.last_name,
            pd.name_extension
        FROM employees e
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        WHERE e.status = 'SUBMITTED'
        ORDER BY pd.last_name ASC NULLS LAST, pd.first_name ASC NULLS LAST`
    );

    res.json({
        message: "Active employees retrieved successfully.",
        success: true,
        employees: result.rows
    });

});