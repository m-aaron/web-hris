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

// @desc    Update department
// @route   PATCH /api/departments/:id
// @access  Private
export const updateDepartment = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { name, description } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescription = String(description || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Department name is required.", success: false });
    }

    const departmentResult = await pool.query(
        `SELECT id FROM departments WHERE id = $1`,
        [id]
    );

    if (departmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Department not found.", success: false });
    }

    const duplicateResult = await pool.query(
        `SELECT id FROM departments WHERE LOWER(name) = LOWER($1) AND id <> $2`,
        [normalizedName, id]
    );

    if (duplicateResult.rowCount > 0) {
        return res.status(409).json({ message: "Department name already exists.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE departments SET name = $1, description = $2
        WHERE id = $3
        RETURNING *`,
        [normalizedName, normalizedDescription, id]
    );      

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update department.", success: false });
    }

    res.status(200).json({
        message: "Department updated successfully.",
        success: true,
        department: updateResult.rows[0],
    });

});

// @desc    Soft delete department
// @route   DELETE /api/departments/:id
// @access  Private
export const deleteDepartment = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const departmentResult = await pool.query(
        `SELECT id FROM departments WHERE id = $1`,
        [id]
    );

    if (departmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Department not found.", success: false });
    }

    const linkedResult = await pool.query(
        `SELECT COUNT(*) FROM faculties WHERE department_id = $1`,
        [id]
    );

    const linkedCount = Number(linkedResult.rows[0]?.count || 0);

    if (linkedCount > 0) {
        return res.status(400).json({
            message: "Cannot delete - employees are linked to this department",
            success: false,
        });
    }

    const deleteResult = await pool.query(
        `UPDATE departments
            SET is_active = FALSE
        WHERE id = $1
        RETURNING *`,
        [id]
    );

    if (deleteResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to delete department.", success: false });
    }

    res.status(200).json({
        message: "Department deleted successfully.",
        success: true,
    });

});
