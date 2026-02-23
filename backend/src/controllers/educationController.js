import pool from "../configs/dbConfig.js";
import asyncHandler from "express-async-handler";


// @desc    Save educational qualification for an employee
// @route   POST /api/employees/:id/education
// @access  Private
export const saveEducationalQualification = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { title, school, yearStarted, yearFinished } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!title || !school) {
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

    const currentYear = new Date().getFullYear();

    // Validate year started and year finished
    if (yearStarted && (yearStarted < 1900 || yearStarted > currentYear)) {
    return res.status(400).json({ message: "Invalid start year" });
    };
    if (yearFinished && (yearFinished < 1900 || yearFinished > currentYear)) {
        return res.status(400).json({ message: "Invalid finish year" });
    };

    const query = 
    `
        INSERT INTO educational_qualifications (employee_id, title, school, year_started, year_finished)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `;

    const result = await pool.query(query, [id, title, school, yearStarted || null, yearFinished || null]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save educational qualification.", success: false });
    };

    res.status(201).json({ message: "Educational qualification saved successfully.", success: true, qualification: result.rows[0] });

});

// @desc    Update educational qualification for an employee
// @route   PUT /api/employees/:id/education/update
// @access  Private
export const updateEducationalQualification = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { title, school, yearStarted, yearFinished } = req.body;

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!title || !school) {
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

    // Check if educational qualification exists for the employee
    const checkQualificationResult = await pool.query(
        `SELECT id FROM educational_qualifications WHERE employee_id = $1`,
        [id]
    );

    // If no educational qualification exists, return an error
    if (checkQualificationResult.rows.length === 0) {
        return res.status(404).json({ message: "Educational qualification not found for this employee.", success: false });
    }

    const currentYear = new Date().getFullYear();

    // Validate year started and year finished
    if (yearStarted && (yearStarted < 1900 || yearStarted > currentYear)) {
    return res.status(400).json({ message: "Invalid start year" });
    };
    if (yearFinished && (yearFinished < 1900 || yearFinished > currentYear)) {
        return res.status(400).json({ message: "Invalid finish year" });
    };

    const query = 
    `
        UPDATE educational_qualifications
        SET 
            title = $1, 
            school = $2, 
            year_started = $3, 
            year_finished = $4
        WHERE employee_id = $5 AND id = $6
        RETURNING *
    `;

    const result = await pool.query(query, [title, school, yearStarted || null, yearFinished || null, id, checkQualificationResult.rows[0].id]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update educational qualification.", success: false });
    };

    res.status(201).json({ message: "Educational qualification updated successfully.", success: true, qualification: result.rows[0] });

});

// @desc    Save major for an employee
// @route   POST /api/employees/:id/major
// @access  Private
export const saveMajor = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { major } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!major) {
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

    const query = 
    `
        INSERT INTO education_majors (employee_id, major_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [id, major]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save major.", success: false });
    };

    res.status(201).json({ message: "Major saved successfully.", success: true, major: result.rows[0] });

});

// @desc    Update major for an employee
// @route   POST /api/employees/:id/major/update
// @access  Private
export const updateMajor = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { major } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!major) {
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

    // Check if major exists for the employee
    const checkMajorResult = await pool.query(
        `SELECT id FROM education_majors WHERE employee_id = $1`,
        [id]
    );

    if (checkMajorResult.rows.length === 0) {
        return res.status(404).json({ message: "Major not found for this employee.", success: false });
    }

    const query = 
    `
        UPDATE education_majors 
        SET
            major_name = $1
        WHERE employee_id = $2 AND id = $3
         RETURNING *
    `;

    const result = await pool.query(query, [major, id, checkMajorResult.rows[0].id]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update major.", success: false });
    };

    res.status(201).json({ message: "Major updated successfully.", success: true, major: result.rows[0] });

});

// @desc    Save minor for an employee
// @route   POST /api/employees/:id/minor
// @access  Private
export const saveMinor = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { minor } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!minor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
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
        INSERT INTO education_minors (employee_id, minor_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [id, minor]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save minor.", success: false });
    }

    res.status(201).json({ message: "Minor saved successfully.", success: true, minor: result.rows[0] });

});

// @desc    Update minor for an employee
// @route   POST /api/employees/:id/minor/update
// @access  Private
export const updateMinor = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { minor } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!minor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    // Check if employee exists
    const checkEmployeeResult = await pool.query(
        `SELECT 1 FROM employees WHERE id = $1`,
        [id]
    );

    if (checkEmployeeResult.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found.", success: false });
    };

    // Check if minor exists for the employee
    const checkMinorResult = await pool.query(
        `SELECT id FROM education_minors WHERE employee_id = $1`,
        [id]
    );

    if (checkMinorResult.rows.length === 0) {
        return res.status(404).json({ message: "Minor not found for this employee.", success: false });
    }

    const query = 
    `
        UPDATE education_minors 
        SET 
            minor_name = $1
        WHERE employee_id = $2 AND id = $3
         RETURNING *
    `;

    const result = await pool.query(query, [minor, id, checkMinorResult.rows[0].id]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update minor.", success: false });
    }

    res.status(201).json({ message: "Minor updated successfully.", success: true, minor: result.rows[0] });

});

// @desc    Save honor for an employee
// @route   POST /api/employees/:id/honor
// @access  Private
export const saveHonor = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { honor } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!honor) {
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

    const query = 
    `
        INSERT INTO education_honors (employee_id, honor_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [id, honor]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save honor.", success: false });
    };

    res.status(201).json({ message: "Honor saved successfully.", success: true, honor: result.rows[0] });

});

// @desc    Save scholarship for an employee
// @route   POST /api/employees/:id/scholarship
// @access  Private
export const saveScholarship = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { scholarship } = req.body; 

    // Validate required fields
    if (!id) {
        return res.status(400).json({ message: "Employee ID is required.", success: false });
    };
    if (!scholarship) {
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

    const query = 
    `
        INSERT INTO education_scholarships (employee_id, scholarship_name)
        VALUES ($1, $2)
        RETURNING *
    `;

    const result = await pool.query(query, [id, scholarship]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save scholarship.", success: false });
    };

    res.status(201).json({ message: "Scholarship saved successfully.", success: true, scholarship: result.rows[0] });

});