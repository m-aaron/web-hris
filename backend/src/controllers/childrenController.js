import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save child information for an employee
// @route   POST /api/employees/:id/children
// @access  Private
export const saveChild = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { lastName, firstName, middleName, nameExtension, birthDate, office, occupation } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!lastName || !firstName) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    // If employee does not exist
    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    const query = 
    `
        INSERT INTO childrens (employee_id, children_name, birth_date, office_school, occupation)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const childNameObj = {
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName || '',
        name_extension: nameExtension || ''
    };

    const result = await pool.query(query, [id, childNameObj, birthDate || null, office || '', occupation || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save child information.", success: false });
    };

    res.status(201).json({ message: "Child information saved successfully.", success: true, child: result.rows[0] });
});