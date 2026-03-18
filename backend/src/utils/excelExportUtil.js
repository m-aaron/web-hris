import ExcelJS from "exceljs";

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
    `;
    
    return { dataQuery, values };

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

        column.width = maxLength + 2;
    });
};


// Utility to generate Excel file from employee data
export const generateExcelFile = async (rows, res) => {

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

    const workbook = new ExcelJS.Workbook();

    // Create Employees Sheet
    const worksheet = workbook.addWorksheet("Employees");

    worksheet.columns = [
        { header: "Employee No", key: "employee_no", width: 15 },
        { header: "Last Name", key: "last_name", width: 24 },
        { header: "First Name", key: "first_name", width: 24 },
        { header: "Middle Name", key: "middle_name", width: 20 },
        { header: "Name Extension", key: "name_extension", width: 18 },
        { header: "Sex", key: "sex", width: 12 },

        // Fixed width for dates
        { header: "Birth Date", key: "birth_date", width: 15 },
        { header: "Type", key: "employment_type", width: 15 },
        { header: "Status", key: "employment_status", width: 15 },
        { header: "Basis", key: "employment_basis", width: 15 },
        { header: "Date Hired", key: "date_hired", width: 15 },
    ];

    const exportRows = rows.map((row) => ({
        ...row,
        birth_date: formatPHDate(row.birth_date),
        date_hired: formatPHDate(row.date_hired),
    }));

    worksheet.addRows(exportRows);

    // Bold header
    worksheet.getRow(1).font = { bold: true };

    // Auto column width
    autoAdjustColumnWidth(worksheet);

    // Create Summary Sheet
    const summarySheet = workbook.addWorksheet("Summary");

    const totalEmployees = rows.length;
    const dateGenerated = new Date().toLocaleString();

    summarySheet.addRow(["HRIS Employees Report"]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Total Employees:", totalEmployees]);
    summarySheet.addRow(["Date Generated:", dateGenerated]);

    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getRow(3).font = { bold: true };

    autoAdjustColumnWidth(summarySheet);

    // Set response headers for file download
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=employees-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

};