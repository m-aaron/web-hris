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

// @desc    Update reference information for an employee
// @route   PUT /api/employees/:employeeId/reference/:referenceId
// @access  Private
export const updateReference = asyncHandler(async (req, res) => {

    const { employeeId, referenceId } = req.params;
    const { 
        lastName, firstName, middleName, nameExtension, 
        houseNo, street, barangay, city, province, zip, 
        contactNumber 
    } = req.body;

    // Validate required fields
    if (!lastName || !firstName) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };
    if (houseNo || street || barangay || city || province || zip) {
        if (!barangay || !city || !province) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        };
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
        UPDATE employee_references 
        SET
            name = $1,
            address = $2, 
            contact_number = $3
        WHERE employee_id = $4 AND id = $5
        RETURNING *
    `;

    const result = await pool.query(query, [nameObj, addressObj, contactNumber, employeeId, referenceId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update reference.", success: false });
    };

    res.status(200).json({ message: "Reference updated successfully.", success: true, reference: result.rows[0] });

});

// @desc    Delete reference information for an employee
// @route   DELETE /api/employees/:employeeId/reference/:referenceId
// @access  Private
export const deleteReference = asyncHandler(async (req, res) => {

    const { employeeId, referenceId } = req.params;

    const query = 
    `
        DELETE FROM employee_references 
        WHERE employee_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [employeeId, referenceId]);      
    
    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to delete reference.", success: false });
    };

    res.status(200).json({ message: "Reference deleted successfully.", success: true });

});