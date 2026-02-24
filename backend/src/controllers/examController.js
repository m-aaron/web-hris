import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save examination taken for an employee
// @route   POST /api/employees/:id/examination-taken
// @access  Private
export const saveExaminationTaken = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { title, dateTaken, rating } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!title || !dateTaken) {
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

    const query = 
    `
        INSERT INTO examinations_taken (employee_id, title, date_taken, rating)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await pool.query(query, [id, title, dateTaken, rating || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save examination taken.", success: false });
    };

    res.status(201).json({ message: "Examination taken saved successfully.", success: true, examinationTaken: result.rows[0] });

});

// @desc    Update examination taken for an employee
// @route   PUT /api/employees/:employeeId/examination-taken/:examId
// @access  Private
export const updateExaminationTaken = asyncHandler(async (req, res) => {

    const { employeeId, examId } = req.params;
    const { title, dateTaken, rating } = req.body;

    // Validate required fields
    if (!title || !dateTaken) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    const query = 
    `
        UPDATE examinations_taken 
        SET
            title = $1, 
            date_taken = $2, 
            rating = $3
        WHERE employee_id = $4 AND id = $5
        RETURNING *
    `;

    const result = await pool.query(query, [title, dateTaken, rating || '', employeeId, examId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update examination taken.", success: false });
    };

    res.status(200).json({ message: "Examination taken updated successfully.", success: true, examinationTaken: result.rows[0] });

});