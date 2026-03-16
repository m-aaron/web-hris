import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";

// @desc    Save employment history for an employee
// @route   POST /api/employees/:id/employment-history
// @access  Private
export const saveEmploymentHistory = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { startDate, endDate, position, employer, salary, reasonForLeaving } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!startDate || !position || !employer) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    // Validate date fields
    if (startDate && (startDate < 1900 || startDate > new Date().getFullYear())) {
        return res.status(400).json({ message: "Invalid start year" });
    };
    if (endDate && (endDate < 1900 || endDate > new Date().getFullYear())) {
        return res.status(400).json({ message: "Invalid end year" });
    }

    const query = 
    `
        INSERT INTO employment_history (employee_id, start_date, end_date, position, employer, salary, reason_for_leaving)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const result = await pool.query(query, [id, startDate, endDate || null, position, employer, salary || null, reasonForLeaving || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save employment history.", success: false });
    };

    res.status(201).json({ message: "Employment history saved successfully.", success: true, employmentHistory: result.rows[0] });

});

// @desc    Update employment history for an employee
// @route   PUT /api/employees/:employeeId/employment-history/:historyId
// @access  Private
export const updateEmploymentHistory = asyncHandler(async (req, res) => {

    const { employeeId, historyId } = req.params;
    const { startDate, endDate, position, employer, salary, reasonForLeaving } = req.body;

    // Validate required fields
    if (!startDate || !position || !employer) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Validate date fields
    if (startDate && (startDate < 1900 || startDate > new Date().getFullYear())) {
        return res.status(400).json({ message: "Invalid start year" });
    };
    if (endDate && (endDate < 1900 || endDate > new Date().getFullYear())) {
        return res.status(400).json({ message: "Invalid end year" });
    }

    const query = 
    `
        UPDATE employment_history 
        SET
            start_date = $1, 
            end_date = $2, 
            position = $3, 
            employer = $4, 
            salary = $5,
            reason_for_leaving = $6
        WHERE employee_id = $7 AND id = $8
        RETURNING *
    `;

    const result = await pool.query(query, [startDate, endDate || null, position, employer, salary || null, reasonForLeaving || '', employeeId, historyId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update employment history.", success: false });
    };

    res.status(201).json({ message: "Employment history updated successfully.", success: true, employmentHistory: result.rows[0] });

});

// @desc    Delete employment history for an employee
// @route   DELETE /api/employees/:employeeId/employment-history/:historyId
// @access  Private
export const deleteEmploymentHistory = asyncHandler(async (req, res) => {

    const { employeeId, historyId } = req.params;

    const query = `
        DELETE FROM employment_history
        WHERE employee_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [employeeId, historyId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to delete employment history.", success: false });
    };

    res.status(200).json({ message: "Employment history deleted successfully.", success: true });

});