import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save family background information for an employee
// @route   PUT /api/employees/:id/family
// @access  Private
export const saveFamilyBackground = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { 
        spouseLName, 
        spouseFName, 
        spouseMName, 
        spouseNExtension, 
        spouseOccupation, 
        kinLName, 
        kinFName, 
        kinMName,
        kinNExtension,
        kinHouseNo,
        kinStreet,
        kinBarangay,
        kinCity,
        kinProvince,
        kinZip,
        kinContactNumber
    } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }
    if (spouseLName || spouseFName || spouseMName || spouseNExtension) {
        if (!spouseLName || !spouseFName) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }
    if (kinLName || kinFName || kinMName || kinNExtension) {
        if (!kinLName || !kinFName) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }
    if (kinHouseNo || kinStreet || kinBarangay || kinCity || kinProvince || kinZip) {
        if (!kinBarangay || !kinCity || !kinProvince) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
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
        RETURNING *
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
        house_no: kinHouseNo || '',
        street: kinStreet || '',
        barangay: kinBarangay,
        city: kinCity,
        province: kinProvince,
        zip: kinZip || '',
    };

    const result =  await pool.query(query, [id, spouseNameObj, spouseOccupation || '', nearestKinName, nearestKinAddress, kinContactNumber || '']);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save family background.", success: false });
    };

    res.status(201).json({ message: "Family background saved successfully.", success: true, familyBackground: result.rows[0] });
});

// @desc    Update family background information for an employee
// @route   PUT /api/employees/:id/family/update
// @access  Private
export const updateFamilyBackground = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { 
        spouseLName, 
        spouseFName, 
        spouseMName, 
        spouseNExtension, 
        spouseOccupation, 
        kinLName, 
        kinFName, 
        kinMName,
        kinNExtension,
        kinHouseNo,
        kinStreet,
        kinBarangay,
        kinCity,
        kinProvince,
        kinZip,
        kinContactNumber
    } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    }
    if (spouseLName || spouseFName || spouseMName || spouseNExtension) {
        if (!spouseLName || !spouseFName) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }
    if (kinLName || kinFName || kinMName || kinNExtension) {
        if (!kinLName || !kinFName) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }
    if (kinHouseNo || kinStreet || kinBarangay || kinCity || kinProvince || kinZip) {
        if (!kinBarangay || !kinCity || !kinProvince) {
            return res.status(400).json({ message: "Required fields are missing.", success: false });
        }
    }

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    // Check if family background exists
    const checkFamilyResult = await pool.query(
        `SELECT 1 FROM family_background WHERE employee_id = $1`,
        [id]
    );

    // If no family background record exists, create one first
    if (checkFamilyResult.rows.length === 0) {
        await pool.query(
            `INSERT INTO family_background (employee_id) VALUES ($1)`,
            [id]
        );
    }

    const query = 
    `
        UPDATE family_background 
        SET
            spouse = $1, 
            spouse_occupation = $2,
            nearest_kin_name = $3,
            nearest_kin_address = $4,
            nearest_kin_contact_number = $5
        WHERE employee_id = $6
        RETURNING *
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
        house_no: kinHouseNo || '',
        street: kinStreet || '',
        barangay: kinBarangay,
        city: kinCity,
        province: kinProvince,
        zip: kinZip || '',
    };

    const result =  await pool.query(query, 
        [
            spouseNameObj, 
            spouseOccupation || '', 
            nearestKinName, 
            nearestKinAddress, 
            kinContactNumber || '', 
            id
        ]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update family background.", success: false });
    };

    res.status(200).json({ message: "Family background updated successfully.", success: true, familyBackground: result.rows[0] });
});