import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save educational qualification for an employee
// @route   POST /api/employees/:id/educational-qualification
// @access  Private
export const saveEducationalQualification = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { title, school, yearStarted, yearFinished } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!title || !school) {
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

    const currentYear = new Date().getFullYear();

    // Validate year started and year finished
    if (yearStarted && (yearStarted < 1900 || yearStarted > currentYear)) {
    return res.status(400).json({ message: "Invalid start year" });
    };
    if (yearFinished && (yearFinished < 1900 || yearFinished > currentYear)) {
        return res.status(400).json({ message: "Invalid finish year" });
    };

    const query = 
    `
        INSERT INTO educational_qualifications (employee_id, title, school, year_started, year_finished)
        VALUES ($1, $2, $3, $4, $5)
    `;

    const result = await pool.query(query, [id, title, school, yearStarted || null, yearFinished || null]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save educational qualification.", success: false });
    };

    res.status(201).json({ message: "Educational qualification saved successfully.", success: true });

});