import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Get all departments (active and inactive)
// @route   GET /api/departments
// @access  Private
export const getDepartments = asyncHandler(async (req, res) => {

    const departmentsResult = await pool.query(
        `SELECT 
            id, name, description AS descriptions, is_active
        FROM departments
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

    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

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
        `INSERT INTO departments (name, description, is_active)
        VALUES ($1, $2, true)    
        RETURNING id, name, description AS descriptions, is_active`,
        [normalizedName, normalizedDescriptions]
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
    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

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
        RETURNING id, name, description AS descriptions, is_active`,
        [normalizedName, normalizedDescriptions, id]
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

// @desc    Toggle department active/inactive status
// @route   PATCH /api/departments/:id/toggle-active
// @access  Private
export const toggleDepartmentActive = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const departmentResult = await pool.query(
        `SELECT id, is_active FROM departments WHERE id = $1`,
        [id]
    );

    if (departmentResult.rowCount === 0) {
        return res.status(404).json({ message: "Department not found.", success: false });
    }

    const currentActive = departmentResult.rows[0].is_active;
    const newActive = !currentActive;

    const toggleResult = await pool.query(
        `UPDATE departments
        SET is_active = $1
        WHERE id = $2
        RETURNING id, name, description AS descriptions, is_active`,
        [newActive, id]
    );

    if (toggleResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update department status.", success: false });
    }

    const action = newActive ? "activated" : "deactivated";

    res.status(200).json({
        message: `Department ${action} successfully.`,
        success: true,
        department: toggleResult.rows[0],
    });

});

// @desc    Delete department (hard delete — only if no linked faculties)
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
            message: "Cannot delete — employees are linked to this department. Deactivate it instead.",
            success: false,
        });
    }

    await pool.query(`DELETE FROM departments WHERE id = $1`, [id]);

    res.status(200).json({
        message: "Department deleted successfully.",
        success: true,
    });

});
