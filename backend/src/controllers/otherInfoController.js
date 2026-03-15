import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";

import { updateEmployeeStatusIfComplete } from "../helpers/employeeStatusHelper.js";


// @desc    Save other information for an employee
// @route   PUT /api/employees/:id/other-info
// @access  Private
export const saveOtherInfo = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { 
        hasCriminalCase, criminalCaseDetails, 
        hasAdminOffense, adminOffenseDetails,
        wasSeparatedEmployment, separationDetails
    } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (hasCriminalCase === undefined || hasAdminOffense === undefined || wasSeparatedEmployment === undefined) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };
    if (typeof hasCriminalCase !== 'boolean' || typeof hasAdminOffense !== 'boolean' || typeof wasSeparatedEmployment !== 'boolean') {
        return res.status(400).json({ message: "Boolean fields must be true or false.", success: false });
    };

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    if (hasCriminalCase && !criminalCaseDetails) {
        return res.status(400).json({ message: "Criminal case details are required when hasCriminalCase is true.", success: false });
    };
    if (hasAdminOffense && !adminOffenseDetails) {
        return res.status(400).json({ message: "Admin offense details are required when hasAdminOffense is true.", success: false });
    };
    if (wasSeparatedEmployment && !separationDetails) {
        return res.status(400).json({ message: "Separation details are required when wasSeparatedEmployment is true.", success: false });
    };

    const query = 
    `
        INSERT INTO other_information (
            employee_id, 
            has_criminal_case, 
            criminal_case_details, 
            has_admin_offense, 
            admin_offense_details, 
            was_separated_employment, 
            separation_details)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (employee_id) 
        DO UPDATE SET
            has_criminal_case = EXCLUDED.has_criminal_case,
            criminal_case_details = EXCLUDED.criminal_case_details,
            has_admin_offense = EXCLUDED.has_admin_offense,
            admin_offense_details = EXCLUDED.admin_offense_details,
            was_separated_employment = EXCLUDED.was_separated_employment,
            separation_details = EXCLUDED.separation_details
        RETURNING *
    `;

    const result = await pool.query(query, [
        id, 
        Boolean(hasCriminalCase), hasCriminalCase ? criminalCaseDetails : null, 
        Boolean(hasAdminOffense), hasAdminOffense ? adminOffenseDetails : null, 
        Boolean(wasSeparatedEmployment), wasSeparatedEmployment ? separationDetails : null
    ]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save other information.", success: false });
    };

    await updateEmployeeStatusIfComplete(result.rows[0].employee_id, pool);

    res.status(201).json({ message: "Other information saved successfully.", success: true, otherInfo: result.rows[0] });

});