/**
 * seed-docker.js
 *
 * Idempotent startup seed — runs automatically when the backend container starts.
 * Safe to run every time: uses INSERT ... ON CONFLICT DO NOTHING.
 *
 * Seeds:
 *   - leave_types      (required for Leave Management to work)
 *   - departments      (required for Faculties feature)
 *   - positions        (required for Employment form)
 *   - designations     (required for Employment form)
 *   - default admin user
 *
 * Does NOT truncate or wipe any data.
 */

import pool from "../src/configs/dbConfig.js";

// Default admin — password: Admin@2026 (bcrypt cost 10)
// TODO(security): Change this password immediately after first login.
const DEFAULT_ADMIN_EMAIL = "admin@mabinicolleges.edu";
const DEFAULT_ADMIN_HASH =
    "$2b$10$QWSyzJ6aTbd1ptFuBEBp6ubzkX6aTJdxbO7Q0ti.jloDNROENKHcy";

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
            `INSERT INTO leave_types (name, is_active)
             VALUES ($1, true)
             ON CONFLICT (name) DO NOTHING`,
            [name]
        );
    }

    console.log(`[seed] leave_types: ${leaveTypes.length} entries ensured.`);
}

async function seedDepartments(client) {
    const departments = [
        { name: "College of Education", description: "Teacher education programs" },
        { name: "College of Business", description: "Business and management programs" },
        { name: "College of Engineering", description: "Engineering and technology programs" },
        { name: "College of Arts and Sciences", description: "Liberal arts and sciences programs" },
        { name: "College of Nursing", description: "Nursing and health sciences programs" },
        { name: "College of Criminal Justice", description: "Criminology and law enforcement programs" },
        { name: "Senior High School", description: "Senior High School department" },
        { name: "Basic Education", description: "Elementary and Junior High School" },
        { name: "Administration", description: "Administrative and non-teaching staff" },
        { name: "Finance and Accounting", description: "Finance, accounting, and budget staff" },
        { name: "Human Resources", description: "Human resources office" },
        { name: "Information Technology", description: "IT support and systems staff" },
        { name: "Registrar", description: "Registrar office" },
        { name: "Library", description: "Library services" },
        { name: "Guidance and Counseling", description: "Student guidance services" },
    ];

    for (const dept of departments) {
        await client.query(
            `INSERT INTO departments (name, description, is_active)
             VALUES ($1, $2, true)
             ON CONFLICT (name) DO NOTHING`,
            [dept.name, dept.description]
        );
    }

    console.log(`[seed] departments: ${departments.length} entries ensured.`);
}

async function seedPositions(client) {
    const positions = [
        // Teaching positions
        { name: "Professor I",              description: "Teaching faculty rank I", category: "TEACHING" },
        { name: "Professor II",             description: "Teaching faculty rank II", category: "TEACHING" },
        { name: "Professor III",            description: "Teaching faculty rank III", category: "TEACHING" },
        { name: "Associate Professor I",    description: "Associate professor rank I", category: "TEACHING" },
        { name: "Associate Professor II",   description: "Associate professor rank II", category: "TEACHING" },
        { name: "Assistant Professor I",    description: "Assistant professor rank I", category: "TEACHING" },
        { name: "Assistant Professor II",   description: "Assistant professor rank II", category: "TEACHING" },
        { name: "Instructor I",             description: "Instructor rank I", category: "TEACHING" },
        { name: "Instructor II",            description: "Instructor rank II", category: "TEACHING" },
        { name: "Instructor III",           description: "Instructor rank III", category: "TEACHING" },
        // Non-teaching positions
        { name: "Registrar",                description: "Registrar office personnel", category: "NON_TEACHING" },
        { name: "HR Officer",               description: "Human resources personnel", category: "NON_TEACHING" },
        { name: "Accounting Staff",         description: "Accounting office staff", category: "NON_TEACHING" },
        { name: "IT Support Staff",         description: "Technical support staff", category: "NON_TEACHING" },
        { name: "Administrative Assistant", description: "Administrative support staff", category: "NON_TEACHING" },
        { name: "Security Guard",           description: "Campus security personnel", category: "NON_TEACHING" },
        { name: "Utility Staff",            description: "Utility and maintenance staff", category: "NON_TEACHING" },
        { name: "Librarian",                description: "Library personnel", category: "NON_TEACHING" },
        { name: "Guidance Counselor",       description: "Student guidance counselor", category: "NON_TEACHING" },
        { name: "Cashier",                  description: "Finance cashier", category: "NON_TEACHING" },
    ];

    for (const pos of positions) {
        await client.query(
            `INSERT INTO positions (name, description, category)
             VALUES ($1, $2, $3)
             ON CONFLICT (name) DO NOTHING`,
            [pos.name, pos.description, pos.category]
        );
    }

    console.log(`[seed] positions: ${positions.length} entries ensured.`);
}

async function seedDesignations(client) {
    const designations = [
        { name: "Department Head", description: "Leads a department" },
        { name: "Dean", description: "Leads a college or school" },
        { name: "Program Coordinator", description: "Coordinates a program or unit" },
        { name: "Coordinator", description: "Coordinates unit operations" },
        { name: "Staff", description: "General staff designation" },
        { name: "Assistant", description: "Assistant designation" },
        { name: "Officer-in-Charge", description: "Temporary head of a unit" },
    ];

    for (const des of designations) {
        await client.query(
            `INSERT INTO designations (name, description)
             VALUES ($1, $2)
             ON CONFLICT (name) DO NOTHING`,
            [des.name, des.description]
        );
    }

    console.log(`[seed] designations: ${designations.length} entries ensured.`);
}

async function seedDefaultAdmin(client) {
    await client.query(
        `INSERT INTO users (email, password, role, is_active)
         VALUES ($1, $2, 'ADMIN', true)
         ON CONFLICT (email) DO NOTHING`,
        [DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_HASH]
    );

    console.log(`[seed] admin user: ensured (${DEFAULT_ADMIN_EMAIL}).`);
}

async function main() {
    const client = await pool.connect();

    try {
        console.log("[seed-docker] Starting idempotent reference data seed...");

        try {
            await seedLeaveTypes(client);
        } catch (err) {
            console.error("[seed-docker] FAILED seeding leave_types:", err.message);
            throw err;
        }

        try {
            await seedDepartments(client);
        } catch (err) {
            console.error("[seed-docker] FAILED seeding departments:", err.message);
            throw err;
        }

        try {
            await seedPositions(client);
        } catch (err) {
            console.error("[seed-docker] FAILED seeding positions:", err.message);
            throw err;
        }

        try {
            await seedDesignations(client);
        } catch (err) {
            console.error("[seed-docker] FAILED seeding designations:", err.message);
            throw err;
        }

        try {
            await seedDefaultAdmin(client);
        } catch (err) {
            console.error("[seed-docker] FAILED seeding admin user:", err.message);
            throw err;
        }

        console.log("[seed-docker] All reference data seeded successfully.");
        process.exit(0);
    } catch (err) {
        console.error("[seed-docker] Seed failed:", err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
