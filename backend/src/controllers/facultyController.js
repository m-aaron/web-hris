import asyncHandler from 'express-async-handler';
import pool from '../configs/dbConfig.js';


// @desc    Create a new faculty member
// @route   POST /api/faculties
// @access  Private (Admin, HR)
export const createFaculty = asyncHandler(async (req, res) => {

    const { employee_id, department_id, teaching_load } = req.body;

    const normalizedTeachingLoad = String(teaching_load || '').trim();

    if (!employee_id) {
        return res.status(400).json({ message: 'Employee is required.', success: false });
    }

    const existingResult = await pool.query(`SELECT id FROM employees WHERE id = $1`, [employee_id]);
    if (existingResult.rowCount === 0) {
        return res.status(404).json({ message: 'Employee not found.', success: false });
    }

    if (department_id) {
        const deptResult = await pool.query(`SELECT id FROM departments WHERE id = $1`, [department_id]);
        if (deptResult.rowCount === 0) {
            return res.status(404).json({ message: 'Department not found.', success: false });
        }
    }

    // Prevent duplicate faculty record for same employee in same department
    // Allow same employee in different departments
    const dup = await pool.query(`SELECT id FROM faculties WHERE employee_id = $1 AND department_id = $2`, [employee_id, department_id || null]);
    if (dup.rowCount > 0) {
        return res.status(409).json({ message: 'Faculty record for this employee in this department already exists.', success: false });
    }

    const createResult = await pool.query(
        `INSERT INTO faculties (employee_id, department_id, teaching_load)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [employee_id, department_id || null, normalizedTeachingLoad || null]
    );

    if (createResult.rowCount === 0) {
        return res.status(500).json({ message: 'Failed to create faculty record.', success: false });
    }

    res.status(201).json({
        message: 'Faculty member created successfully.',
        success: true,
        faculty: createResult.rows[0],
    });

});


// @desc    Get list of faculties
// @route   GET /api/faculties
// @access  Private
export const getFaculties = asyncHandler(async (req, res) => {
    const { department = '' } = req.query;

    const values = [];
    let where = '';
    if (department) {
        values.push(department);
        where = `WHERE f.department_id = $${values.length}`;
    }

    const q = `
        SELECT
            f.id AS faculty_id,
            f.employee_id,
            f.department_id,
            f.teaching_load,
            e.employee_no,
            pd.last_name,
            pd.first_name,
            pd.middle_name,
            pd.name_extension,
            ed.date_hired,
            ed.employment_status,
            ed.salary,
            pos.name AS position_name,
            d.name AS designation_name
        FROM faculties f
        JOIN employees e ON e.id = f.employee_id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        LEFT JOIN employment_data ed ON ed.employee_id = e.id
        LEFT JOIN positions pos ON pos.id = ed.position_id
        LEFT JOIN designations d ON d.id = ed.designation_id
        ${where}
    `;

    const result = await pool.query(q, values);
    const rows = result.rows || [];

    const employeeIds = rows.map((r) => r.employee_id).filter(Boolean);

    let educationMap = {};
    if (employeeIds.length) {
        const eduRes = await pool.query(
            `SELECT employee_id, title, school, year_finished
             FROM educational_qualifications
             WHERE employee_id = ANY($1)
             ORDER BY CASE WHEN school IS NULL THEN 1 ELSE 0 END, year_finished DESC NULLS LAST`,
            [employeeIds]
        );

        educationMap = eduRes.rows.reduce((acc, cur) => {
            if (!acc[cur.employee_id]) acc[cur.employee_id] = [];
            acc[cur.employee_id].push(cur);
            return acc;
        }, {});
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        try {
            return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric', timeZone: 'Asia/Manila' }).format(d);
        } catch (e) {
            return d.toDateString();
        }
    };

    const computeYears = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        const now = new Date();
        let years = now.getFullYear() - d.getFullYear();
        const m = now.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
        return years;
    };

    const formatted = rows.map((r) => {
        const edus = educationMap[r.employee_id] || [];
        const withSchool = edus.filter((e) => e.school !== null && String(e.school).trim() !== '');
        const withoutSchool = edus.filter((e) => !e.school || String(e.school).trim() === '');

        const formatEdu = (e) => {
            if (e.school && e.year_finished) return `${e.title}-${e.school}, ${e.year_finished}`;
            if (e.school) return `${e.title}-${e.school}`;
            return String(e.title);
        };

        const qualifications = [...withSchool.map(formatEdu), ...withoutSchool.map(formatEdu)].join('; ');

        const years = computeYears(r.date_hired);

        return {
            id: r.faculty_id,
            employee_id: r.employee_id,
            department_id: r.department_id,
            employee_no: r.employee_no,
            last_name: r.last_name,
            first_name: r.first_name,
            middle_name: r.middle_name,
            name_extension: r.name_extension,
            date_hired: formatDate(r.date_hired),
            years_in_service: years !== null && years !== undefined ? `${years} ${years === 1 ? 'year' : 'years'}` : null,
            academic_qualifications: qualifications,
            salary: r.salary || null,
            position_name: r.position_name || null,
            designation_name: r.designation_name || null,
            teaching_load: r.teaching_load || null,
            employment_status: r.employment_status || null,
        };
    });

    // apply sort
    formatted.sort((a, b) => {
        const ay = a.years_in_service ? Number(a.years_in_service.split(' ')[0]) : -1;
        const by = b.years_in_service ? Number(b.years_in_service.split(' ')[0]) : -1;
        return by - ay; // highest first
    });


    res.status(200).json({ message: 'Faculties retrieved successfully.', success: true, faculties: formatted });

});


// @desc    Get single faculty
// @route   GET /api/faculties/:id
// @access  Private
export const getFacultyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`SELECT id AS faculty_id, employee_id, department_id, teaching_load FROM faculties WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Faculty not found.', success: false });
    res.status(200).json({ message: 'Faculty retrieved.', success: true, faculty: result.rows[0] });
});


// @desc    Update faculty
// @route   PUT /api/faculties/:id
// @access  Private
export const updateFaculty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { department_id, teaching_load } = req.body;

    const normalizedTeachingLoad = String(teaching_load || '').trim();

    if (!department_id) {
        return res.status(400).json({ message: 'Department is required.', success: false });
    }

    const check = await pool.query(`SELECT id FROM faculties WHERE id = $1`, [id]);
    if (check.rowCount === 0) return res.status(404).json({ message: 'Faculty not found.', success: false });

    if (department_id) {
        const dept = await pool.query(`SELECT id FROM departments WHERE id = $1`, [department_id]);
        if (dept.rowCount === 0) return res.status(404).json({ message: 'Department not found.', success: false });
    }

    const update = await pool.query(`UPDATE faculties SET department_id = $1, teaching_load = $2 WHERE id = $3 RETURNING *`, [department_id || null, normalizedTeachingLoad || null, id]);
    res.status(200).json({ message: 'Faculty updated successfully.', success: true, faculty: update.rows[0] });
});


// @desc    Delete faculty
// @route   DELETE /api/faculties/:id
// @access  Private
export const deleteFaculty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const check = await pool.query(`SELECT id FROM faculties WHERE id = $1`, [id]);
    if (check.rowCount === 0) return res.status(404).json({ message: 'Faculty not found.', success: false });
    await pool.query(`DELETE FROM faculties WHERE id = $1`, [id]);
    res.status(200).json({ message: 'Faculty deleted successfully.', success: true });
});