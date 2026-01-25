import asyncHandler from 'express-async-handler';
import pool from '../configs/dbConfig.js';
import { comparePassword } from '../utils/authUtil.js';
import { generateToken } from '../utils/tokenUtil.js';


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