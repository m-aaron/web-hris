import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Get active positions
// @route   GET /api/positions
// @access  Private
export const getPositions = asyncHandler(async (_req, res) => {

    const positionsResult = await pool.query(
        `SELECT 
            id, name, description AS descriptions
        FROM positions
        WHERE is_active = TRUE
        ORDER BY name ASC`
    );

    res.status(200).json({
        message: "Positions fetched successfully.",
        success: true,
        positions: positionsResult.rows,
    });

});

// @desc    Create position
// @route   POST /api/positions
// @access  Private
export const createPosition = asyncHandler(async (req, res) => {

    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Position name is required.", success: false });
    }

    const existingResult = await pool.query(
        `SELECT id FROM positions WHERE LOWER(name) = LOWER($1)`
        , [normalizedName]
    );

    if (existingResult.rowCount > 0) {
        return res.status(409).json({ message: "Position name already exists.", success: false });
    }

    const createResult = await pool.query(
        `INSERT INTO positions (name, description)
        VALUES ($1, $2)
        RETURNING *`,
        [normalizedName, normalizedDescriptions]
    );

    if (createResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to create position.", success: false });
    }

    res.status(201).json({
        message: "Position created successfully.",
        success: true,
        position: createResult.rows[0],
    });

});

// @desc    Update position
// @route   PATCH /api/positions/:id
// @access  Private
export const updatePosition = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { name, descriptions } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedDescriptions = String(descriptions || "").trim();

    if (!normalizedName) {
        return res.status(400).json({ message: "Position name is required.", success: false });
    }

    const positionResult = await pool.query(
        `SELECT id FROM positions WHERE id = $1`,
        [id]
    );

    if (positionResult.rowCount === 0) {
        return res.status(404).json({ message: "Position not found.", success: false });
    }

    const duplicateResult = await pool.query(
        `SELECT id FROM positions WHERE LOWER(name) = LOWER($1) AND id <> $2`,
        [normalizedName, id]
    );

    if (duplicateResult.rowCount > 0) {
        return res.status(409).json({ message: "Position name already exists.", success: false });
    }

    const updateResult = await pool.query(
        `UPDATE positions
        SET name = $1, description = $2
        WHERE id = $3
        RETURNING *`,
        [normalizedName, normalizedDescriptions, id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update position.", success: false });
    }

    res.status(200).json({
        message: "Position updated successfully.",
        success: true,
        position: updateResult.rows[0],
    });

});

// @desc    Soft delete position
// @route   DELETE /api/positions/:id
// @access  Private
export const deletePosition = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const positionResult = await pool.query(
        `SELECT id FROM positions WHERE id = $1`,
        [id]
    );

    if (positionResult.rowCount === 0) {
        return res.status(404).json({ message: "Position not found.", success: false });
    }

    const linkedResult = await pool.query(
        `SELECT COUNT(*) FROM employment_data WHERE position_id = $1`,
        [id]
    );

    const linkedCount = Number(linkedResult.rows[0]?.count || 0);

    if (linkedCount > 0) {
        return res.status(400).json({
            message: "Cannot delete - employees are linked to this position",
            success: false,
        });
    }

    const deleteResult = await pool.query(
        `UPDATE positions
        SET is_active = FALSE
        WHERE id = $1
        RETURNING *`,
        [id]
    );

    if (deleteResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to delete position.", success: false });
    }

    res.status(200).json({
        message: "Position deleted successfully.",
        success: true,
    });

});
