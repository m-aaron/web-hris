import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Get active departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = asyncHandler(async (req, res) => {

    const departmentsResult = await pool.query(
        `SELECT 
            id, name, description
        FROM departments
        WHERE is_active = TRUE
        ORDER BY name ASC`
    );

    res.status(200).json({
        message: "Departments fetched successfully.",
        success: true,
        departments: departmentsResult.rows,
    }); 

});

// @desc    Create department
// @route   POST /api/departments
// @access  Private
export const createDepartment = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescription = String(description || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Department name is required.", success: false });
    }

    const existingResult = await pool.query(
        `SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`
        , [normalizedName]
    );

    if (existingResult.rowCount > 0) {
        return res.status(409).json({ message: "Department name already exists.", success: false });
    }

    const createResult = await pool.query(
        `INSERT INTO departments (name, description)
        VALUES ($1, $2)    
        RETURNING *`,
        [normalizedName, normalizedDescription]
    );

    if (createResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to create department.", success: false });
    }

    res.status(201).json({
        message: "Department created successfully.",
        success: true,
        department: createResult.rows[0],
    });

});