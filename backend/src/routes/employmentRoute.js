import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveEmploymentData, updateEmploymentData } from '../controllers/employmentController.js';


const router = express.Router();

router.put('/:id/employment', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEmploymentData);
router.put('/:id/employment/update', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEmploymentData);

export default router;