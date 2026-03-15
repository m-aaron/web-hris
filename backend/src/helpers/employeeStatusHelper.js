// This helper function checks if the employee has completed all required sections (identity, personal data, and employment data).
export const checkEmployeeCompletion = async (employeeId, pool) => {

    const identityResult = await pool.query(
        `SELECT employee_no, employment_type
        FROM employees
        WHERE id = $1`,
        [employeeId]
    );

    const personalResult = await pool.query(
        `SELECT 1
        FROM personal_data
        WHERE employee_id = $1`,
        [employeeId]
    );

    const employmentResult = await pool.query(
        `SELECT 1
        FROM employment_data
        WHERE employee_id = $1`,
        [employeeId]
    );

    const hasIdentity = identityResult.rows.length > 0;
    const hasPersonal = personalResult.rows.length > 0;
    const hasEmployment = employmentResult.rows.length > 0;

    return hasIdentity && hasPersonal && hasEmployment;

};

// This function checks if the employee has completed all required sections and updates their status to 'SUBMITTED' if they have.
export const updateEmployeeStatusIfComplete = async (employeeId, pool) => {

    const isComplete = await checkEmployeeCompletion(employeeId, pool);

    if (isComplete) {

        await pool.query(
            `UPDATE employees
            SET status = 'SUBMITTED'
            WHERE id = $1`,
            [employeeId]
        );

    }

};