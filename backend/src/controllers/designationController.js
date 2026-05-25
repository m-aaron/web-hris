import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Get all designations (active and inactive)
// @route   GET /api/designations
// @access  Private
export const getDesignations = asyncHandler(async (_req, res) => {

    const designationsResult = await pool.query(
        `SELECT 
            id, name, description AS descriptions, is_active
        FROM designations
        ORDER BY name ASC`
    );

    res.status(200).json({
        message: "Designations fetched successfully.",
        success: true,
        designations: designationsResult.rows,
    });

});

// @desc    Get only active designations for dropdowns
// @route   GET /api/designations/active
// @access  Public
export const getActiveDesignations = asyncHandler(async (_req, res) => {
    const result = await pool.query(
        `SELECT id, name
       FROM designations
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );

    res.status(200).json({
        message: "Active designations fetched successfully.",
        success: true,
        designations: result.rows,
    });
});

// @desc    Create designation
// @route   POST /api/designations
// @access  Private
export const createDesignation = asyncHandler(async (req, res) => {

    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Designation name is required.", success: false });
    }

    const existingResult = await pool.query(
        `SELECT id FROM designations WHERE LOWER(name) = LOWER($1)`
        , [normalizedName]
    );

    if (existingResult.rowCount > 0) {
        return res.status(409).json({ message: "Designation name already exists.", success: false });
    }

    const createResult = await pool.query(
        `INSERT INTO designations (name, description, is_active)
        VALUES ($1, $2, true)
        RETURNING id, name, description AS descriptions, is_active`,
        [normalizedName, normalizedDescriptions]
    );

    if (createResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to create designation.", success: false });
    }

    res.status(201).json({
        message: "Designation created successfully.",
        success: true,
        designation: createResult.rows[0],
    });

});

// @desc    Update designation
// @route   PATCH /api/designations/:id
// @access  Private
export const updateDesignation = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Designation name is required.", success: false });
    }

    const designationResult = await pool.query(
        `SELECT id FROM designations WHERE id = $1`,
        [id]
    );

    if (designationResult.rowCount === 0) {
        return res.status(404).json({ message: "Designation not found.", success: false });
    }

    const duplicateResult = await pool.query(
        `SELECT id FROM designations WHERE LOWER(name) = LOWER($1) AND id <> $2`,
        [normalizedName, id]
    );

    if (duplicateResult.rowCount > 0) {
        return res.status(409).json({ message: "Designation name already exists.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE designations
        SET name = $1, description = $2
        WHERE id = $3
        RETURNING id, name, description AS descriptions, is_active`,
        [normalizedName, normalizedDescriptions, id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update designation.", success: false });
    }

    res.status(200).json({
        message: "Designation updated successfully.",
        success: true,
        designation: updateResult.rows[0],
    });

});

// @desc    Toggle designation active/inactive status
// @route   PATCH /api/designations/:id/toggle-active
// @access  Private
export const toggleDesignationActive = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const designationResult = await pool.query(
        `SELECT id, is_active FROM designations WHERE id = $1`,
        [id]
    );

    if (designationResult.rowCount === 0) {
        return res.status(404).json({ message: "Designation not found.", success: false });
    }

    const currentActive = designationResult.rows[0].is_active;
    const newActive = !currentActive;

    const toggleResult = await pool.query(
        `UPDATE designations
        SET is_active = $1
        WHERE id = $2
        RETURNING id, name, description AS descriptions, is_active`,
        [newActive, id]
    );

    if (toggleResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update designation status.", success: false });
    }

    const action = newActive ? "activated" : "deactivated";

    res.status(200).json({
        message: `Designation ${action} successfully.`,
        success: true,
        designation: toggleResult.rows[0],
    });

});

// @desc    Delete designation (hard delete — only if no linked employees)
// @route   DELETE /api/designations/:id
// @access  Private
export const deleteDesignation = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const designationResult = await pool.query(
        `SELECT id FROM designations WHERE id = $1`,
        [id]
    );

    if (designationResult.rowCount === 0) {
        return res.status(404).json({ message: "Designation not found.", success: false });
    }

    const linkedResult = await pool.query(
        `SELECT COUNT(*) FROM employment_data WHERE designation_id = $1`,
        [id]
    );

    const linkedCount = Number(linkedResult.rows[0]?.count || 0);

    if (linkedCount > 0) {
        return res.status(400).json({
            message: "Cannot delete — employees are linked to this designation. Deactivate it instead.",
            success: false,
        });
    }

    await pool.query(`DELETE FROM designations WHERE id = $1`, [id]);

    res.status(200).json({
        message: "Designation deleted successfully.",
        success: true,
    });

});
