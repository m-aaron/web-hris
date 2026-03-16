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
// @route   PUT /api/employees/:employeeId/education/:qualificationId
// @access  Private
export const updateEducationalQualification = asyncHandler(async (req, res) => {

    const { employeeId, qualificationId } = req.params;
    const { title, school, yearStarted, yearFinished } = req.body;

    // Validate required fields
    if (!title || !school) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
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
        UPDATE educational_qualifications
        SET 
            title = $1, 
            school = $2, 
            year_started = $3, 
            year_finished = $4
        WHERE employee_id = $5 AND id = $6
        RETURNING *
    `;

    const result = await pool.query(query, [title, school, yearStarted || null, yearFinished || null, employeeId, qualificationId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update educational qualification.", success: false });
    };

    res.status(201).json({ message: "Educational qualification updated successfully.", success: true, qualification: result.rows[0] });

});

// @desc    Delete educational qualification for an employee
// @route   DELETE /api/employees/:employeeId/education/:qualificationId
// @access  Private
export const deleteEducationalQualification = asyncHandler(async (req, res) => {

    const { employeeId, qualificationId } = req.params;

    const query = `
        DELETE FROM educational_qualifications
        WHERE employee_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [employeeId, qualificationId]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Educational qualification not found.", success: false });
    }

    res.status(200).json({ message: "Educational qualification deleted successfully.", success: true });

});



// @desc    Save major for an employee
// @route   POST /api/employees/:educationId/major
// @access  Private
export const saveMajor = asyncHandler(async (req, res) => {

    const { educationId } = req.params;
    const { major } = req.body; 

    // Validate required fields
    if (!educationId) {
        return res.status(400).json({ message: "Education ID is required.", success: false });
    };
    if (!major) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if education exists
    const checkEducationResult = await pool.query(
        `SELECT 1 FROM educational_qualifications WHERE id = $1`,
        [educationId]
    );

    if (checkEducationResult.rows.length === 0) {
        return res.status(404).json({ message: "Educational qualification not found.", success: false });
    };

    const query = 
    `
        INSERT INTO education_majors (education_id, major_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [educationId, major]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save major.", success: false });
    };

    res.status(201).json({ message: "Major saved successfully.", success: true, major: result.rows[0] });

});

// @desc    Update major for an employee
// @route   PUT /api/employees/:educationId/major/:majorId
// @access  Private
export const updateMajor = asyncHandler(async (req, res) => {

    const { educationId, majorId } = req.params;
    const { major } = req.body; 

    // Validate required fields
    if (!major) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    const query = 
    `
        UPDATE education_majors 
        SET 
            major_name = $1
        WHERE education_id = $2 AND id = $3
         RETURNING *
    `;

    const result = await pool.query(query, [major, educationId, majorId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update major.", success: false });
    }

    res.status(201).json({ message: "Major updated successfully.", success: true, major: result.rows[0] });

});

// @desc    Delete major for an employee
// @route   DELETE /api/employees/:educationId/major/:majorId
// @access  Private
export const deleteMajor = asyncHandler(async (req, res) => {

    const { educationId, majorId } = req.params;

    const query = `
        DELETE FROM education_majors
        WHERE education_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [educationId, majorId]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Major not found.", success: false });
    }

    res.status(200).json({ message: "Major deleted successfully.", success: true });

});



// @desc    Save minor for an employee
// @route   POST /api/employees/:educationId/minor
// @access  Private
export const saveMinor = asyncHandler(async (req, res) => {

    const { educationId } = req.params;
    const { minor } = req.body; 

    // Validate required fields
    if (!educationId) {
        return res.status(400).json({ message: "Education ID is required.", success: false });
    };
    if (!minor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    // Check if education exists
    const checkEducationResult = await pool.query(
        `SELECT 1 FROM educational_qualifications WHERE id = $1`,
        [educationId]
    );

    if (checkEducationResult.rows.length === 0) {
        return res.status(404).json({ message: "Educational qualification not found.", success: false });
    };

    const query = 
    `
        INSERT INTO education_minors (education_id, minor_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [educationId, minor]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save minor.", success: false });
    }

    res.status(201).json({ message: "Minor saved successfully.", success: true, minor: result.rows[0] });

});

// @desc    Update minor for an employee
// @route   PUT /api/employees/:educationId/minor/:minorId
// @access  Private
export const updateMinor = asyncHandler(async (req, res) => {

    const { educationId, minorId } = req.params;
    const { minor } = req.body; 

    // Validate required fields
    if (!minor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    }

    const query = 
    `
        UPDATE education_minors 
        SET 
            minor_name = $1
        WHERE education_id = $2 AND id = $3
         RETURNING *
    `;

    const result = await pool.query(query, [minor, educationId, minorId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update minor.", success: false });
    }

    res.status(201).json({ message: "Minor updated successfully.", success: true, minor: result.rows[0] });

});

// @desc    Delete minor for an employee
// @route   DELETE /api/employees/:educationId/minor/:minorId
// @access  Private
export const deleteMinor = asyncHandler(async (req, res) => {

    const { educationId, minorId } = req.params;

    const query = `
        DELETE FROM education_minors
        WHERE education_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [educationId, minorId]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Minor not found.", success: false });
    }

    res.status(200).json({ message: "Minor deleted successfully.", success: true });

});



// @desc    Save honor for an employee
// @route   POST /api/employees/:educationId/honor
// @access  Private
export const saveHonor = asyncHandler(async (req, res) => {

    const { educationId } = req.params;
    const { honor } = req.body; 

    // Validate required fields
    if (!educationId) {
        return res.status(400).json({ message: "Education ID is required.", success: false });
    };
    if (!honor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if education exists
    const checkEducationResult = await pool.query(
        `SELECT 1 FROM educational_qualifications WHERE id = $1`,
        [educationId]
    );

    if (checkEducationResult.rows.length === 0) {
        return res.status(404).json({ message: "Educational qualification not found.", success: false });
    };

    const query = 
    `
        INSERT INTO education_honors (education_id, honor_name)
        VALUES ($1, $2)
         RETURNING *
    `;

    const result = await pool.query(query, [educationId, honor]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save honor.", success: false });
    };

    res.status(201).json({ message: "Honor saved successfully.", success: true, honor: result.rows[0] });

});

// @desc    Update honor for an employee
// @route   PUT /api/employees/:educationId/honor/:honorId
// @access  Private
export const updateHonor = asyncHandler(async (req, res) => {

    const { educationId, honorId } = req.params;
    const { honor } = req.body; 

    // Validate required fields
    if (!honor) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    const query = 
    `
        UPDATE education_honors 
        SET 
            honor_name = $1
        WHERE education_id = $2 AND id = $3
        RETURNING *
    `;

    const result = await pool.query(query, [honor, educationId, honorId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update honor.", success: false });
    };

    res.status(201).json({ message: "Honor updated successfully.", success: true, honor: result.rows[0] });

});

// @desc    Delete honor for an employee
// @route   DELETE /api/employees/:educationId/honor/:honorId
// @access  Private
export const deleteHonor = asyncHandler(async (req, res) => {

    const { educationId, honorId } = req.params;

    const query = `
        DELETE FROM education_honors
        WHERE education_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [educationId, honorId]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Honor not found.", success: false });
    }

    res.status(200).json({ message: "Honor deleted successfully.", success: true });

});



// @desc    Save scholarship for an employee
// @route   POST /api/employees/:educationId/scholarship
// @access  Private
export const saveScholarship = asyncHandler(async (req, res) => {

    const { educationId } = req.params;
    const { scholarship } = req.body; 

    // Validate required fields
    if (!educationId) {
        return res.status(400).json({ message: "Education ID is required.", success: false });
    };
    if (!scholarship) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    // Check if education exists
    const checkEducationResult = await pool.query(
        `SELECT 1 FROM educational_qualifications WHERE id = $1`,
        [educationId]
    );

    if (checkEducationResult.rows.length === 0) {
        return res.status(404).json({ message: "Educational qualification not found.", success: false });
    };

    const query = 
    `
        INSERT INTO education_scholarships (education_id, scholarship_name)
        VALUES ($1, $2)
        RETURNING *
    `;

    const result = await pool.query(query, [educationId, scholarship]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to save scholarship.", success: false });
    };

    res.status(201).json({ message: "Scholarship saved successfully.", success: true, scholarship: result.rows[0] });

});

// @desc    Update scholarship for an employee
// @route   PUT /api/employees/:educationId/scholarship/:scholarshipId
// @access  Private
export const updateScholarship = asyncHandler(async (req, res) => {

    const { educationId, scholarshipId } = req.params;
    const { scholarship } = req.body; 

    // Validate required fields
    if (!scholarship) {
        return res.status(400).json({ message: "Required fields are missing.", success: false });
    };

    const query = 
    `
        UPDATE education_scholarships 
        SET 
            scholarship_name = $1
        WHERE education_id = $2 AND id = $3
        RETURNING *
    `;

    const result = await pool.query(query, [scholarship, educationId, scholarshipId]);

    if (result.rowCount === 0) {
        return res.status(500).json({ message: "Failed to update scholarship.", success: false });
    };

    res.status(201).json({ message: "Scholarship updated successfully.", success: true, scholarship: result.rows[0] });

});

// @desc    Delete scholarship for an employee
// @route   DELETE /api/employees/:educationId/scholarship/:scholarshipId
// @access  Private
export const deleteScholarship = asyncHandler(async (req, res) => {

    const { educationId, scholarshipId } = req.params;

    const query = `
        DELETE FROM education_scholarships
        WHERE education_id = $1 AND id = $2
    `;

    const result = await pool.query(query, [educationId, scholarshipId]);    

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Scholarship not found.", success: false });
    }

    res.status(200).json({ message: "Scholarship deleted successfully.", success: true });

});