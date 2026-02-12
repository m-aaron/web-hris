import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save reference information for an employee
// @route   POST /api/employees/:id/reference
// @access  Private
export const saveReference = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { 
        lastName, firstName, middleName, nameExtension, 
        houseNo, street, barangay, city, province, zip, 
        contactNumber 
    } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!lastName || !firstName) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };
    if (houseNo || street || barangay || city || province || zip) {
        if (!barangay || !city || !province) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        };
    };

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    const nameObj = {
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName ? middleName : '',
        name_extension: nameExtension ? nameExtension : ''
    };

    const addressObj = {
        house_no: houseNo ? houseNo : '',
        street: street ? street : '',
        barangay: barangay ? barangay : '',
        city: city ? city : '',
        province: province ? province : '',
        zip: zip ? zip : ''
    };

    const query = 
    `
        INSERT INTO employee_references (employee_id, name, address, contact_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await pool.query(query, [id, nameObj, addressObj, contactNumber]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save reference.", success: false });
    };

    res.status(201).json({ message: "Reference saved successfully.", success: true, reference: result.rows[0] });

});