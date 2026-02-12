import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import crypto from "crypto";


// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = asyncHandler(async (req, res) => {

    const { employeeNumber, employmentType } = req.body;

    // Validate required fields
    if (!employeeNumber || !employmentType) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    if (!["TEACHING", "NON_TEACHING"].includes(employmentType)) {
        return res.status(400).json({ message: "Invalid employment type. Must be 'TEACHING' or 'NON TEACHING'.", success: false });
    }

    // Check if employee number already exists
    const employeeNoResult = await pool.query(
        `SELECT 1 FROM employees WHERE employee_no = $1`,
        [employeeNumber]
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
        [employeeNumber , employmentType]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(500).json({ message: "Failed to create employee.", success: false });
    }

    res.status(201).json({ message: "Employee created successfully.", success: true, employee: employeeResult.rows[0] });
});

// @desc    Update employee photo
// @route   PUT /api/employees/:id/photo
// @access  Private
export const updateEmployeePhoto = asyncHandler(async (req, res) => {

    const { id } = req.params;

    // Check if file is uploaded
    if(!req.file) {
        return res.status(400).json({ message: "No file uploaded.", success: false });
    };

    // Check if employee exists
    const employeeResult = await pool.query(
        `SELECT photo_url FROM employees WHERE id = $1`,
        [id]
    );

    if (employeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    const oldPhotoUrl = employeeResult.rows[0].photo_url;

    // If there is an old photo, delete it from the server
    if (oldPhotoUrl) {
        const oldPhotoPath = path.join(process.cwd(), oldPhotoUrl);
        if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
        };
    };

    const fileName = crypto.randomUUID() + ".webp";
    const uploadDir = path.join("uploads", "profile");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    };

    const outputPath = path.join(uploadDir, fileName);

    // Process and save the image
    await sharp(req.file.buffer)        
        .resize(600, 600, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(outputPath);

    const photoUrl = `/uploads/profile/${fileName}`;

    const updateResult = await pool.query(
        `UPDATE employees SET photo_url = $1 WHERE id = $2`,
        [photoUrl, id]
    );

    if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update employee photo.", success: false });
    };
    
    res.status(200).json({ message: "Employee photo updated successfully.", success: true, photoUrl });

});
