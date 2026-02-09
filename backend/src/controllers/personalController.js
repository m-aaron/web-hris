import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save personal information for an employee
// @route   PUT /api/employees/:employee_id/personal
// @access  Private
export const savePersonalInfo = asyncHandler(async (req, res) => {

    const { employee_id } = req.params;
    const {
        last_name,
        first_name,
        middle_name,
        name_extension,
        sex,
        birth_date,
        civil_status,
        citizenship,
        religion,
        blood_type,
        house_no,
        street,
        barangay,
        city,
        province,
        zip,
        email,
        contact_number,
    } = req.body;

    // Validate required fields
    if (!employee_id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }
    if (!last_name || !first_name || !sex || !birth_date || !civil_status || !citizenship || !religion ||!barangay || !city || !province || !zip) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [employee_id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    }

    // Validate sex
    if (!["MALE", "FEMALE"].includes(sex)) {
        return res.status(400).json({ message: "Invalid sex value. Must be 'MALE' or 'FEMALE'.", success: false });
    }

    const query = 
    `
        INSERT INTO personal_data (
            employee_id,
            last_name,
            first_name,
            middle_name,
            name_extension,
            sex,
            birth_date,
            civil_status,
            citizenship,
            religion,
            blood_type,
            address,
            email,
            contact_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (employee_id) 
        DO UPDATE SET
            last_name = EXCLUDED.last_name,
            first_name = EXCLUDED.first_name,
            middle_name = EXCLUDED.middle_name,
            name_extension = EXCLUDED.name_extension,
            sex = EXCLUDED.sex,
            birth_date = EXCLUDED.birth_date,
            civil_status = EXCLUDED.civil_status,
            citizenship = EXCLUDED.citizenship,
            religion = EXCLUDED.religion,
            blood_type = EXCLUDED.blood_type,
            address = EXCLUDED.address,
            email = EXCLUDED.email,
            contact_number = EXCLUDED.contact_number
    `;

    const addressObj = {
        house_no: house_no || '',
        street: street || '',
        barangay: barangay || '',
        city: city || '',
        province: province || '',
        zip: zip || ''
    };

    const result = await pool.query(query, [
        employee_id,
        last_name,
        first_name,
        middle_name,
        name_extension,
        sex,
        birth_date,
        civil_status,
        citizenship,
        religion,
        blood_type,
        addressObj,
        email,
        contact_number
    ]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save personal data.", success: false });
    }

    res.status(200).json({ message: "Personal data saved successfully.", success: true });
});