import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = asyncHandler(async (req, res) => {

    const { employee_no, employment_type } = req.body;

    // Validate required fields
    if (!employee_no || !employment_type) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    if (!["TEACHING", "NON_TEACHING"].includes(employment_type)) {
        return res.status(400).json({ message: "Invalid employment type. Must be 'TEACHING' or 'NON TEACHING'.", success: false });
    }

    // Check if employee number already exists
    const employeeNoResult = await pool.query(
        `SELECT 1 FROM employees WHERE employee_no = $1`,
        [employee_no]
    );

    // If employee number already exists, return conflict error
    if (employeeNoResult.rows.length > 0) {
        return res.status(409).json({ message: "Employee number already exists.", success: false });
    }

    // Insert new employee record
    const employeeResult = await pool.query(
        `
            INSERT INTO employees (employee_no, employment_type)
            VALUES ($1, $2)
            RETURNING id
        `,
        [employee_no, employment_type]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(500).json({ message: "Failed to create employee.", success: false });
    }

    res.status(201).json({ message: "Employee created successfully.", success: true, employee: employeeResult.rows[0] });
});