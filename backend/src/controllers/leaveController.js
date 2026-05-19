import asyncHandler from "express-async-handler";
import pool from "../configs/dbConfig.js";


// @desc    Get active leave types
// @route   GET /api/leave/types
// @access  Private (ADMIN, HR)
export const getLeaveTypes = asyncHandler(async (req, res) => {
    const result = await pool.query(`SELECT id, name, is_active FROM leave_types WHERE is_active = true ORDER BY id`);
    res.status(200).json({ leaveTypes: result.rows });
});


// @desc    Get leave applications with filters
// @route   GET /api/leave/applications
// @access  Private (ADMIN, HR)
export const getLeaveApplications = asyncHandler(async (req, res) => {
    const {
        status,
        employee_id,
        date_from,
        date_to,
        page = 1,
        limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (status) {
        whereClauses.push(`la.status = $${idx++}`);
        values.push(String(status).toUpperCase());
    }

    if (employee_id) {
        whereClauses.push(`la.employee_id = $${idx++}`);
        values.push(employee_id);
    }

    if (date_from) {
        whereClauses.push(`la.date_filed >= $${idx++}`);
        values.push(date_from);
    }

    if (date_to) {
        whereClauses.push(`la.date_filed <= $${idx++}`);
        values.push(date_to);
    }

    const whereQuery = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const dataQuery = `
        SELECT
            la.id,
            la.employee_id,
            e.employee_no,
            pd.first_name,
            pd.last_name,
            pd.middle_name,
            pd.name_extension,
            e.employment_type,
            la.date_filed,
            la.reason,
            la.department_unit,
            la.substitute_name,
            la.status,
            la.remarks,
            STRING_AGG(DISTINCT lt.name, ', ') AS leave_types_display,
            COALESCE(SUM(lat.number_of_days), 0) AS total_days
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        LEFT JOIN personal_data pd ON e.id = pd.employee_id
        -- substitute_name stored on la.substitute_name (text), no join to employees
        LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
        LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
        ${whereQuery}
        GROUP BY la.id, e.employee_no, pd.first_name, pd.last_name, pd.middle_name, pd.name_extension, e.employment_type, la.date_filed, la.reason, la.department_unit, la.substitute_name, la.status, la.remarks
        ORDER BY la.date_filed DESC
        LIMIT $${idx++}
        OFFSET $${idx++}
    `;

    values.push(limit);
    values.push(offset);

    const dataResult = await pool.query(dataQuery, values);

    // count
    const countQuery = `
        SELECT COUNT(DISTINCT la.id) AS total
        FROM leave_applications la
        ${whereQuery}
    `;

    const countValues = values.slice(0, values.length - 2);
    const countResult = await pool.query(countQuery, countValues);

    res.status(200).json({
        applications: dataResult.rows,
        pagination: {
            total: Number(countResult.rows[0]?.total || 0),
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(Number(countResult.rows[0]?.total || 0) / Number(limit))
        }
    });
});


// @desc    Get single leave application detail
// @route   GET /api/leave/applications/:id
// @access  Private (ADMIN, HR)
export const getLeaveApplicationById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const appQuery = `
        SELECT la.*, e.employee_no, e.employment_type,
            pd.first_name, pd.last_name, pd.middle_name, pd.name_extension,
            ed.position_id, p.name AS position
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        LEFT JOIN personal_data pd ON e.id = pd.employee_id
        LEFT JOIN employment_data ed ON e.id = ed.employee_id
        LEFT JOIN positions p ON ed.position_id = p.id
        WHERE la.id = $1
        LIMIT 1
    `;

    const appResult = await pool.query(appQuery, [id]);
    if (appResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Leave application not found." });
    }

    const application = appResult.rows[0];

    const typesQuery = `
        SELECT lat.id, lat.leave_application_id, lat.leave_type_id, lt.name AS leave_type_name,
            lat.date_from, lat.date_to, lat.number_of_days, lat.other_leave_details
        FROM leave_application_types lat
        LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
        WHERE lat.leave_application_id = $1
        ORDER BY lat.date_from
    `;

    const typesResult = await pool.query(typesQuery, [id]);

    res.status(200).json({
        application,
        leaveTypes: typesResult.rows
    });
});


// @desc    Create a leave application (with types)
// @route   POST /api/leave/applications
// @access  Private (ADMIN, HR)
export const createLeaveApplication = asyncHandler(async (req, res) => {
    const {
        employee_id,
        date_filed,
        reason,
        department_unit,
        substitute_name,
        subjects_covered,
        remarks,
        leave_types
    } = req.body;

    if (!employee_id) {
        return res.status(400).json({ success: false, message: 'Employee is required' });
    }

    if (!Array.isArray(leave_types) || leave_types.length === 0) {
        return res.status(400).json({ success: false, message: 'Leave Type is required' });
    }

    // validate each leave type
    // fetch leave type names to validate 'Others' properly
    const typeIds = leave_types.map((lt) => Number(lt.leave_type_id)).filter(Boolean);
    let typeMap = {};
    if (typeIds.length > 0) {
        const typesRes = await pool.query(`SELECT id, name FROM leave_types WHERE id = ANY($1::int[])`, [typeIds]);
        for (const row of typesRes.rows) {
            typeMap[row.id] = row.name;
        }
    }

    for (const lt of leave_types) {
        if (!lt.leave_type_id) return res.status(400).json({ success: false, message: 'Leave ID is required for each leave type' });
        if (!lt.date_from || !lt.date_to) return res.status(400).json({ success: false, message: 'Date from and Date to are required for each leave type' });
        if (new Date(lt.date_to) < new Date(lt.date_from)) return res.status(400).json({ success: false, message: 'Date to must be >= Date from' });
        if (!(Number(lt.number_of_days) > 0)) return res.status(400).json({ success: false, message: 'Number of days must be > 0' });

        const typeName = typeMap[Number(lt.leave_type_id)] || "";
        if (String(typeName).toLowerCase() === 'others' && !lt.other_leave_details) {
            return res.status(400).json({ success: false, message: 'Other leave details is required for Others leave type' });
        }
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertAppQuery = `
            INSERT INTO leave_applications (employee_id, date_filed, reason, department_unit, substitute_name, subjects_covered, remarks)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
            RETURNING *
        `;

        // Ensure subjects_covered is proper JSON string for the JSONB column
        let subjectsParam = null;
        if (subjects_covered) {
            try {
                let parsed = null;
                if (typeof subjects_covered === 'string') {
                    parsed = JSON.parse(subjects_covered);
                } else {
                    parsed = subjects_covered;
                }
                // stringify to ensure we always send valid JSON text to Postgres
                subjectsParam = JSON.stringify(parsed);
            } catch (e) {
                throw new Error('Invalid subjects_covered JSON payload');
            }
        }

        const appResult = await client.query(insertAppQuery, [
            employee_id,
            date_filed || new Date(),
            reason || null,
            department_unit || null,
            // substitute_name text (optional)
            substitute_name || null,
            subjectsParam,
            remarks || null
        ]);

        const appId = appResult.rows[0].id;

        const insertTypeQuery = `
            INSERT INTO leave_application_types (leave_application_id, leave_type_id, date_from, date_to, number_of_days, other_leave_details)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const lt of leave_types) {
            await client.query(insertTypeQuery, [
                appId,
                lt.leave_type_id,
                lt.date_from,
                lt.date_to,
                lt.number_of_days,
                lt.other_leave_details || null
            ]);
        }

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'Leave application created.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating leave application:', error?.message || error);
        // Return error details for dev troubleshooting
        return res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
    } finally {
        client.release();
    }
});


// @desc    Update a leave application (replace types and update fields)
// @route   PATCH /api/leave/applications/:id
// @access  Private (ADMIN, HR)
export const updateLeaveApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        employee_id,
        date_filed,
        reason,
        department_unit,
        substitute_name,
        subjects_covered,
        remarks,
        leave_types
    } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Application id is required' });
    }

    if (!employee_id) {
        return res.status(400).json({ success: false, message: 'Employee is required' });
    }

    if (!Array.isArray(leave_types) || leave_types.length === 0) {
        return res.status(400).json({ success: false, message: 'Leave Type is required' });
    }

    // validate leave types similar to create
    const typeIds = leave_types.map((lt) => Number(lt.leave_type_id)).filter(Boolean);
    let typeMap = {};
    if (typeIds.length > 0) {
        const typesRes = await pool.query(`SELECT id, name FROM leave_types WHERE id = ANY($1::int[])`, [typeIds]);
        for (const row of typesRes.rows) {
            typeMap[row.id] = row.name;
        }
    }

    for (const lt of leave_types) {
        if (!lt.leave_type_id) return res.status(400).json({ success: false, message: 'Leave ID is required for each leave type' });
        if (!lt.date_from || !lt.date_to) return res.status(400).json({ success: false, message: 'Date from and Date to are required for each leave type' });
        if (new Date(lt.date_to) < new Date(lt.date_from)) return res.status(400).json({ success: false, message: 'Date to must be >= Date from' });
        if (!(Number(lt.number_of_days) > 0)) return res.status(400).json({ success: false, message: 'Number of days must be > 0' });

        const typeName = typeMap[Number(lt.leave_type_id)] || "";
        if (String(typeName).toLowerCase() === 'others' && !lt.other_leave_details) {
            return res.status(400).json({ success: false, message: 'Other leave details is required for Others leave type' });
        }
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateAppQuery = `
            UPDATE leave_applications SET
                employee_id = $1,
                date_filed = $2,
                reason = $3,
                department_unit = $4,
                substitute_name = $5,
                subjects_covered = $6::jsonb,
                remarks = $7
            WHERE id = $8
            RETURNING *
        `;

        let subjectsParam = null;
        if (subjects_covered) {
            try {
                let parsed = null;
                if (typeof subjects_covered === 'string') parsed = JSON.parse(subjects_covered);
                else parsed = subjects_covered;
                subjectsParam = JSON.stringify(parsed);
            } catch (e) {
                throw new Error('Invalid subjects_covered JSON payload');
            }
        }

        const updateResult = await client.query(updateAppQuery, [
            employee_id,
            date_filed || new Date(),
            reason || null,
            department_unit || null,
            substitute_name || null,
            subjectsParam,
            remarks || null,
            id,
        ]);

        if (updateResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Leave application not found' });
        }

        // remove existing leave_application_types for this application
        await client.query(`DELETE FROM leave_application_types WHERE leave_application_id = $1`, [id]);

        const insertTypeQuery = `
            INSERT INTO leave_application_types (leave_application_id, leave_type_id, date_from, date_to, number_of_days, other_leave_details)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const lt of leave_types) {
            await client.query(insertTypeQuery, [
                id,
                lt.leave_type_id,
                lt.date_from,
                lt.date_to,
                lt.number_of_days,
                lt.other_leave_details || null,
            ]);
        }

        await client.query('COMMIT');

        res.status(200).json({ success: true, message: 'Leave application updated.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating leave application:', error?.message || error);
        return res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
    } finally {
        client.release();
    }
});


// @desc    Update leave status
// @route   PATCH /api/leave/applications/:id/status
// @access  Private (ADMIN, HR)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body || {};

    const allowed = ['PENDING', 'APPROVED', 'DISAPPROVED'];
    if (!status || !allowed.includes(String(status).toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await pool.query(
        `UPDATE leave_applications SET status = $1, remarks = $2 WHERE id = $3 RETURNING *`,
        [String(status).toUpperCase(), remarks || null, id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    res.status(200).json({ success: true, message: 'Status updated', data: result.rows[0] });
});


// @desc    Delete leave application
// @route   DELETE /api/leave/applications/:id
// @access  Private (ADMIN, HR)
export const deleteLeaveApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(`DELETE FROM leave_applications WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    res.status(200).json({ success: true, message: 'Leave application deleted' });
});


// @desc    Get leave summary (last 3) for an employee
// @route   GET /api/leave/summary/:employeeId
// @access  Private (ADMIN, HR)
export const getLeaveSummary = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    const query = `
        SELECT la.id, la.date_filed, la.status,
            STRING_AGG(DISTINCT lt.name, ', ') AS leave_types_display,
            COALESCE(SUM(lat.number_of_days),0) AS total_days
        FROM leave_applications la
        LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
        LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
        WHERE la.employee_id = $1
        GROUP BY la.id
        ORDER BY la.date_filed DESC
        LIMIT 3
    `;

    const result = await pool.query(query, [employeeId]);
    res.status(200).json({ recentApplications: result.rows });
});


// @desc    Get leave overview stats
// @route   GET /api/leave/overview
// @access  Private (ADMIN, HR)
export const getLeaveOverview = asyncHandler(async (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM leave_applications la WHERE date_trunc('month', COALESCE(la.date_filed, la.created_at)) = date_trunc('month', CURRENT_DATE))::int AS total_this_month,
            (SELECT COUNT(*) FROM leave_applications la WHERE la.status = 'PENDING')::int AS pending,
            (SELECT COUNT(*) FROM leave_applications la WHERE la.status = 'APPROVED' AND date_trunc('month', COALESCE(la.date_filed, la.created_at)) = date_trunc('month', CURRENT_DATE))::int AS approved_this_month,
            (SELECT COUNT(DISTINCT la2.id) FROM leave_applications la2 JOIN leave_application_types lat ON la2.id = lat.leave_application_id WHERE la2.status = 'APPROVED' AND lat.date_from <= CURRENT_DATE AND lat.date_to >= CURRENT_DATE)::int AS on_leave_today
    `;

    const result = await pool.query(sql);
    const row = result.rows[0] || {};

    res.status(200).json({
        success: true,
        stats: {
            totalThisMonth: Number(row.total_this_month || 0),
            pending: Number(row.pending || 0),
            approvedThisMonth: Number(row.approved_this_month || 0),
            onLeaveToday: Number(row.on_leave_today || 0),
        },
    });
});
