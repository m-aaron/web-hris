import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save training program for an employee
// @route   POST /api/employees/:id/training
// @access  Private
export const saveTrainingProgram = asyncHandler(async (req, res) => { 

    const { id } = req.params;
    const { title, place, dateFrom, dateTo, hours, conductedBy } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!title || !place || !dateFrom) {
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
    if (dateFrom && (dateFrom < 1900 || dateFrom > new Date().getFullYear())) {
    return res.status(400).json({ message: "Invalid start year" });
    };
    if (dateTo && (dateTo < 1900 || dateTo > new Date().getFullYear())) {
    return res.status(400).json({ message: "Invalid end year" });
    };

    const query = 
    `
        INSERT INTO training_programs (employee_id, title, place, date_from, date_to, hours, conducted_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const result = await pool.query(query, [id, title, place || '', dateFrom, dateTo || null, hours || null, conductedBy || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save training program.", success: false });
    };

    res.status(201).json({ message: "Training program saved successfully.", success: true, trainingProgram: result.rows[0] });

});  

// @desc    Update training program for an employee
// @route   PUT /api/employees/:employeeId/training/:trainingId
// @access  Private
export const updateTrainingProgram = asyncHandler(async (req, res) => { 

    const { employeeId, trainingId } = req.params;
    const { title, place, dateFrom, dateTo, hours, conductedBy } = req.body;

    // Validate required fields
    if (!title || !place || !dateFrom) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Validate date fields
    if (dateFrom && (dateFrom < 1900 || dateFrom > new Date().getFullYear())) {
    return res.status(400).json({ message: "Invalid start year" });
    };
    if (dateTo && (dateTo < 1900 || dateTo > new Date().getFullYear())) {
    return res.status(400).json({ message: "Invalid end year" });
    };

    const query = 
    `
        UPDATE training_programs 
        SET  
            title = $1,
            place = $2, 
            date_from = $3, 
            date_to = $4,
            hours = $5,
            conducted_by = $6
        WHERE employee_id = $7 AND id = $8
        RETURNING *
    `;

    const result = await pool.query(query, [title, place || '', dateFrom, dateTo || null, hours || null, conductedBy || '', employeeId, trainingId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update training program.", success: false });
    };

    res.status(200).json({ message: "Training program updated successfully.", success: true, trainingProgram: result.rows[0] });

});  

// @desc    Delete training program for an employee
// @route   DELETE /api/employees/:employeeId/training/:trainingId
// @access  Private
export const deleteTrainingProgram = asyncHandler(async (req, res) => {

    const { employeeId, trainingId } = req.params;

    const query = `
        DELETE FROM training_programs
        WHERE employee_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [employeeId, trainingId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to delete training program.", success: false });
    };

    res.status(200).json({ message: "Training program deleted successfully.", success: true });

});