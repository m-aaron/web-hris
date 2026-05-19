import asyncHandler from 'express-async-handler';
import pool from '../configs/dbConfig.js';


export const createFaculty = asyncHandler(async (req, res) => {

    const { employee, department, academicQualification, teachingLoad } = req.body;

    const normalizedAcademicQualification = String(academicQualification || "").trim();
    const normalizedTeachingLoad = String(teachingLoad || "").trim();

    if (!employee) {
        return res.status(400).json({ message: 'Employee are required' });
    }

    const existingResult = await pool.query(
        `SELECT id FROM employees WHERE id = $1`
        , [employee]
    );

    if (existingResult.rowCount === 0) {
        return res.status(404).json({ message: 'Employee not found.' });
    }

    if (department) {
        const deptResult = await pool.query(
            `SELECT id FROM departments WHERE id = $1`
            , [department]
        );
        if (deptResult.rowCount === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }
    }

    const createResult = await pool.query(
        `INSERT INTO faculty (employee_id, department_id, academic_qualification, teaching_load)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [employee, department, normalizedAcademicQualification, normalizedTeachingLoad]
    );

    res.status(201).json({
        message: "Faculty member created successfully.",
        success: true,
        faculty: createResult.rows[0],
    });

});