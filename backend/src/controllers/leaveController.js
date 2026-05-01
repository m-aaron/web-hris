import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Get leave types
// @route   GET /api/leave/types
// @access  Private
export const getLeaveTypes = asyncHandler(async (req, res) => {

    const typesResult = await pool.query(
        `SELECT *
        FROM leave_types
        ORDER BY name ASC`
    );

    res.status(200).json({
        message: "Leave types fetched successfully.",
        success: true,
        leaveTypes: typesResult.rows
    });

});

// @desc    Get leave applications
// @route   GET /api/leave/applications
// @access  Private
export const getLeaveApplications = asyncHandler(async (req, res) => {

    const {
        status,
        leave_type_id,
        employee_id,
        date_from,
        date_to,
        page = 1,
        limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClauses = [];
    const values = [];
    let index = 1;

    const normalizedStatus = String(status || "").trim().toUpperCase();
    if (normalizedStatus && normalizedStatus !== "ALL") {
        whereClauses.push(`la.status = $${index}`);
        values.push(normalizedStatus);
        index += 1;
    }

    if (leave_type_id) {
        whereClauses.push(`la.leave_type_id = $${index}`);
        values.push(leave_type_id);
        index += 1;
    }

    if (employee_id) {
        whereClauses.push(`la.employee_id = $${index}`);
        values.push(employee_id);
        index += 1;
    }

    if (date_from) {
        whereClauses.push(`la.date_from >= $${index}`);
        values.push(date_from);
        index += 1;
    }

    if (date_to) {
        whereClauses.push(`la.date_to <= $${index}`);
        values.push(date_to);
        index += 1;
    }

    const whereQuery = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

    const dataQuery = 
        `
            SELECT
                la.id,
                la.employee_id,
                e.employee_no,
                lt.id AS leave_type_id,
                lt.name AS leave_type,
                la.date_filed,
                la.date_from,
                la.date_to,
                la.number_of_days,
                la.reason,
                la.status,
                la.remarks,
                la.created_at,
                la.updated_at,
                pd.first_name,
                pd.middle_name,
                pd.last_name,
                pd.name_extension
            FROM leave_applications la
            LEFT JOIN employees e ON e.id = la.employee_id
            LEFT JOIN personal_data pd ON pd.employee_id = e.id
            LEFT JOIN leave_types lt ON lt.id = la.leave_type_id
            ${whereQuery}
            ORDER BY la.created_at DESC
            LIMIT $${index}
            OFFSET $${index + 1}
        `;

    values.push(limit);
    values.push(offset);

    const applicationsResult = await pool.query(dataQuery, values);

    const countResult = await pool.query(
        `SELECT
        COUNT(*)
        FROM leave_applications la
        LEFT JOIN employees e ON e.id = la.employee_id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        LEFT JOIN leave_types lt ON lt.id = la.leave_type_id
        ${whereQuery}`,
        values.slice(0, values.length - 2)
    );

    res.status(200).json({
        message: "Leave applications fetched successfully.",
        success: true,
        applications: applicationsResult.rows,
        pagination: {
            total: Number(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(countResult.rows[0].count / limit)
        }
    });
    
});

// @desc    Create leave application
// @route   POST /api/leave/applications
// @access  Private
export const createLeaveApplication = asyncHandler(async (req, res) => {

    const {
        employee_id,
        leave_type_id,
        date_filed,
        date_from,
        date_to,
        number_of_days,
        reason
    } = req.body;

    // Validate required fields
    if (!employee_id || !leave_type_id || !date_from || !date_to || !number_of_days) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    // Validate date filed if provided
    let parsedFiledDate = new Date();
    if (date_filed) {
        const parsedDateFiled = new Date(date_filed);
        if (Number.isNaN(parsedDateFiled.getTime())) {
            return res.status(400).json({ message: "Invalid date filed.", success: false });
        }
        parsedFiledDate = parsedDateFiled;
    }

    if (parsedFiledDate > new Date()) {
        return res.status(400).json({ message: "Date filed cannot be in the future.", success: false });
    }

    // Validate date formats and logic
    const parsedFrom = new Date(date_from);
    const parsedTo = new Date(date_to);
    if (Number.isNaN(parsedFrom.getTime()) || Number.isNaN(parsedTo.getTime())) {
        return res.status(400).json({ message: "Invalid leave dates.", success: false });
    }

    // Validate that date_to is not before date_from
    if (parsedTo < parsedFrom) {
        return res.status(400).json({ message: "Leave end date must be after or equal to start date.", success: false });
    }

    // Validate that number_of_days is a positive integer
    const parsedDays = Number(number_of_days);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
        return res.status(400).json({ message: "Number of days must be greater than 0.", success: false });
    }

    const employeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [employee_id]
    );

    if (employeeResult.rowCount === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    }

    const typeResult = await pool.query(
        `SELECT 1 FROM leave_types WHERE id = $1`,
        [leave_type_id]
    );

    if (typeResult.rowCount === 0) {
        return res.status(404).json({ message: "Leave type not found.", success: false });
    }

    const applicationResult = await pool.query(
        `INSERT INTO leave_applications (
            employee_id,
            leave_type_id,
            date_filed,
            date_from,
            date_to,
            number_of_days,
            reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [employee_id, leave_type_id, parsedFiledDate, date_from, date_to, parsedDays, reason || ""]
    );

    if (applicationResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to create leave application.", success: false });
    }

    res.status(201).json({
        message: "Leave application created successfully.",
        success: true,
        application: applicationResult.rows[0]
    });
});

// @desc    Approve leave application
// @route   PATCH /api/leave/applications/:id/approve
// @access  Private
export const approveLeaveApplication = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const remarks = req.body?.remarks;
    const remarksValue = String(remarks || "").trim();

    const checkApplicationResult = await pool.query(
        `SELECT id, status FROM leave_applications WHERE id = $1`,
        [id]
    );

    if (checkApplicationResult.rowCount === 0) {
        return res.status(404).json({ message: "Leave application not found.", success: false });
    }

    if (checkApplicationResult.rows[0].status !== "PENDING") {
        return res.status(409).json({ message: "Only pending applications can be approved.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE leave_applications
        SET 
            status = $1, 
            remarks = $2
        WHERE id = $3
        RETURNING *`,
        ["APPROVED", remarksValue || "", id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to approve leave application.", success: false });
    }

    res.status(200).json({
        message: "Leave application approved.",
        success: true,
        application: updateResult.rows[0]
    });
});

// @desc    Reject leave application
// @route   PATCH /api/leave/applications/:id/reject
// @access  Private
export const rejectLeaveApplication = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const remarks = req.body?.remarks;
    const remarksValue = String(remarks || "").trim();

    if (!remarksValue) {
        return res.status(400).json({ message: "Remarks are required for rejection.", success: false });
    }

    const checkApplicationResult = await pool.query(
        `SELECT id, status FROM leave_applications WHERE id = $1`,
        [id]
    );

    if (checkApplicationResult.rowCount === 0) {
        return res.status(404).json({ message: "Leave application not found.", success: false });
    }

    if (checkApplicationResult.rows[0].status !== "PENDING") {
        return res.status(409).json({ message: "Only pending applications can be rejected.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE leave_applications
        SET 
            status = $1, 
            remarks = $2
        WHERE id = $3
        RETURNING *`,
        ["REJECTED", remarksValue || "", id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to reject leave application.", success: false });
    }

    res.status(200).json({
        message: "Leave application rejected.",
        success: true,
        application: updateResult.rows[0]
    });

});

// @desc    Get leave balances
// @route   GET /api/leave/balances
// @access  Private
export const getLeaveBalances = asyncHandler(async (req, res) => {

    const { employee_id, year, page = 1, limit = 10 } = req.query;
    const targetYear = year ? Number.parseInt(year, 10) : new Date().getFullYear();

    const offset = (page - 1) * limit;

    if (!Number.isInteger(targetYear)) {
        return res.status(400).json({ message: "Invalid year filter.", success: false });
    }

    const whereClauses = [`lb.year = $1`];
    const values = [targetYear];
    let index = 2;

    if (employee_id) {
        whereClauses.push(`lb.employee_id = $${index}`);
        values.push(employee_id);
        index += 1;
    }

    const whereQuery = `WHERE ${whereClauses.join(" AND ")}`;

    const dataQuery = `SELECT
            lb.id,
            lb.employee_id,
            e.employee_no,
            pd.first_name,
            pd.middle_name,
            pd.last_name,
            pd.name_extension,
            lt.id AS leave_type_id,
            lt.name AS leave_type,
            lb.year,
            lb.total_entitlement,
            lb.used_days,
            lb.created_at,
            lb.updated_at
        FROM leave_balances lb
        LEFT JOIN employees e ON e.id = lb.employee_id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        LEFT JOIN leave_types lt ON lt.id = lb.leave_type_id
        ${whereQuery}
        ORDER BY pd.last_name ASC NULLS LAST, pd.first_name ASC NULLS LAST, lt.name ASC
        LIMIT $${index}
        OFFSET $${index + 1}`;

    values.push(limit);
    values.push(offset);

    const balancesResult = await pool.query(dataQuery, values);

    const countResult = await pool.query(
        `SELECT COUNT(*)
        FROM leave_balances lb
        LEFT JOIN employees e ON e.id = lb.employee_id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        LEFT JOIN leave_types lt ON lt.id = lb.leave_type_id
        ${whereQuery}`,
        values.slice(0, values.length - 2)
    );

    res.status(200).json({
        message: "Leave balances fetched successfully.",
        success: true,
        balances: balancesResult.rows,
        pagination: {
            total: Number(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(countResult.rows[0].count / limit)
        }
    });

});

// @desc    Update leave balance
// @route   PATCH /api/leave/balances/:id
// @access  Private
export const updateLeaveBalance = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { total_entitlement, used_days } = req.body;

    if (total_entitlement === undefined || used_days === undefined) {
        return res.status(400).json({ message: "Total entitlement and used days are required.", success: false });
    }

    const totalEntitlementValue = Number(total_entitlement);
    const usedDaysValue = Number(used_days);

    if (
        !Number.isFinite(totalEntitlementValue) ||
        !Number.isFinite(usedDaysValue) ||
        totalEntitlementValue < 0 ||
        usedDaysValue < 0
    ) {
        return res.status(400).json({ message: "Total entitlement and used days must be 0 or greater.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE leave_balances
        SET total_entitlement = $1, used_days = $2
        WHERE id = $3
        RETURNING *`,
        [totalEntitlementValue, usedDaysValue, id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(404).json({ message: "Leave balance not found.", success: false });
    }

    res.status(200).json({
        message: "Leave balance updated successfully.",
        success: true,
        balance: updateResult.rows[0]
    });

});

// @desc    Get leave summary for employee
// @route   GET /api/leave/summary/:employeeId
// @access  Private
export const getLeaveSummary = asyncHandler(async (req, res) => {
    
    const { employeeId } = req.params;
    const targetYear = new Date().getFullYear();

    if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }

    const [balancesResult, applicationsResult] = await Promise.all([
        pool.query(
            `SELECT
                lb.id,
                lb.leave_type_id,
                lt.name AS leave_type,
                lb.year,
                lb.total_entitlement,
                lb.used_days
            FROM leave_balances lb
            LEFT JOIN leave_types lt ON lt.id = lb.leave_type_id
            WHERE lb.employee_id = $1 AND lb.year = $2
            ORDER BY lt.name ASC`,
            [employeeId, targetYear]
        ),
        pool.query(
            `SELECT
                la.id,
                la.leave_type_id,
                lt.name AS leave_type,
                la.date_from,
                la.date_to,
                la.number_of_days,
                la.reason,
                la.status,
                la.created_at
            FROM leave_applications la
            LEFT JOIN leave_types lt ON lt.id = la.leave_type_id
            WHERE la.employee_id = $1
            ORDER BY la.created_at DESC
            LIMIT 3`,
            [employeeId]
        )
    ]);

    res.status(200).json({
        message: "Leave summary fetched successfully.",
        success: true,
        balances: balancesResult.rows,
        recentApplications: applicationsResult.rows
    });
});