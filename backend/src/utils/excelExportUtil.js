import ExcelJS from "exceljs";
import pool from "../configs/dbConfig.js";


const formatFullName = (name) => {
    if (!name) return null

        const lastName = name.last_name?.trim()
        const firstName = name.first_name?.trim()
        const middleName = name.middle_name?.trim()
        const extension = name.name_extension?.trim()

        const left = lastName || ""
        const rightParts = [firstName, middleName, extension].filter(
            (part) => part !== null && part !== undefined && String(part).trim() !== ""
        )
        const right = rightParts.join(" ")

        if (left && right) return `${left}, ${right}`
        if (left) return left
        return right || "N/A"
    }

// Utility to build dynamic SQL query based on filters
export const buildFilterQuery = (filters = {}) => {

    const {
        search,
        type,
        status,
        record_status,
        basis,
        sex,
        regularization_filter,
        sort = "date_hired_desc",
        ids
    } = filters;

    let whereClauses = [];
    let values = [];
    let index = 1;

    const normalizedSearch = search
        ? search.toUpperCase().replace("-", "_")
        : "";

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

    if (ids && ids.length) {
        whereClauses.push(`e.id = ANY($${index}::uuid[])`);
        values.push(ids);
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
            e.photo_url,
            ed.employment_status,
            ed.employment_basis,
            ed.date_hired,
            ed.position_id,
            ed.designation_id,
            ed.salary,
            ed.sss,
            ed.pagibig,
            ed.tax,
            ed.philhealth,
            ed.peraa,
            ed.official_working_hours,
            ed.other_employment,
            ed.other_employment_working_hours,
            pd.first_name,
            pd.last_name,
            pd.middle_name,
            pd.name_extension,
            pd.sex,
            pd.birth_date,
            pd.civil_status,
            pd.citizenship,
            pd.religion,
            pd.blood_type,
            pd.address,
            pd.email,
            pd.contact_number,

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
    `;

    return { dataQuery, values };

};

// Fetch comprehensive PDS data for export
export const enrichEmployeeDataWithPDS = async (employees) => {
    const enrichedEmployees = [];

    for (const employee of employees) {
        const employeeId = employee.id;

        // Fetch Family Background
        const familyResult = await pool.query(
            `SELECT spouse, spouse_occupation, nearest_kin_name, nearest_kin_address, nearest_kin_contact_number
             FROM family_background WHERE employee_id = $1`,
            [employeeId]
        );
        const family = familyResult.rows[0] || {};

        // Fetch Children
        const childrenResult = await pool.query(
            `SELECT children_name, birth_date, office_school, occupation FROM childrens WHERE employee_id = $1 ORDER BY birth_date`,
            [employeeId]
        );

        // Fetch Employment Data
        const employmentDataResult = await pool.query(
            `SELECT * FROM employment_data WHERE employee_id = $1`,
            [employeeId]
        );

        // Fetch Educational Qualifications with related data
        const educationResult = await pool.query(
            `SELECT id, title, school, year_started, year_finished FROM educational_qualifications WHERE employee_id = $1 ORDER BY year_finished DESC`,
            [employeeId]
        );

        // Fetch Examinations
        const examsResult = await pool.query(
            `SELECT title, date_taken, rating FROM examinations_taken WHERE employee_id = $1 ORDER BY date_taken DESC`,
            [employeeId]
        );

        // Fetch Training Programs
        const trainingResult = await pool.query(
            `SELECT title, place, date_from, date_to, hours, conducted_by FROM training_programs WHERE employee_id = $1 ORDER BY date_from DESC`,
            [employeeId]
        );

        // Fetch Employment History
        const historyResult = await pool.query(
            `SELECT start_date, end_date, "position", employer, salary, reason_for_leaving FROM employment_history WHERE employee_id = $1 ORDER BY start_date DESC`,
            [employeeId]
        );

        // Fetch Other Information
        const otherInfoResult = await pool.query(
            `SELECT has_criminal_case, criminal_case_details, has_admin_offense, admin_offense_details, was_separated_employment, separation_details FROM other_information WHERE employee_id = $1`,
            [employeeId]
        );
        const otherInfo = otherInfoResult.rows[0] || {};

        // Fetch References
        const referencesResult = await pool.query(
            `SELECT name, address, contact_number FROM employee_references WHERE employee_id = $1 ORDER BY created_at`,
            [employeeId]
        );

        // Get Position Name
        let positionName = "-";
        if (employee.position_id) {
            const posResult = await pool.query(`SELECT name FROM positions WHERE id = $1`, [employee.position_id]);
            positionName = posResult.rows[0]?.name || "-";
        }

        // Get Designation Name
        let designationName = "-";
        if (employee.designation_id) {
            const desResult = await pool.query(`SELECT name FROM designations WHERE id = $1`, [employee.designation_id]);
            designationName = desResult.rows[0]?.name || "-";
        }

        // Process Education Data
        const educationWithDetails = [];
        for (const edu of educationResult.rows) {
            const majorsResult = await pool.query(
                `SELECT major_name FROM education_majors WHERE education_id = $1`,
                [edu.id]
            );
            const minorsResult = await pool.query(
                `SELECT minor_name FROM education_minors WHERE education_id = $1`,
                [edu.id]
            );
            const honorsResult = await pool.query(
                `SELECT honor_name FROM education_honors WHERE education_id = $1`,
                [edu.id]
            );
            const scholarshipsResult = await pool.query(
                `SELECT scholarship_name FROM education_scholarships WHERE education_id = $1`,
                [edu.id]
            );

            educationWithDetails.push({
                ...edu,
                majors: majorsResult.rows.map(r => r.major_name),
                minors: minorsResult.rows.map(r => r.minor_name),
                honors: honorsResult.rows.map(r => r.honor_name),
                scholarships: scholarshipsResult.rows.map(r => r.scholarship_name)
            });
        }

        // Extract spouse info
        let spouseName = "-";
        if (family.spouse) {
            try {
                const spouseObj = typeof family.spouse === 'string' ? JSON.parse(family.spouse) : family.spouse;
                spouseName = `${spouseObj.last_name || ''} ${spouseObj.first_name || ''}`.trim() || "-";
            } catch (e) {
                spouseName = family.spouse?.last_name ? `${family.spouse.last_name} ${family.spouse.first_name}` : "-";
            }
        }

        enrichedEmployees.push({
            ...employee,
            positionName,
            designationName,
            spouseName,
            spouse_occupation: family.spouse_occupation || "-",
            nearest_kin_name: family.nearest_kin_name ? 
                (typeof family.nearest_kin_name === 'string' ? JSON.parse(family.nearest_kin_name) : family.nearest_kin_name) : {},
            nearest_kin_address: family.nearest_kin_address ? 
                (typeof family.nearest_kin_address === 'string' ? JSON.parse(family.nearest_kin_address) : family.nearest_kin_address) : {},
            nearest_kin_contact_number: family.nearest_kin_contact_number || "-",
            children: childrenResult.rows,
            education: educationWithDetails,
            exams: examsResult.rows,
            training: trainingResult.rows,
            employmentHistory: historyResult.rows,
            otherInfo,
            references: referencesResult.rows,
            civil_status: employee.civil_status || "-",
            citizenship: employee.citizenship || "-",
            religion: employee.religion || "-",
            blood_type: employee.blood_type || "-",
            address: employee.address ? (typeof employee.address === 'string' ? JSON.parse(employee.address) : employee.address) : {}
        });
    }

    return enrichedEmployees;
};


// Utility to auto-adjust column widths based on content
export const autoAdjustColumnWidth = (worksheet) => {
    worksheet.columns.forEach((column) => {

        // Skip columns with manually set width
        if (column.width) return;

        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? cell.value.toString() : "";
            maxLength = Math.max(maxLength, cellValue.length);
        });

        column.width = Math.min(maxLength + 2, 50); // Cap at 50 for very long values
    });
};

// Helper function to format dates
const formatPHDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    }).format(date);
};

// Helper function to extract name from JSONB
const extractName = (nameObj) => {
    if (!nameObj) return "-";
    if (typeof nameObj === 'string') {
        try {
            nameObj = JSON.parse(nameObj);
        } catch {
            return nameObj;
        }
    }
    return `${nameObj.last_name || ''} ${nameObj.first_name || ''}`.trim() || "-";
};

// Helper function to extract children name from JSONB
const extractChildrenName = (childrenNameObj) => {
    if (!childrenNameObj) return "-";
    
    // If it's a string, try to parse it
    if (typeof childrenNameObj === 'string') {
        try {
            childrenNameObj = JSON.parse(childrenNameObj);
        } catch {
            return childrenNameObj;
        }
    }
    
    // If it's an object with name field
    if (typeof childrenNameObj === 'object') {
        if (childrenNameObj.name) return childrenNameObj.name;
        if (childrenNameObj.last_name && childrenNameObj.first_name) {
            
            return formatFullName(childrenNameObj);

        }
        // If it's an array with name field
        if (Array.isArray(childrenNameObj) && childrenNameObj.length > 0) {
            return childrenNameObj.map(item => item.name || item).join(", ");
        }
    }
    
    return "-";
};

// Helper function to extract address from JSONB
const formatAddress = (address) => {
    if (!address) return null

    const parts = [
        address.house_no,
        address.street,
        address.barangay,
        address.city,
        address.province,
        address.zip,
    ].filter((part) => part !== null && part !== undefined && String(part).trim() !== "")

    return parts.length > 0 ? parts.join(", ") : "N/A";
}

// Helper function to generate organized filename with date, time, and day
const generateOrganizedFilename = () => {
    const now = new Date();
    
    // Format: YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Format: HH-MM-SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}-${minutes}-${seconds}`;
    
    // Get day name
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[now.getDay()];
    
    return `employees-pds-report-${dateStr}-${timeStr}-${dayName}.xlsx`;
};

// Helper to aggregate array data with separator
const aggregateData = (items, separator = " | ") => {
    if (!items || items.length === 0) return "-";
    return items.map(item => {
        if (typeof item === 'object') {
            if (item.children_name) return item.children_name;
            if (item.major_name) return item.major_name;
            if (item.minor_name) return item.minor_name;
            if (item.honor_name) return item.honor_name;
            if (item.scholarship_name) return item.scholarship_name;
            if (item.title) return item.title;
            return JSON.stringify(item);
        }
        return item;
    }).join(separator);
};

// Generate comprehensive Excel file with PDS data
export const generateExcelFile = async (rows, res) => {
    // Enrich employees with PDS data
    const enrichedEmployees = await enrichEmployeeDataWithPDS(rows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employee PDS Report");

    // Define comprehensive columns
    worksheet.columns = [
        // Basic Information
        { header: "Employee No", key: "employee_no", width: 15 },
        { header: "Last Name", key: "last_name", width: 18 },
        { header: "First Name", key: "first_name", width: 18 },
        { header: "Middle Name", key: "middle_name", width: 18 },
        { header: "Name Extension", key: "name_extension", width: 12 },
        
        // Personal Data
        { header: "Sex", key: "sex", width: 10 },
        { header: "Birth Date", key: "birth_date", width: 15 },
        { header: "Civil Status", key: "civil_status", width: 15 },
        { header: "Citizenship", key: "citizenship", width: 15 },
        { header: "Religion", key: "religion", width: 15 },
        { header: "Blood Type", key: "blood_type", width: 12 },
        { header: "Address", key: "address", width: 40 },
        { header: "Email", key: "email", width: 25 },
        { header: "Contact Number", key: "contact_number", width: 18 },
        
        // Employment Information
        { header: "Employment Type", key: "employment_type", width: 15 },
        { header: "Status", key: "employment_status", width: 15 },
        { header: "Employment Basis", key: "employment_basis", width: 15 },
        { header: "Date Hired", key: "date_hired", width: 15 },
        { header: "Position", key: "positionName", width: 25 },
        { header: "Designation", key: "designationName", width: 25 },
        { header: "Salary", key: "salary", width: 15 },
        { header: "Official Working Hours", key: "official_working_hours", width: 18 },
        { header: "Other Employment", key: "other_employment", width: 25 },
        { header: "Other Employment Hours", key: "other_employment_working_hours", width: 18 },
        
        // Government IDs
        { header: "SSS No.", key: "sss", width: 18 },
        { header: "PAGIBIG No.", key: "pagibig", width: 18 },
        { header: "Tax No.", key: "tax", width: 18 },
        { header: "PhilHealth No.", key: "philhealth", width: 18 },
        { header: "PERAA No.", key: "peraa", width: 18 },
        
        // Family Background
        { header: "Spouse", key: "spouseName", width: 25 },
        { header: "Spouse Occupation", key: "spouse_occupation", width: 25 },
        { header: "Children", key: "children_aggregated", width: 40 },
        { header: "Nearest Kin", key: "nearest_kin_name_formatted", width: 25 },
        { header: "Nearest Kin Address", key: "nearest_kin_address_formatted", width: 40 },
        { header: "Nearest Kin Contact", key: "nearest_kin_contact_number", width: 18 },
        
        // Education
        { header: "Educational Qualifications", key: "education_aggregated", width: 50 },
        { header: "Majors", key: "majors_aggregated", width: 40 },
        { header: "Minors", key: "minors_aggregated", width: 40 },
        { header: "Honors", key: "honors_aggregated", width: 40 },
        { header: "Scholarships", key: "scholarships_aggregated", width: 40 },
        
        // Examinations & Training
        { header: "Examinations Taken", key: "exams_aggregated", width: 50 },
        { header: "Training Programs", key: "training_aggregated", width: 50 },
        
        // Employment History
        { header: "Employment History", key: "history_aggregated", width: 50 },
        
        // Other Information
        { header: "Criminal Case", key: "criminal_case", width: 30 },
        { header: "Administrative Offense", key: "admin_offense", width: 30 },
        { header: "Employment Separation", key: "employment_separation", width: 30 },
        
        // References
        { header: "References", key: "references_aggregated", width: 50 },
    ];

    // Transform and enrich rows for export
    const exportRows = enrichedEmployees.map((emp) => {
        // Aggregate children with proper name extraction
        const childrenData = emp.children?.map(c => 
            `${formatFullName(c.children_name)} (DOB: ${formatPHDate(c.birth_date)})`
        ) || [];

        // Aggregate education
        const educationData = emp.education?.map(e =>
            `${e.title} from ${e.school} (${e.year_finished || 'ongoing'})`
        ) || [];

        // Aggregate majors, minors, honors, scholarships
        const allMajors = emp.education?.flatMap(e => e.majors || []) || [];
        const allMinors = emp.education?.flatMap(e => e.minors || []) || [];
        const allHonors = emp.education?.flatMap(e => e.honors || []) || [];
        const allScholarships = emp.education?.flatMap(e => e.scholarships || []) || [];

        // Aggregate exams
        const examsData = emp.exams?.map(e =>
            `${e.title} (${formatPHDate(e.date_taken)}) - Rating: ${e.rating || 'N/A'}`
        ) || [];

        // Aggregate training
        const trainingData = emp.training?.map(t =>
            `${t.title} at ${t.place || 'N/A'} (${formatPHDate(t.date_from)} to ${formatPHDate(t.date_to)}) - ${t.hours || 'N/A'} hours`
        ) || [];

        // Aggregate employment history
        const historyData = emp.employmentHistory?.map(h =>
            `${h.position} at ${h.employer} (${formatPHDate(h.start_date)} to ${formatPHDate(h.end_date)})`
        ) || [];

        // Aggregate references
        const referencesData = emp.references?.map(r =>
            `${formatFullName(r.name)} - ${formatAddress(r.address)}`
        ) || [];

        return {
            // Basic Info
            employee_no: emp.employee_no || "-",
            last_name: emp.last_name || "-",
            first_name: emp.first_name || "-",
            middle_name: emp.middle_name || "-",
            name_extension: emp.name_extension || "-",
            
            // Personal Data
            sex: emp.sex || "-",
            birth_date: formatPHDate(emp.birth_date),
            civil_status: emp.civil_status || "-",
            citizenship: emp.citizenship || "-",
            religion: emp.religion || "-",
            blood_type: emp.blood_type || "-",
            address: formatAddress(emp.address),
            email: emp.email || "-",
            contact_number: emp.contact_number || "-",
            
            // Employment
            employment_type: emp.employment_type || "-",
            employment_status: emp.employment_status || "-",
            employment_basis: emp.employment_basis || "-",
            date_hired: formatPHDate(emp.date_hired),
            positionName: emp.positionName || "-",
            designationName: emp.designationName || "-",
            salary: emp.salary || "-",
            official_working_hours: emp.official_working_hours || "-",
            other_employment: emp.other_employment || "-",
            other_employment_working_hours: emp.other_employment_working_hours || "-",
            
            // Government IDs
            sss: emp.sss || "-",
            pagibig: emp.pagibig || "-",
            tax: emp.tax || "-",
            philhealth: emp.philhealth || "-",
            peraa: emp.peraa || "-",
            
            // Family
            spouseName: emp.spouseName || "-",
            spouse_occupation: emp.spouse_occupation || "-",
            children_aggregated: childrenData.length > 0 ? childrenData.join(" | ") : "-",
            nearest_kin_name_formatted: formatFullName(emp.nearest_kin_name),
            nearest_kin_address_formatted: formatAddress(emp.nearest_kin_address),
            nearest_kin_contact_number: emp.nearest_kin_contact_number || "-",
            
            // Education
            education_aggregated: educationData.length > 0 ? educationData.join(" | ") : "-",
            majors_aggregated: allMajors.length > 0 ? allMajors.join(" | ") : "-",
            minors_aggregated: allMinors.length > 0 ? allMinors.join(" | ") : "-",
            honors_aggregated: allHonors.length > 0 ? allHonors.join(" | ") : "-",
            scholarships_aggregated: allScholarships.length > 0 ? allScholarships.join(" | ") : "-",
            
            // Exams & Training
            exams_aggregated: examsData.length > 0 ? examsData.join(" | ") : "-",
            training_aggregated: trainingData.length > 0 ? trainingData.join(" | ") : "-",
            
            // History
            history_aggregated: historyData.length > 0 ? historyData.join(" | ") : "-",
            
            // Other Info
            criminal_case: emp.otherInfo?.has_criminal_case ? `Yes: ${emp.otherInfo?.criminal_case_details || 'N/A'}` : "No",
            admin_offense: emp.otherInfo?.has_admin_offense ? `Yes: ${emp.otherInfo?.admin_offense_details || 'N/A'}` : "No",
            employment_separation: emp.otherInfo?.was_separated_employment ? `Yes: ${emp.otherInfo?.separation_details || 'N/A'}` : "No",
            
            // References
            references_aggregated: referencesData.length > 0 ? referencesData.join(" | ") : "-",
        };
    });

    worksheet.addRows(exportRows);

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF366092" }
    };

    // Set row height for header
    worksheet.getRow(1).height = 25;

    // Apply text wrapping to data rows
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.alignment = { wrapText: true, vertical: "top" };
        }
    });

    // Auto-adjust column widths
    autoAdjustColumnWidth(worksheet);

    // Create Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");

    const totalEmployees = enrichedEmployees.length;
    const dateGenerated = new Date().toLocaleString();

    summarySheet.addRow(["HRIS Employees Report - PDS Format"]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total Employees:", totalEmployees]);
    summarySheet.addRow(["Date Generated:", dateGenerated]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Report includes comprehensive PDS (Personal Data Sheet) information:"]);
    summarySheet.addRow(["• Personal Data, Family Background, and Address Information"]);
    summarySheet.addRow(["• Employment Data, Position, Designation, and Salary Information"]);
    summarySheet.addRow(["• Government ID Numbers (SSS, PAGIBIG, Tax, PhilHealth, PERAA)"]);
    summarySheet.addRow(["• Educational Qualifications with Majors, Minors, Honors, and Scholarships"]);
    summarySheet.addRow(["• Examinations Taken and Training Programs Attended"]);
    summarySheet.addRow(["• Employment History and Family Information"]);
    summarySheet.addRow(["• Other Information and References"]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Note: Multiple items in a field are separated by |"]);

    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getRow(3).font = { bold: true };
    summarySheet.getRow(6).font = { bold: true };

    autoAdjustColumnWidth(summarySheet);

    // Set response headers for file download
    const filename = generateOrganizedFilename();
    
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}`
    );

    await workbook.xlsx.write(res);
    res.end();

};