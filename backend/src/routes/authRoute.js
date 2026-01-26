import express from 'express';
import { 
    loginUser, 
    getMe,
    forgotPassword
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';


const router = express.Router();

router.post('/login', loginUser); // Login route
router.post('/forgot-password', forgotPassword); // Forgot password route

// Protected route:
router.get('/me', authenticate, getMe); // Get current logged in user route

export default router;