import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveEmploymentData } from '../controllers/employmentController.js';


const router = express.Router();

router.put('/:id/employment', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEmploymentData);

export default router;