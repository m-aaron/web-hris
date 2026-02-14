import pool from "../src/configs/dbConfig.js";

const firstNames = [
    "Juan", "Maria", "Jose", "Ana", "Mark", "Angela",
    "Carlo", "Bea", "Miguel", "Sofia", "Paolo",
    "Rica", "Daniel", "Jasmine", "Kevin", "Patricia"
];

const lastNames = [
    "Dela Cruz", "Santos", "Reyes", "Garcia",
    "Mendoza", "Torres", "Flores", "Ramos",
    "Aquino", "Castro", "Villanueva", "Navarro"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        console.log("Clearing existing data...");

        // Clear child tables first
        await client.query(`TRUNCATE
        training_programs,
        educational_qualifications,
        employment_data,
        personal_data,
        employees
        RESTART IDENTITY CASCADE;
        `);

        console.log("Seeding positions & designations...");

        await client.query(`
        INSERT INTO positions (name, category)
        VALUES
        ('Professor I', 'TEACHING'),
        ('Professor II', 'TEACHING'),
        ('Registrar', 'NON_TEACHING'),
        ('HR Officer', 'NON_TEACHING'),
        ('Accounting Staff', 'NON_TEACHING')
        ON CONFLICT DO NOTHING;
        `);

        await client.query(`
        INSERT INTO designations (name)
        VALUES
        ('Department Head'),
        ('Coordinator'),
        ('Staff'),
        ('Assistant')
        ON CONFLICT DO NOTHING;
        `);

        console.log("Creating 30 employees...");

        for (let i = 1; i <= 30; i++) {
        const employeeResult = await client.query(`
            INSERT INTO employees (employee_no, employment_type, status)
            VALUES (
            'EMP-${String(i).padStart(4, "0")}',
            '${i <= 15 ? "TEACHING" : "NON_TEACHING"}',
            'SUBMITTED'
            )
            RETURNING id;
        `);

        const employeeId = employeeResult.rows[0].id;

        const firstName = randomItem(firstNames);
        const lastName = randomItem(lastNames);

        let birthDate;

        if (i <= 3) {
            birthDate = "CURRENT_DATE";
        } else if (i <= 8) {
            birthDate = `date_trunc('month', CURRENT_DATE) + interval '${Math.floor(
            Math.random() * 25
            )} days'`;
        } else {
            birthDate = `DATE '1985-01-01' + interval '${Math.floor(
            Math.random() * 10000
            )} days'`;
        }

        // Personal Data
        await client.query(`
            INSERT INTO personal_data (
            employee_id,
            last_name,
            first_name,
            sex,
            birth_date
            )
            VALUES (
            '${employeeId}',
            '${lastName}',
            '${firstName}',
            '${Math.random() > 0.5 ? "MALE" : "FEMALE"}',
            ${birthDate}
            );
        `);

        // Employment Data
        await client.query(`
            INSERT INTO employment_data (
            employee_id,
            date_hired,
            employment_status,
            employment_basis,
            official_working_hours,
            position_id,
            designation_id
            )
            VALUES (
            '${employeeId}',
            CURRENT_DATE - interval '${Math.floor(
                Math.random() * 2000
            )} days',
            '${Math.random() > 0.7 ? "PROBATIONARY" : "REGULAR"}',
            '${Math.random() > 0.5 ? "FULL_TIME" : "PART_TIME"}',
            40,
            (SELECT id FROM positions ORDER BY random() LIMIT 1),
            (SELECT id FROM designations ORDER BY random() LIMIT 1)
            );
        `);

        // Educational Qualification
        await client.query(`
            INSERT INTO educational_qualifications (
            employee_id,
            title,
            school,
            year_started,
            year_finished
            )
            VALUES (
            '${employeeId}',
            'Bachelor of Science in Education',
            'University of the Philippines',
            2005,
            2009
            );
        `);

        // Training Programs
        await client.query(`
            INSERT INTO training_programs (
            employee_id,
            title,
            place,
            date_from,
            date_to,
            hours,
            conducted_by
            )
            VALUES (
            '${employeeId}',
            'Leadership Training',
            'Manila',
            CURRENT_DATE - interval '300 days',
            CURRENT_DATE - interval '295 days',
            40,
            'DepEd'
            );
        `);
        }

        await client.query("COMMIT");

        console.log("Seeding completed successfully!");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seeding failed:", error);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
