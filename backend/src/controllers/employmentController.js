import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save employment data for an employee
// @route   PUT /api/employees/:id/employment
// @access  Private
export const saveEmploymentData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        dateHired, 
        position, 
        designation, 
        sss,
        pagibig,
        tax,
        philhealth,
        peraa,
        employmentStatus,
        employmentBasis,
        workingHours,
        otherEmployment,
        otherWorkingHours
    } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!dateHired || !position || !employmentStatus || !employmentBasis) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    // Check if position exists
    const checkPositionResult = await pool.query(
        `SELECT id FROM positions WHERE name = $1`,
        [position]
    );

    if (checkPositionResult.rows.length === 0) {
        return res.status(404).json({ message: "Position not found.", success: false });
    };

    let checkDesignationResult;
    
    // Check if designation exists
    if (designation) {
        checkDesignationResult = await pool.query(
            `SELECT id FROM designations WHERE name = $1`,
            [designation]
        );

        if (checkDesignationResult.rows.length === 0) {
            return res.status(404).json({ message: "Designation not found.", success: false });
        };
    };

    // Validate employment status
    if (!["REGULAR", "PROBATIONARY", "CONTRACTUAL", "RESIGNED"].includes(employmentStatus)) {
        return res.status(400).json({ message: "Invalid employment status. Must be 'REGULAR', 'PROBATIONARY', 'CONTRACTUAL', or 'RESIGNED'.", success: false });
    };

    const query = 
    `
        INSERT INTO employment_data (
            employee_id,
            date_hired,
            position_id,
            designation_id,
            sss,
            pagibig,
            tax,
            philhealth,
            peraa,
            employment_status,
            employment_basis,
            official_working_hours,
            other_employment,
            other_employment_working_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (employee_id) 
        DO UPDATE SET
            date_hired = EXCLUDED.date_hired,
            position_id = EXCLUDED.position_id,
            designation_id = EXCLUDED.designation_id,
            sss = EXCLUDED.sss,
            pagibig = EXCLUDED.pagibig,
            tax = EXCLUDED.tax,
            philhealth = EXCLUDED.philhealth,
            peraa = EXCLUDED.peraa,
            employment_status = EXCLUDED.employment_status,
            employment_basis = EXCLUDED.employment_basis,
            official_working_hours = EXCLUDED.official_working_hours,
            other_employment = EXCLUDED.other_employment,
            other_employment_working_hours = EXCLUDED.other_employment_working_hours
    `

    const result = await pool.query(query, [
        id,
        dateHired,
        checkPositionResult.rows[0].id,
        checkDesignationResult ? checkDesignationResult.rows[0].id : null,
        sss || '',
        pagibig || '',
        tax || '',
        philhealth || '',
        peraa || '',
        employmentStatus,
        employmentBasis,
        workingHours || null,
        otherEmployment || '',
        otherWorkingHours || null
    ]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save employment data.", success: false });
    }

    res.status(200).json({ message: "Employment data saved successfully.", success: true });
});
