import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save family background information for an employee
// @route   PUT /api/employees/:employee_id/family
// @access  Private
export const saveFamilyBackground = asyncHandler(async (req, res) => {

    const { employee_id } = req.params;
    const { 
        spouseLName, 
        spouseFName, 
        spouseMName, 
        spouseNExtension, 
        spouse_occupation, 
        kinLName, 
        kinFName, 
        kinMName,
        kinNExtension,
        kin_house_no,
        kin_street,
        kin_barangay,
        kin_city,
        kin_province,
        kin_zip,
        kin_contact_number
    } = req.body;

    // Validate required fields
    if (!employee_id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }
    if (!spouseLName || !spouseFName || !kinLName || !kinFName || !kin_barangay || !kin_city || !kin_province) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [employee_id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    const query = 
    `
        INSERT INTO family_background (
            employee_id, 
            spouse, 
            spouse_occupation, 
            nearest_kin_name, 
            nearest_kin_address,
            nearest_kin_contact_number
        )VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (employee_id) 
        DO UPDATE SET
            spouse = EXCLUDED.spouse,
            spouse_occupation = EXCLUDED.spouse_occupation,
            nearest_kin_name = EXCLUDED.nearest_kin_name,
            nearest_kin_address = EXCLUDED.nearest_kin_address,
            nearest_kin_contact_number = EXCLUDED.nearest_kin_contact_number
    `;

    const spouseNameObj = {
        last_name: spouseLName,
        first_name: spouseFName,
        middle_name: spouseMName || '',
        name_extension: spouseNExtension || '',
    };

    const nearestKinName = {
        last_name: kinLName,
        first_name: kinFName,
        middle_name: kinMName || '',
        name_extension: kinNExtension || '',
    };

    const nearestKinAddress = {
        house_no: kin_house_no || '',
        street: kin_street || '',
        barangay: kin_barangay,
        city: kin_city,
        province: kin_province,
        zip: kin_zip || '',
    };

    const result =  await pool.query(query, [employee_id, spouseNameObj, spouse_occupation || '', nearestKinName, nearestKinAddress, kin_contact_number || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save family background.", success: false });
    };

    res.status(201).json({ message: "Family background saved successfully.", success: true });
});