import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import pool from "../src/configs/dbConfig.js";
import {
    getBackupFilePath,
    generateBackupFilename,
    createBackupMetadata,
    updateBackupMetadata,
    addBackupHeader,
    cleanupOldBackups,
    formatFileSize
} from "../src/utils/backupUtils.js";

/**
 * seed.js — Full reset + reseed (development/admin tool)
 *
 * WARNING: This truncates ALL tables and reseeds from scratch.
 * Run via:  npm run db:reset-seed  (from backend/ directory)
 * Or via:   reset-db.bat           (from project root)
 *
 * NOT used for Docker startup — see scripts/seed-docker.js instead.
 */

const EMPLOYEE_COUNT = Number(process.env.SEED_EMPLOYEE_COUNT || 30);

// TODO(security): Change default admin credentials after first login.
// Default admin: admin@mabinicolleges.edu / Admin@2026 (bcrypt hash below)
const DEFAULT_ADMIN_EMAIL = "admin@mabinicolleges.edu";
const DEFAULT_ADMIN_HASH = "$2b$10$QWSyzJ6aTbd1ptFuBEBp6ubzkX6aTJdxbO7Q0ti.jloDNROENKHcy";

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

function backupDatabase() {
    const filename = generateBackupFilename();
    const backupPath = getBackupFilePath(filename);
    
    // Create metadata entry
    createBackupMetadata(filename, "reset", `Database reset/reseed on ${new Date().toLocaleString()}`);

    console.log(`Creating backup before reset: ${backupPath}`);

    try {
        const dump = execFileSync(
            "docker",
            ["exec", DB_CONTAINER_NAME, "pg_dump", "-U", process.env.DB_USERNAME, "-d", process.env.DB_DATABASE],
            { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
        );

        fs.writeFileSync(backupPath, dump, "utf-8");
        
        // Add informative header to SQL file
        addBackupHeader(backupPath, "reset", "Database state before reset/reseed");
        
        // Update metadata with success info
        const stats = fs.statSync(backupPath);
        updateBackupMetadata(filename, "completed", stats.size);
        
        console.log(`✓ Backup completed: ${filename} (${formatFileSize(stats.size)})`);
        
        // Cleanup old backups - keep last 15
        const cleanup = cleanupOldBackups(15);
        if (cleanup.deleted > 0) {
            console.log(`✓ Cleaned up ${cleanup.deleted} old backups (keeping last 15)`);
        }
        
    } catch (error) {
        const stderr = error?.stderr ? String(error.stderr) : "";
        updateBackupMetadata(filename, "failed", null);
        throw new Error(`Backup failed. ${stderr}`.trim());
    }
}

function ensureBackupDir() {
    // This is now handled by backupUtils, but keeping for backwards compatibility
    const backupDir = getBackupFilePath().replace(/[\\\/][^\\\/]*\.sql$/, "");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
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

// ─── Reference Data ─────────────────────────────────────────────────────────

async function seedLeaveTypes(client) {
    const leaveTypes = [
        "Vacation Leave",
        "Sick Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Emergency Leave",
        "Solo Parent Leave",
        "Study Leave",
        "Others",
    ];

    for (const name of leaveTypes) {
        await client.query(
            `INSERT INTO leave_types (name, is_active) VALUES ($1, true)`,
            [name]
        );
    }

    console.log(`[seed] leave_types: ${leaveTypes.length} entries inserted.`);
}

async function seedDepartments(client) {
    const departments = [
        { name: "College of Education",           description: "Teacher education programs" },
        { name: "College of Business",            description: "Business and management programs" },
        { name: "College of Engineering",         description: "Engineering and technology programs" },
        { name: "College of Arts and Sciences",   description: "Liberal arts and sciences programs" },
        { name: "College of Nursing",             description: "Nursing and health sciences programs" },
        { name: "College of Criminal Justice",    description: "Criminology and law enforcement programs" },
        { name: "Senior High School",             description: "Senior High School department" },
        { name: "Basic Education",                description: "Elementary and Junior High School" },
        { name: "Administration",                 description: "Administrative and non-teaching staff" },
        { name: "Finance and Accounting",         description: "Finance, accounting, and budget staff" },
        { name: "Human Resources",                description: "Human resources office" },
        { name: "Information Technology",         description: "IT support and systems staff" },
        { name: "Registrar",                      description: "Registrar office" },
        { name: "Library",                        description: "Library services" },
        { name: "Guidance and Counseling",        description: "Student guidance services" },
    ];

    for (const dept of departments) {
        await client.query(
            `INSERT INTO departments (name, description, is_active) VALUES ($1, $2, true)`,
            [dept.name, dept.description]
        );
    }

    console.log(`[seed] departments: ${departments.length} entries inserted.`);
}

async function seedReferenceTables(client) {
    // Leave types
    try {
        await seedLeaveTypes(client);
    } catch (err) {
        console.error("[seed] FAILED seeding leave_types:", err.message);
        throw err;
    }

    // Departments
    try {
        await seedDepartments(client);
    } catch (err) {
        console.error("[seed] FAILED seeding departments:", err.message);
        throw err;
    }

    // Positions
    const positionRows = await client.query(
        `INSERT INTO positions (name, description, category)
        VALUES
            ('Professor I',              'Teaching faculty rank I',         'TEACHING'),
            ('Professor II',             'Teaching faculty rank II',        'TEACHING'),
            ('Professor III',            'Teaching faculty rank III',       'TEACHING'),
            ('Associate Professor I',    'Associate professor rank I',      'TEACHING'),
            ('Associate Professor II',   'Associate professor rank II',     'TEACHING'),
            ('Assistant Professor I',    'Assistant professor rank I',      'TEACHING'),
            ('Assistant Professor II',   'Assistant professor rank II',     'TEACHING'),
            ('Instructor I',             'Instructor rank I',               'TEACHING'),
            ('Instructor II',            'Instructor rank II',              'TEACHING'),
            ('Instructor III',           'Instructor rank III',             'TEACHING'),
            ('Registrar',                'Registrar office personnel',      'NON_TEACHING'),
            ('HR Officer',               'Human resources personnel',       'NON_TEACHING'),
            ('Accounting Staff',         'Accounting office staff',         'NON_TEACHING'),
            ('IT Support Staff',         'Technical support staff',         'NON_TEACHING'),
            ('Administrative Assistant', 'Administrative support staff',    'NON_TEACHING'),
            ('Security Guard',           'Campus security personnel',       'NON_TEACHING'),
            ('Utility Staff',            'Utility and maintenance staff',   'NON_TEACHING'),
            ('Librarian',                'Library personnel',               'NON_TEACHING'),
            ('Guidance Counselor',       'Student guidance counselor',      'NON_TEACHING'),
            ('Cashier',                  'Finance cashier',                 'NON_TEACHING')
        RETURNING id, category`
    );

    // Designations
    const designationRows = await client.query(
        `INSERT INTO designations (name, description)
        VALUES
            ('Department Head',     'Leads a department'),
            ('Dean',                'Leads a college or school'),
            ('Program Coordinator', 'Coordinates a program or unit'),
            ('Coordinator',         'Coordinates unit operations'),
            ('Staff',               'General staff designation'),
            ('Assistant',           'Assistant designation'),
            ('Officer-in-Charge',   'Temporary head of a unit')
        RETURNING id`
    );

    return {
        teachingPositionIds: positionRows.rows.filter((r) => r.category === "TEACHING").map((r) => r.id),
        nonTeachingPositionIds: positionRows.rows.filter((r) => r.category === "NON_TEACHING").map((r) => r.id),
        designationIds: designationRows.rows.map((r) => r.id),
    };
}

async function seedDefaultAdmin(client) {
    try {
        await client.query(
            `INSERT INTO users (email, password, role, is_active)
            VALUES ($1, $2, 'ADMIN', true)`,
            [DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_HASH]
        );
        console.log(`[seed] Admin account seeded: ${DEFAULT_ADMIN_EMAIL}`);
    } catch (err) {
        console.error("[seed] FAILED seeding admin user:", err.message);
        throw err;
    }
}

// ─── Employee Data ───────────────────────────────────────────────────────────

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
        const salary = randomInt(18000, 65000);

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
                salary,
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
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            )`,
            [
                employeeId,
                dateHired,
                randomItem(positionPool),
                randomItem(references.designationIds),
                salary,
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

    console.log(`[seed] employees: ${EMPLOYEE_COUNT} employees seeded with full related records.`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

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

        console.log("Seeding reference tables (leave types, departments, positions, designations)...");
        const references = await seedReferenceTables(client);

        console.log(`Seeding ${EMPLOYEE_COUNT} employees with complete related records...`);
        await seedEmployees(client, references);

        await client.query("COMMIT");
        console.log("Database reset and reseed completed successfully.");
        process.exit(0);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
