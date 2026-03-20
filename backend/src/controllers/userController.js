import asyncHandler from 'express-async-handler';
import pool from "../configs/dbConfig.js";
import { hashPassword } from '../utils/authUtil.js';
import { ROLES } from '../constants/roleConstant.js';


// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const usersResult = await pool.query(
        `SELECT
            u.id,
            u.email,
            e.id AS employee_id,
            e.employee_no,
            pd.first_name,
            pd.middle_name,
            pd.last_name,
            pd.name_extension,
            CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END AS status,
            u.role,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN employees e ON e.user_id = u.id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        ORDER BY u.created_at DESC`
    );

    return res.status(200).json({
        message: 'Users fetched successfully.',
        success: true,
        users: usersResult.rows,
    });
});


// @desc    Get all employees eligible for user linking
// @route   GET /api/users/linkable-employees
// @access  Private (Admin only)
export const getLinkableEmployees = asyncHandler(async (req, res) => {
    const employeesResult = await pool.query(
        `SELECT
            e.id,
            e.employee_no,
            e.status,
            pd.first_name,
            pd.middle_name,
            pd.last_name,
            pd.name_extension
        FROM employees e
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        WHERE e.status = 'SUBMITTED'
            AND e.user_id IS NULL
        ORDER BY e.created_at DESC`
    );

    return res.status(200).json({
        message: 'Linkable employees fetched successfully.',
        success: true,
        employees: employeesResult.rows,
    });
});


// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = asyncHandler(async (req, res) => {

    const { email, password, role, employeeId } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toUpperCase();

    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate input
    if (!normalizedEmail || !password || !normalizedRole) {
        return res.status(400).json({ message: 'Email, password, and role are required.', success: false });
    }

    // Validate email format
    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format.', success: false });
    }

    // Validate role
    if (!Object.values(ROLES).includes(normalizedRole)) {
        return res.status(400).json({ message: 'Invalid role.', success: false });
    }

    // Validate password length (basic safety check)
    if (String(password).length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.', success: false });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let linkedEmployee = null;

        // If employeeId is provided, validate employee and ensure no user is already linked.
        if (employeeId) {
            const employeeResult = await client.query(
                `SELECT 
                    e.id,
                    e.employee_no,
                    e.user_id,
                    pd.last_name,
                    pd.first_name,
                    pd.middle_name,
                    pd.name_extension
                FROM employees e
                LEFT JOIN personal_data pd ON pd.employee_id = e.id
                WHERE e.id = $1
                FOR UPDATE OF e`,
                [employeeId]
            );

            if (employeeResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Employee not found.', success: false });
            }

            if (employeeResult.rows[0].user_id) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    message: 'Employee already has a linked user account.',
                    success: false,
                });
            }

            linkedEmployee = employeeResult.rows[0];
        }

        // Check if user already exists
        const userExists = await client.query(
            `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
            [normalizedEmail]
        );

        if (userExists.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'User already exists.', success: false });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await client.query(
            `INSERT INTO users (email, password, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role, is_active, created_at`,
            [normalizedEmail, hashedPassword, normalizedRole]
        );

        if (newUser.rowCount === 0) {
            throw new Error('Failed to create user.');
        }

        // Link user to employee if employeeId is provided
        if (employeeId) {
            const linkResult = await client.query(
                `UPDATE employees
                SET user_id = $1
                WHERE id = $2
                RETURNING id, employee_no, user_id`,
                [newUser.rows[0].id, employeeId]
            );

            if (linkResult.rowCount === 0) {
                throw new Error('Failed to link user to employee.');
            }

            linkedEmployee = {
                ...linkedEmployee,
                user_id: linkResult.rows[0].user_id,
            };
        }

        await client.query('COMMIT');

        return res.status(201).json({
            message: 'User created successfully.',
            success: true,
            user: {
                ...newUser.rows[0],
                employee: linkedEmployee
                    ? {
                        employee_no: linkedEmployee.employee_no,
                        last_name: linkedEmployee.last_name,
                        first_name: linkedEmployee.first_name,
                        middle_name: linkedEmployee.middle_name,
                        name_extension: linkedEmployee.name_extension,
                        user_id: linkedEmployee.user_id,
                    }
                    : null,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to create user.',
            success: false,
        });
    } finally {
        client.release();
    }

});

// @desc    Update user account details
// @route   PATCH /api/users/:userId
// @access  Private (Admin only)
export const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { email, role } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toUpperCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required.',
            success: false,
        });
    }

    if (!normalizedEmail || !normalizedRole) {
        return res.status(400).json({
            message: 'Email and role are required.',
            success: false,
        });
    }

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format.', success: false });
    }

    if (!Object.values(ROLES).includes(normalizedRole)) {
        return res.status(400).json({ message: 'Invalid role.', success: false });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const targetUser = userResult.rows[0];
        const isSelfUpdate = String(req.user?.id) === String(userId);

        // Prevent users from changing their own role to avoid accidental lockout/escalation issues.
        if (isSelfUpdate && targetUser.role !== normalizedRole) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                message: 'You cannot change your own role.',
                success: false,
            });
        }

        // Prevent removing the last active admin role.
        if (
            targetUser.role === ROLES.ADMIN &&
            normalizedRole !== ROLES.ADMIN &&
            targetUser.is_active
        ) {
            const remainingAdminsResult = await client.query(
                `SELECT COUNT(*)::int AS count
                FROM users
                WHERE role = $1
                    AND is_active = TRUE
                    AND id <> $2`,
                [ROLES.ADMIN, userId]
            );

            if (remainingAdminsResult.rows[0].count === 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    message: 'Cannot remove role from the last active admin.',
                    success: false,
                });
            }
        }

        const emailConflict = await client.query(
            `SELECT id
            FROM users
            WHERE LOWER(email) = LOWER($1)
                AND id <> $2
            LIMIT 1`,
            [normalizedEmail, userId]
        );

        if (emailConflict.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'Email is already in use by another user.',
                success: false,
            });
        }

        const updateResult = await client.query(
            `UPDATE users
            SET email = $1,
                role = $2
            WHERE id = $3
            RETURNING id, email, role, is_active, updated_at`,
            [normalizedEmail, normalizedRole, userId]
        );

        if (updateResult.rowCount === 0) {
            throw new Error('Failed to update user.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User updated successfully.',
            success: true,
            user: updateResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to update user.',
            success: false,
        });
    } finally {
        client.release();
    }
});

// @desc    Delete user account
// @route   DELETE /api/users/:userId
// @access  Private (Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const targetUser = userResult.rows[0];
        const isSelfDelete = String(req.user?.id) === String(userId);

        if (isSelfDelete) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                message: 'You cannot delete your own account.',
                success: false,
            });
        }

        // Prevent deleting the last active admin account.
        if (targetUser.role === ROLES.ADMIN && targetUser.is_active) {
            const remainingAdminsResult = await client.query(
                `SELECT COUNT(*)::int AS count
                FROM users
                WHERE role = $1
                    AND is_active = TRUE
                    AND id <> $2`,
                [ROLES.ADMIN, userId]
            );

            if (remainingAdminsResult.rows[0].count === 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    message: 'Cannot delete the last active admin.',
                    success: false,
                });
            }
        }

        // Ensure references are cleaned before deleting user.
        await client.query(
            `UPDATE employees
            SET user_id = NULL
            WHERE user_id = $1`,
            [userId]
        );

        const deleteResult = await client.query(
            `DELETE FROM users
            WHERE id = $1
            RETURNING id, email, role`,
            [userId]
        );

        if (deleteResult.rowCount === 0) {
            throw new Error('Failed to delete user.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User deleted successfully.',
            success: true,
            user: deleteResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to delete user.',
            success: false,
        });
    } finally {
        client.release();
    }
});

// @desc    Link existing user to employee
// @route   PATCH /api/users/:userId/link-employee
// @access  Private (Admin only)
export const linkUserToEmployee = asyncHandler(async (req, res) => {
    
    const { userId } = req.params;
    const { employeeId } = req.body;

    if (!userId || !employeeId) {
        return res.status(400).json({
            message: 'User ID and employee ID are required.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const employeeResult = await client.query(
            `SELECT
                e.id,
                e.employee_no,
                e.user_id,
                pd.last_name,
                pd.first_name,
                pd.middle_name,
                pd.name_extension
            FROM employees e
            LEFT JOIN personal_data pd ON pd.employee_id = e.id
            WHERE e.id = $1
            FOR UPDATE OF e`,
            [employeeId]
        );

        if (employeeResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Employee not found.', success: false });
        }

        const employee = employeeResult.rows[0];

        // Idempotent behavior: if already linked to the same user, return success.
        if (employee.user_id === userId) {
            await client.query('COMMIT');
            return res.status(200).json({
                message: 'Employee is already linked to this user.',
                success: true,
                user: userResult.rows[0],
                employee: {
                    id: employee.id,
                    employee_no: employee.employee_no,
                    last_name: employee.last_name,
                    first_name: employee.first_name,
                    middle_name: employee.middle_name,
                    name_extension: employee.name_extension,
                    user_id: employee.user_id,
                },
            });
        }

        if (employee.user_id) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'Employee already has a linked user account.',
                success: false,
            });
        }

        const userLinkedElsewhere = await client.query(
            `SELECT id, employee_no
            FROM employees
            WHERE user_id = $1 AND id <> $2
            LIMIT 1`,
            [userId, employeeId]
        );

        if (userLinkedElsewhere.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'User is already linked to another employee.',
                success: false,
                employee: {
                    id: userLinkedElsewhere.rows[0].id,
                    employee_no: userLinkedElsewhere.rows[0].employee_no,
                },
            });
        }

        const linkResult = await client.query(
            `UPDATE employees
            SET user_id = $1
            WHERE id = $2
            RETURNING id, employee_no, user_id`,
            [userId, employeeId]
        );

        if (linkResult.rowCount === 0) {
            throw new Error('Failed to link user to employee.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User linked to employee successfully.',
            success: true,
            user: userResult.rows[0],
            employee: {
                id: employee.id,
                employee_no: employee.employee_no,
                last_name: employee.last_name,
                first_name: employee.first_name,
                middle_name: employee.middle_name,
                name_extension: employee.name_extension,
                user_id: linkResult.rows[0].user_id,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to link user to employee.',
            success: false,
        });
    } finally {
        client.release();
    }
    
});

// @desc    Unlink user from employee
// @route   PATCH /api/users/:userId/unlink-employee
// @access  Private (Admin only)
export const unlinkUserFromEmployee = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const linkedEmployeeResult = await client.query(
            `SELECT
                e.id,
                e.employee_no,
                e.user_id,
                pd.last_name,
                pd.first_name,
                pd.middle_name,
                pd.name_extension
            FROM employees e
            LEFT JOIN personal_data pd ON pd.employee_id = e.id
            WHERE e.user_id = $1
            FOR UPDATE OF e`,
            [userId]
        );

        if (linkedEmployeeResult.rowCount === 0) {
            await client.query('COMMIT');
            return res.status(200).json({
                message: 'User is not linked to any employee.',
                success: true,
                user: userResult.rows[0],
                employee: null,
            });
        }

        const employee = linkedEmployeeResult.rows[0];

        const unlinkResult = await client.query(
            `UPDATE employees
            SET user_id = NULL
            WHERE id = $1
            RETURNING id, employee_no`,
            [employee.id]
        );

        if (unlinkResult.rowCount === 0) {
            throw new Error('Failed to unlink user from employee.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User unlinked from employee successfully.',
            success: true,
            user: userResult.rows[0],
            employee: {
                id: employee.id,
                employee_no: employee.employee_no,
                last_name: employee.last_name,
                first_name: employee.first_name,
                middle_name: employee.middle_name,
                name_extension: employee.name_extension,
                user_id: null,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to unlink user from employee.',
            success: false,
        });
    } finally {
        client.release();
    }

});

// @desc    Deactivate user account
// @route   PATCH /api/users/:userId/deactivate
// @access  Private (Admin only)
export const deactivateUser = asyncHandler(async (req, res) => {
    
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const targetUser = userResult.rows[0];
        const isSelfDeactivate = String(req.user?.id) === String(userId);

        if (isSelfDeactivate) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                message: 'You cannot deactivate your own account.',
                success: false,
            });
        }

        // Prevent deactivating the last active admin account.
        if (targetUser.role === ROLES.ADMIN && targetUser.is_active) {
            const remainingAdminsResult = await client.query(
                `SELECT COUNT(*)::int AS count
                FROM users
                WHERE role = $1
                    AND is_active = TRUE
                    AND id <> $2`,
                [ROLES.ADMIN, userId]
            );

            if (remainingAdminsResult.rows[0].count === 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    message: 'Cannot deactivate the last active admin.',
                    success: false,
                });
            }
        }

        if (!targetUser.is_active) {
            await client.query('COMMIT');
            return res.status(200).json({
                message: 'User is already deactivated.',
                success: true,
                user: targetUser,
            });
        }

        const deactivateResult = await client.query(
            `UPDATE users
            SET is_active = FALSE
            WHERE id = $1
            RETURNING id, email, role, is_active, updated_at`,
            [userId]
        );

        if (deactivateResult.rowCount === 0) {
            throw new Error('Failed to deactivate user.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User deactivated successfully.',
            success: true,
            user: deactivateResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to deactivate user.',
            success: false,
        });
    } finally {
        client.release();
    }
});

// @desc    Activate user account
// @route   PATCH /api/users/:userId/activate
// @access  Private (Admin only)
export const activateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [userId]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        if (userResult.rows[0].is_active) {
            await client.query('COMMIT');
            return res.status(200).json({
                message: 'User is already active.',
                success: true,
                user: userResult.rows[0],
            });
        }

        const activateResult = await client.query(
            `UPDATE users
            SET is_active = TRUE
            WHERE id = $1
            RETURNING id, email, role, is_active, updated_at`,
            [userId]
        );

        if (activateResult.rowCount === 0) {
            throw new Error('Failed to activate user.');
        }

        await client.query('COMMIT');

        return res.status(200).json({
            message: 'User activated successfully.',
            success: true,
            user: activateResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to activate user.',
            success: false,
        });
    } finally {
        client.release();
    }
});