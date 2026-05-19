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