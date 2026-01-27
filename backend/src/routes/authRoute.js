import express from 'express';
import { 
    loginUser, 
    refreshToken,
    getMe,
    forgotPassword,
    resetPassword,
    logoutUser
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';


const router = express.Router();

router.post('/login', loginUser); // Login route
router.post('/refresh-token', refreshToken); // Refresh token route
router.post('/forgot-password', forgotPassword); // Forgot password route
router.post('/reset-password/:resetToken', resetPassword); // Reset password route
router.post('/logout', logoutUser); // Logout route

// Protected route:
router.get('/me', authenticate, getMe); // Get current logged in user route

export default router;