import { Router } from 'express';
import { ROLES } from '../constants/roleConstant.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';
import { authorizeRoles } from '../middlewares/authorizeMiddleware.js';
import {
	createFaculty,
	getFaculties,
	getFacultyById,
	updateFaculty,
	deleteFaculty,
} from '../controllers/facultyController.js';

const router = Router();

router.get('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getFaculties);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createFaculty);
router.get('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getFacultyById);
router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateFaculty);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteFaculty);

export default router;