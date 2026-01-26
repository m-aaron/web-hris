import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import pool from '../configs/dbConfig.js';
import { comparePassword, hashToken } from '../utils/authUtil.js';
import { generateToken } from '../utils/tokenUtil.js';
import { sendEmail } from '../services/emailService.js';


// @desc    User login
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

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
        `SELECT u.id, u.password, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1`,
        [email]
    );

    // If user does not exist
    if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    // Compare passwords
    const isMatch = await comparePassword(password, userResult.rows[0].password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    // Generate token and set cookie
    const token = generateToken(res, userResult.rows[0].id);

    res.status(200).json({ message: 'Login successful', success: true, token, role: userResult.rows[0].role_name });
});


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {

    // Retrieve user from request object set by authenticate middleware
    const user = req.user;
    res.status(200).json({ message: 'User fetched successfully', success: true, user });

});


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    
    const { email } = req.body;

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
        `SELECT id FROM users WHERE email = $1`,
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