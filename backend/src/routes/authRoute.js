import express from 'express';
import { 
    loginUser, 
    getMe
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';


const router = express.Router();

router.post('/login', loginUser); // Login route

// Protected route:
router.get('/me', authenticate, getMe); // Get current logged in user route

export default router;