import { Router } from 'express';
import { ROLES } from '../constants/roleConstant.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';
import { authorizeRoles } from '../middlewares/authorizeMiddleware.js';
import { createFaculty } from '../controllers/facultyController.js';

const router = Router();

router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createFaculty);

export default router;