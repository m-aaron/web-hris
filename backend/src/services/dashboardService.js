import pool from "../configs/dbConfig.js";
import { TYPE, STATUS } from "../constants/employmentConstant.js";


// Dashboard Summary
export const getDashboardSummary = async (req, res) => {
    
    const result = await pool.query(`
        WITH base AS (
            SELECT 
                e.id,
                e.employment_type,
                pd.sex,
                pd.birth_date,
                ed.date_hired,
                ed.employment_status,

                CASE
                    WHEN e.employment_type = $1
                        THEN ed.date_hired + INTERVAL '3 years'
                    WHEN e.employment_type = $2
                        THEN ed.date_hired + INTERVAL '6 months'
                END AS regularization_date,

                -- Normalize birthday to current year
                MAKE_DATE(
                    EXTRACT(YEAR FROM CURRENT_DATE)::int,
                    EXTRACT(MONTH FROM pd.birth_date)::int,
                    EXTRACT(DAY FROM pd.birth_date)::int
                ) AS birthday_this_year

            FROM employees e
            LEFT JOIN personal_data pd ON e.id = pd.employee_id
            LEFT JOIN employment_data ed ON e.id = ed.employee_id
            WHERE e.status = 'SUBMITTED'
        )

        SELECT
            COUNT(*) AS total_employees,

            COUNT(*) FILTER (WHERE employment_status = $3)
                AS total_active_probation,

            COUNT(*) FILTER (WHERE employment_status = $4)
                AS total_regular,

            COUNT(*) FILTER (
                WHERE regularization_date >= date_trunc('month', CURRENT_DATE)
                AND regularization_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
            ) AS total_upcoming_regular_this_month,

            COUNT(*) FILTER (
                WHERE EXTRACT(YEAR FROM regularization_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            ) AS total_upcoming_regular_this_year,

            COUNT(*) FILTER (
                WHERE regularization_date BETWEEN CURRENT_DATE 
                    AND CURRENT_DATE + INTERVAL '30 days'
            ) AS total_near_regularization_30_days,

            COUNT(*) FILTER (
                WHERE employment_status = $5
                AND regularization_date < CURRENT_DATE
            ) AS total_overdue_regularization,

            -- FIXED BIRTHDAY TODAY
            COUNT(*) FILTER (
                WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
            ) AS total_birthday_today,

            COUNT(*) FILTER (
                WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            ) AS total_birthday_this_month,

            -- YEAR-SAFE NEXT 7 DAYS
            COUNT(*) FILTER (
                WHERE (
                    birthday_this_year BETWEEN CURRENT_DATE 
                    AND CURRENT_DATE + INTERVAL '7 days'
                )
                OR (
                    birthday_this_year + INTERVAL '1 year'
                    BETWEEN CURRENT_DATE 
                    AND CURRENT_DATE + INTERVAL '7 days'
                )
            ) AS total_birthday_next_7_days,

            COUNT(*) FILTER (WHERE sex = 'MALE')
                AS total_male,

            COUNT(*) FILTER (WHERE sex = 'FEMALE')
                AS total_female,

            COUNT(*) FILTER (WHERE employment_type = $6)
                AS total_teaching,

            COUNT(*) FILTER (WHERE employment_type = $7)
                AS total_non_teaching

        FROM base;
    `,[
        TYPE.TEACHING,
        TYPE.NON_TEACHING,
        STATUS.PROBATIONARY,
        STATUS.REGULAR,
        STATUS.PROBATIONARY,
        TYPE.TEACHING,
        TYPE.NON_TEACHING
    ]); 

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "No data found" });
    };

    return result.rows[0];

};


export const getEmployeesBecomingRegularSoon = async () => {

    const result = await pool.query(`
        WITH base AS (
            SELECT 
                e.id,
                CONCAT(
                    pd.last_name, ', ',
                    pd.first_name,
                    CASE 
                        WHEN pd.middle_name IS NOT NULL AND pd.middle_name <> ''
                        THEN CONCAT(' ', LEFT(pd.middle_name, 1), '.')
                        ELSE ''
                    END
                ) AS full_name,
                e.employment_type,
                ed.employment_status,

                CASE
                    WHEN e.employment_type = $1
                        THEN ed.date_hired + INTERVAL '3 years'
                    WHEN e.employment_type = $2
                        THEN ed.date_hired + INTERVAL '6 months'
                END AS regularization_date

            FROM employees e
            JOIN employment_data ed ON e.id = ed.employee_id
            JOIN personal_data pd ON e.id = pd.employee_id
            WHERE e.status = 'SUBMITTED'
        )

        SELECT
            full_name,
            employment_type,
            regularization_date::date AS regularization_date,
            (regularization_date::date - CURRENT_DATE) AS days_remaining

        FROM base
        WHERE employment_status = $3
            AND regularization_date >= CURRENT_DATE
            AND regularization_date < CURRENT_DATE + INTERVAL '61 days'

        ORDER BY regularization_date ASC;
    `, [
        TYPE.TEACHING,
        TYPE.NON_TEACHING,
        STATUS.PROBATIONARY
    ]);

    return result.rows;
};


export const getRegularizationForecast = async () => {

    const result = await pool.query(`
        WITH base AS (
            SELECT
                e.employment_type,

                CASE
                    WHEN e.employment_type = '${TYPE.TEACHING}'
                        THEN ed.date_hired + INTERVAL '3 years'
                    WHEN e.employment_type = '${TYPE.NON_TEACHING}'
                        THEN ed.date_hired + INTERVAL '6 months'
                END AS regularization_date

            FROM employees e
            JOIN employment_data ed ON e.id = ed.employee_id
            WHERE e.status = 'SUBMITTED'
                AND ed.employment_status = '${STATUS.PROBATIONARY}'
        ),

        months AS (
            SELECT generate_series(
                date_trunc('month', CURRENT_DATE),
                date_trunc('month', CURRENT_DATE) + INTERVAL '11 months',
                INTERVAL '1 month'
            ) AS month_start
        )

        SELECT
            TO_CHAR(m.month_start, 'Mon YYYY') AS month,

            COUNT(*) FILTER (
                WHERE b.employment_type = '${TYPE.TEACHING}'
                    AND b.regularization_date >= m.month_start
                    AND b.regularization_date < m.month_start + INTERVAL '1 month'
            ) AS teaching,

            COUNT(*) FILTER (
                WHERE b.employment_type = '${TYPE.NON_TEACHING}'
                    AND b.regularization_date >= m.month_start
                    AND b.regularization_date < m.month_start + INTERVAL '1 month'
            ) AS non_teaching

        FROM months m
        LEFT JOIN base b
            ON b.regularization_date >= m.month_start
            AND b.regularization_date < m.month_start + INTERVAL '1 month'

        GROUP BY m.month_start
        ORDER BY m.month_start;
    `);

    return result.rows;
};


export const getBirthdaysToday = async () => {
    const result = await pool.query(`
        SELECT
            CONCAT(
                pd.last_name, ', ',
                pd.first_name,
                CASE 
                    WHEN pd.middle_name IS NOT NULL 
                        AND pd.middle_name <> ''
                    THEN CONCAT(' ', LEFT(pd.middle_name, 1), '.')
                    ELSE ''
                END
            ) AS full_name,

            CASE
                WHEN e.employment_type = '${TYPE.TEACHING}'
                    THEN 'Teaching'
                WHEN e.employment_type = '${TYPE.NON_TEACHING}'
                    THEN 'Non-teaching'
            END AS employment_type,

            TO_CHAR(pd.birth_date, 'Mon DD') AS birth_date

        FROM employees e
        JOIN personal_data pd ON e.id = pd.employee_id
        WHERE e.status = 'SUBMITTED'
            AND EXTRACT(MONTH FROM pd.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM pd.birth_date) = EXTRACT(DAY FROM CURRENT_DATE)

        ORDER BY pd.last_name ASC;
    `);

    return result.rows;
};
