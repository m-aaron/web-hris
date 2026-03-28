import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import pool from "../src/configs/dbConfig.js";

const EMPLOYEE_COUNT = Number(process.env.SEED_EMPLOYEE_COUNT || 30);
const DEFAULT_ADMIN_EMAIL = "hris.system2026@gmail.com";
const DEFAULT_ADMIN_HASH = "$2b$10$fhchnT8rXSB.IBacF3Q7EentqsNLnoI0dRK9OkKxbdrfUBRT6fYKO";
const DB_CONTAINER_NAME = process.env.DB_CONTAINER_NAME || "hris_postgres";

const FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Ana", "Mark", "Angela",
    "Carlo", "Bea", "Miguel", "Sofia", "Paolo", "Rica",
    "Daniel", "Jasmine", "Kevin", "Patricia", "Noah", "Liam",
    "Emma", "Olivia", "Ava", "Ethan", "Lucas", "Chloe"
];

const LAST_NAMES = [
    "Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Torres",
    "Flores", "Ramos", "Aquino", "Castro", "Villanueva", "Navarro",
    "Salazar", "Domingo", "Bautista", "Mercado", "Pineda", "Valdez"
];

const SCHOOLS = [
    "University of the Philippines",
    "Ateneo de Manila University",
    "De La Salle University",
    "University of Santo Tomas",
    "Polytechnic University of the Philippines",
    "Mindanao State University"
];

const TRAINING_TITLES = [
    "Leadership Training",
    "Data Privacy Compliance",
    "Workplace Ethics Seminar",
    "HRIS Process Training",
    "Employee Relations Workshop"
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[randomInt(0, arr.length - 1)];
}

function pad(num, size = 4) {
    return String(num).padStart(size, "0");
}

function randomPhone() {
    return `09${randomInt(10, 99)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
}

function randomDate(start, end) {
    const time = randomInt(start.getTime(), end.getTime());
    return new Date(time);
}

function dateOnly(value) {
    return value.toISOString().slice(0, 10);
}

function ensureBackupDir() {
    const backupDir = path.resolve(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
}

function backupDatabase() {
    const backupDir = ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const backupPath = path.join(backupDir, `backup_${timestamp}.sql`);

    console.log(`Creating backup before reset: ${backupPath}`);

    try {
        const dump = execFileSync(
            "docker",
            ["exec", DB_CONTAINER_NAME, "pg_dump", "-U", process.env.DB_USERNAME, "-d", process.env.DB_DATABASE],
            { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
        );

        fs.writeFileSync(backupPath, dump, "utf-8");
    } catch (error) {
        const stderr = error?.stderr ? String(error.stderr) : "";
        throw new Error(`Backup failed. ${stderr}`.trim());
    }

    console.log("Backup completed.");
}

async function truncateAllPublicTables(client) {
    const { rows } = await client.query(
        `SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename`
    );

    if (!rows.length) {
        return;
    }

    const tables = rows.map((r) => `"${r.tablename}"`).join(", ");
    await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}

async function seedReferenceTables(client) {
    const positionRows = await client.query(
        `INSERT INTO positions (name, description, category)
        VALUES
            ('Professor I', 'Teaching faculty rank I', 'TEACHING'),
            ('Professor II', 'Teaching faculty rank II', 'TEACHING'),
            ('Instructor', 'Teaching faculty instructor level', 'TEACHING'),
            ('Registrar', 'Registrar office personnel', 'NON_TEACHING'),
            ('HR Officer', 'Human resources personnel', 'NON_TEACHING'),
            ('Accounting Staff', 'Accounting office staff', 'NON_TEACHING'),
            ('IT Support Staff', 'Technical support staff', 'NON_TEACHING')
        RETURNING id, category`
    );

    const designationRows = await client.query(
        `INSERT INTO designations (name, description)
        VALUES
            ('Department Head', 'Leads a department'),
            ('Coordinator', 'Coordinates unit operations'),
            ('Staff', 'General staff designation'),
            ('Assistant', 'Assistant designation')
        RETURNING id`
    );

    return {
        teachingPositionIds: positionRows.rows.filter((r) => r.category === "TEACHING").map((r) => r.id),
        nonTeachingPositionIds: positionRows.rows.filter((r) => r.category === "NON_TEACHING").map((r) => r.id),
        designationIds: designationRows.rows.map((r) => r.id),
    };
}

async function seedDefaultAdmin(client) {
    await client.query(
        `INSERT INTO users (email, password, role, is_active)
        VALUES ($1, $2, 'ADMIN', true)`,
        [DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_HASH]
    );
}

async function seedEmployees(client, references) {
    const employmentStatuses = ["REGULAR", "PROBATIONARY", "CONTRACTUAL", "RESIGNED"];
    const employmentBases = ["FULL_TIME", "PART_TIME"];
    const civilStatuses = ["SINGLE", "MARRIED", "WIDOWED", "SEPARATED"];
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    for (let i = 1; i <= EMPLOYEE_COUNT; i++) {
        const employmentType = Math.random() > 0.5 ? "TEACHING" : "NON_TEACHING";
        const positionPool = employmentType === "TEACHING" ? references.teachingPositionIds : references.nonTeachingPositionIds;

        const employeeNo = `EMP-${new Date().getFullYear()}-${pad(i)}`;
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(LAST_NAMES);
        const middleName = `${String.fromCharCode(65 + (i % 26))}.`;
        const sex = Math.random() > 0.5 ? "MALE" : "FEMALE";
        const birthDate = dateOnly(randomDate(new Date("1970-01-01"), new Date("2000-12-31")));
        const dateHired = dateOnly(randomDate(new Date("2014-01-01"), new Date()));
        const workHours = randomItem([20, 30, 40, 48]);

        const employeeResult = await client.query(
            `INSERT INTO employees (employee_no, employment_type, status)
            VALUES ($1, $2, 'SUBMITTED')
            RETURNING id`,
            [employeeNo, employmentType]
        );

        const employeeId = employeeResult.rows[0].id;

        await client.query(
            `INSERT INTO personal_data (
                employee_id,
                last_name,
                first_name,
                middle_name,
                sex,
                birth_date,
                civil_status,
                citizenship,
                religion,
                blood_type,
                address,
                email,
                contact_number
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, 'Filipino', 'Roman Catholic', $8,
                $9,
                $10,
                $11
            )`,
            [
                employeeId,
                lastName,
                firstName,
                middleName,
                sex,
                birthDate,
                randomItem(civilStatuses),
                randomItem(bloodTypes),
                {
                    street: `${randomInt(1, 250)} Sample St`,
                    barangay: `Barangay ${randomInt(1, 30)}`,
                    city: randomItem(["Manila", "Quezon City", "Cebu City", "Davao City"]),
                    province: randomItem(["Metro Manila", "Cebu", "Davao del Sur", "Laguna"]),
                    zip: `${randomInt(1000, 9999)}`,
                },
                `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "")}.${i}@mail.com`,
                randomPhone(),
            ]
        );

        await client.query(
            `INSERT INTO employment_data (
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
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )`,
            [
                employeeId,
                dateHired,
                randomItem(positionPool),
                randomItem(references.designationIds),
                `SSS-${randomInt(10000000, 99999999)}`,
                `PAG-${randomInt(10000000, 99999999)}`,
                `TIN-${randomInt(100000000, 999999999)}`,
                `PH-${randomInt(10000000, 99999999)}`,
                `PERAA-${randomInt(1000, 9999)}`,
                randomItem(employmentStatuses),
                randomItem(employmentBases),
                workHours,
                Math.random() > 0.8 ? "Consultancy" : null,
                Math.random() > 0.8 ? randomItem([4, 6, 8]) : null,
            ]
        );

        await client.query(
            `INSERT INTO family_background (
                employee_id,
                spouse,
                spouse_occupation,
                nearest_kin_name,
                nearest_kin_address,
                nearest_kin_contact_number
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                employeeId,
                Math.random() > 0.5
                    ? { full_name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}` }
                    : null,
                Math.random() > 0.5 ? randomItem(["Teacher", "Nurse", "Engineer", "Business Owner"]) : null,
                { full_name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}` },
                {
                    street: `${randomInt(1, 250)} Kin St`,
                    city: randomItem(["Manila", "Cebu", "Davao"]),
                    province: randomItem(["Metro Manila", "Cebu", "Davao del Sur"]),
                },
                randomPhone(),
            ]
        );

        const childrenCount = randomInt(0, 3);
        for (let c = 0; c < childrenCount; c++) {
            await client.query(
                `INSERT INTO childrens (
                    employee_id,
                    children_name,
                    birth_date,
                    office_school,
                    occupation
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    employeeId,
                    { full_name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}` },
                    dateOnly(randomDate(new Date("2008-01-01"), new Date("2023-12-31"))),
                    randomItem(["Elementary School", "High School", "College", null]),
                    randomItem(["Student", "None", null]),
                ]
            );
        }

        const yearStarted = randomInt(2000, 2020);
        const yearFinished = randomInt(yearStarted, Math.min(yearStarted + 6, new Date().getFullYear()));

        const educationResult = await client.query(
            `INSERT INTO educational_qualifications (
                employee_id,
                title,
                school,
                year_started,
                year_finished
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                employeeId,
                randomItem([
                    "Bachelor of Science in Education",
                    "Bachelor of Science in Information Technology",
                    "Bachelor of Arts in Psychology",
                    "Master in Public Administration",
                ]),
                randomItem(SCHOOLS),
                yearStarted,
                yearFinished,
            ]
        );

        const educationId = educationResult.rows[0].id;

        await client.query(
            `INSERT INTO education_majors (education_id, major_name) VALUES ($1, $2)`,
            [educationId, randomItem(["Mathematics", "English", "Computer Science", "Management"])]
        );

        await client.query(
            `INSERT INTO education_minors (education_id, minor_name) VALUES ($1, $2)`,
            [educationId, randomItem(["Statistics", "Guidance", "Public Policy", "Business Analytics"])]
        );

        if (Math.random() > 0.4) {
            await client.query(
                `INSERT INTO education_honors (education_id, honor_name) VALUES ($1, $2)`,
                [educationId, randomItem(["Cum Laude", "Dean's Lister", "Academic Excellence Award"])]
            );
        }

        if (Math.random() > 0.5) {
            await client.query(
                `INSERT INTO education_scholarships (education_id, scholarship_name) VALUES ($1, $2)`,
                [educationId, randomItem(["CHED Scholarship", "Academic Grant", "LGU Scholarship"])]
            );
        }

        await client.query(
            `INSERT INTO examinations_taken (employee_id, title, date_taken, rating)
            VALUES ($1, $2, $3, $4)`,
            [
                employeeId,
                randomItem(["Civil Service Professional", "Licensure Examination", "Eligibility Exam"]),
                dateOnly(randomDate(new Date("2010-01-01"), new Date())),
                `${randomInt(75, 99)}%`,
            ]
        );

        const trainingStart = randomDate(new Date("2018-01-01"), new Date());
        const trainingEnd = new Date(trainingStart);
        trainingEnd.setDate(trainingStart.getDate() + randomInt(1, 5));

        await client.query(
            `INSERT INTO training_programs (
                employee_id,
                title,
                place,
                date_from,
                date_to,
                hours,
                conducted_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                employeeId,
                randomItem(TRAINING_TITLES),
                randomItem(["Manila", "Cebu", "Davao", "Online"]),
                dateOnly(trainingStart),
                dateOnly(trainingEnd),
                randomInt(8, 48),
                randomItem(["DepEd", "CSC", "CHED", "Internal Training Unit"]),
            ]
        );

        await client.query(
            `INSERT INTO employment_history (
                employee_id,
                start_date,
                end_date,
                position,
                employer,
                salary,
                reason_for_leaving
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                employeeId,
                dateOnly(randomDate(new Date("2008-01-01"), new Date("2016-12-31"))),
                dateOnly(randomDate(new Date("2017-01-01"), new Date("2021-12-31"))),
                randomItem(["Instructor", "Staff", "Analyst", "Coordinator"]),
                randomItem(["ABC College", "City Hall", "Private Corp", "Public School"]),
                randomInt(18000, 45000),
                randomItem(["Career Growth", "Relocation", "End of Contract"]),
            ]
        );

        const hasCriminalCase = Math.random() < 0.05;
        const hasAdminOffense = Math.random() < 0.08;
        const wasSeparated = Math.random() < 0.06;

        await client.query(
            `INSERT INTO other_information (
                employee_id,
                has_criminal_case,
                criminal_case_details,
                has_admin_offense,
                admin_offense_details,
                was_separated_employment,
                separation_details
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                employeeId,
                hasCriminalCase,
                hasCriminalCase ? "Case dismissed" : null,
                hasAdminOffense,
                hasAdminOffense ? "Administrative warning issued" : null,
                wasSeparated,
                wasSeparated ? "Contract ended" : null,
            ]
        );

        await client.query(
            `INSERT INTO employee_references (
                employee_id,
                name,
                address,
                contact_number
            ) VALUES ($1, $2, $3, $4), ($1, $5, $6, $7)`,
            [
                employeeId,
                { full_name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}` },
                {
                    street: `${randomInt(10, 250)} Reference St`,
                    city: randomItem(["Manila", "Cebu", "Davao"]),
                },
                randomPhone(),
                { full_name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}` },
                {
                    street: `${randomInt(10, 250)} Reference Ave`,
                    city: randomItem(["Quezon City", "Baguio", "Iloilo"]),
                },
                randomPhone(),
            ]
        );
    }
}

async function seed() {
    const client = await pool.connect();

    try {
        if (!process.env.DB_USERNAME || !process.env.DB_DATABASE) {
            throw new Error("DB_USERNAME and DB_DATABASE must be set in environment.");
        }

        backupDatabase();

        await client.query("BEGIN");

        console.log("Resetting all public tables...");
        await truncateAllPublicTables(client);

        console.log("Seeding default admin account...");
        await seedDefaultAdmin(client);

        console.log("Seeding reference tables...");
        const references = await seedReferenceTables(client);

        console.log(`Seeding ${EMPLOYEE_COUNT} employees with complete related records...`);
        await seedEmployees(client, references);

        await client.query("COMMIT");
        console.log("Database reset and reseed completed successfully.");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
