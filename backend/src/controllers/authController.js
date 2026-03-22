import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../configs/dbConfig.js';
import { comparePassword, hashPassword, hashToken } from '../utils/authUtil.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtil.js';
import { sendEmail } from '../services/emailService.js';


const getCurrentUserProfile = async (userId) => {
    const result = await pool.query(
        `SELECT
            u.id,
            u.email,
            u.role,
            u.updated_at,
            e.id AS employee_id,
            e.employee_no,
            e.photo_url,
            pd.first_name,
            pd.middle_name,
            pd.last_name,
            pd.name_extension
        FROM users u
        LEFT JOIN employees e ON e.user_id = u.id
        LEFT JOIN personal_data pd ON pd.employee_id = e.id
        WHERE u.id = $1
        LIMIT 1`,
        [userId]
    );

    if (result.rowCount === 0) {
        return null;
    }

    const user = result.rows[0];

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        employee_no: user.employee_no,
        photo_url: user.photo_url,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        name_extension: user.name_extension,
        security_updated_at: user.updated_at,
    };
};


// @desc    User login
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required', success: false });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format', success: false });
    }

    // Check if user exists
    const userResult = await pool.query(
        `SELECT id, email, password, role, is_active
        FROM users
        WHERE LOWER(email) = $1`,
        [email]
    );

    // If user does not exist
    if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    // Check if user is active
    if (!user.is_active) {
        return res.status(403).json({ message: 'Account is inactive. Please contact administrator.', success: false });
    }

    // Generate access token(short-lived) and set cookie
    generateAccessToken(res, user.id);

    // Generate refresh token(long-lived) and set cookie
    generateRefreshToken(res, user.id)

    res.status(200).json({
        message: 'Login successful',
        success: true,
        role: user.role,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
});


// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    // Check if refresh token exists
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided', success: false });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // If token is invalid
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid refresh token', success: false });
    }

    const userResult = await pool.query(
        `SELECT id, is_active FROM users WHERE id = $1`,
        [decoded.id]
    );

    if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid refresh token', success: false });
    }

    if (!userResult.rows[0].is_active) {
        return res.status(403).json({ message: 'Account is inactive. Please contact administrator.', success: false });
    }

    // Generate new access token and set cookie
    generateAccessToken(res, decoded.id);

    res.status(200).json({ message: 'Access token refreshed successfully', success: true });

});


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {

    const user = await getCurrentUserProfile(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found', success: false });
    }

    res.status(200).json({ message: 'User fetched successfully', success: true, user });

});


// @desc    Update authenticated user's email
// @route   PATCH /api/auth/me/email
// @access  Private
export const updateMyEmail = asyncHandler(async (req, res) => {
    const { newEmail, currentPassword } = req.body;

    const normalizedEmail = String(newEmail || '').trim().toLowerCase();
    const enteredCurrentPassword = String(currentPassword || '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail || !enteredCurrentPassword) {
        return res.status(400).json({
            message: 'New email and current password are required.',
            success: false,
        });
    }

    if (enteredCurrentPassword.length < 8) {
        return res.status(400).json({
            message: 'Current password must be at least 8 characters long.',
            success: false,
        });
    }

    if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format.', success: false });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, email, password
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [req.user.id]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const currentUser = userResult.rows[0];
        const isPasswordValid = await comparePassword(enteredCurrentPassword, currentUser.password);

        if (!isPasswordValid) {
            await client.query('ROLLBACK');
            return res.status(401).json({ message: 'Current password is incorrect.', success: false });
        }

        if (currentUser.email === normalizedEmail) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'New email must be different from current email.', success: false });
        }

        const emailConflict = await client.query(
            `SELECT id
            FROM users
            WHERE LOWER(email) = LOWER($1)
                AND id <> $2
            LIMIT 1`,
            [normalizedEmail, req.user.id]
        );

        if (emailConflict.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'Email is already in use by another user.',
                success: false,
            });
        }

        await client.query(
            `UPDATE users
            SET email = $1
            WHERE id = $2`,
            [normalizedEmail, req.user.id]
        );

        await client.query('COMMIT');

        const user = await getCurrentUserProfile(req.user.id);

        return res.status(200).json({
            message: 'Email updated successfully.',
            success: true,
            user,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to update email.',
            success: false,
        });
    } finally {
        client.release();
    }
});


// @desc    Update authenticated user's password
// @route   PATCH /api/auth/me/password
// @access  Private
export const updateMyPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const enteredCurrentPassword = String(currentPassword || '');
    const enteredNewPassword = String(newPassword || '');

    if (!enteredCurrentPassword || !enteredNewPassword) {
        return res.status(400).json({
            message: 'Current password and new password are required.',
            success: false,
        });
    }

    if (enteredCurrentPassword.length < 8) {
        return res.status(400).json({
            message: 'Current password must be at least 8 characters long.',
            success: false,
        });
    }

    if (enteredNewPassword.length < 8) {
        return res.status(400).json({
            message: 'New password must be at least 8 characters long.',
            success: false,
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `SELECT id, password
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [req.user.id]
        );

        if (userResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const currentUser = userResult.rows[0];
        const isCurrentPasswordValid = await comparePassword(enteredCurrentPassword, currentUser.password);

        if (!isCurrentPasswordValid) {
            await client.query('ROLLBACK');
            return res.status(401).json({ message: 'Current password is incorrect.', success: false });
        }

        const isSameAsCurrent = await comparePassword(enteredNewPassword, currentUser.password);

        if (isSameAsCurrent) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: 'New password must be different from current password.',
                success: false,
            });
        }

        const hashedPassword = await hashPassword(enteredNewPassword);

        await client.query(
            `UPDATE users
            SET password = $1,
                updated_at = NOW()
            WHERE id = $2`,
            [hashedPassword, req.user.id]
        );

        await client.query('COMMIT');

        const user = await getCurrentUserProfile(req.user.id);

        return res.status(200).json({
            message: 'Password updated successfully.',
            success: true,
            user,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: error.message || 'Failed to update password.',
            success: false,
        });
    } finally {
        client.release();
    }
});


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    
    const email = String(req.body.email || '').trim().toLowerCase();

    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate input
    if (!email) {
        return res.status(400).json({ message: 'Email is required', success: false });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format', success: false });
    }

    // Check if user exists
    const userResult = await pool.query(
        `SELECT id FROM users WHERE LOWER(email) = $1`,
        [email]
    );

    // If user does not exist
    if (userResult.rows.length === 0) {
        return res.status(200).json({ message: 'If the email exists, a reset link has been sent', success: true });
    }

    const userId = userResult.rows[0].id;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving to database
    const hashedToken = hashToken(resetToken);

    // Set token expiration time (15 minutes)
    const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000);
    
    // Remove old token
    await pool.query(
        `DELETE FROM password_resets WHERE user_id = $1`,
        [userId]
    );

    // Save hashed token and expiration to database
    await pool.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)`,
        [userId, hashedToken, tokenExpiration]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send reset email
    await sendEmail({
        to: email,
        subject: 'HRIS Password Reset',
        html: `<p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 15 minutes.</p>`,
        text: `You requested a password reset. Open this link to reset your password: ${resetUrl}`
    });;

    res.status(200).json({ message: 'If the email exists, a reset link has been sent', success: true });

});


// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required', success: false });
    }

    if (String(newPassword).length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long', success: false });
    }

    // Hash the received token
    const hashedToken = hashToken(resetToken);

    // Find token in database
    const tokenResult = await pool.query(
        `SELECT user_id, expires_at FROM password_resets WHERE token_hash = $1`,
        [hashedToken]
    );

    // If token not found
    if (tokenResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token', success: false });
    }
    
    const { user_id, expires_at } = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > expires_at) {
        return res.status(400).json({ message: 'Invalid or expired token', success: false });
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await pool.query(
        `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
        [hashedPassword, user_id]
    );

    // Remove used token
    await pool.query(
        `DELETE FROM password_resets WHERE user_id = $1`,
        [user_id]
    );

    res.status(200).json({ message: 'Password reset successfully', success: true });

});


export const logoutUser = asyncHandler(async (req, res) => {
    
    // Clear the access and refresh token cookies
    res.clearCookie(
        'accessToken',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        }
    );

    res.clearCookie(
        'refreshToken',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        }
    );

    res.status(200).json({ message: 'Logged out successfully', success: true });
    
});