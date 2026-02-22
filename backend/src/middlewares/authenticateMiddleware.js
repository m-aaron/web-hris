import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import pool from '../configs/dbConfig.js';


// @desc    Authenticate user middleware
// @route   N/A
// @access  Protected
export const authenticate = asyncHandler(async (req, res, next) => {

    const token = req.cookies.accessToken;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token', success: false });
    }

    let decoded;

    // Verify token
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, invalid token', success: false });
    }

    // Fetch user from database
    const userResult = await pool.query(
        `SELECT u.id, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
        [decoded.id]
    );

    // If user does not exist
    if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user does not exist', success: false });
    }

    // Attach user to request object
    req.user = {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role_name,
    };

    next();

});