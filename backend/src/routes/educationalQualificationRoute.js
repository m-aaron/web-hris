import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveEducationalQualification } from '../controllers/educationalQualificationController.js';


const router = express.Router();

router.post('/:id/educational-qualification', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);

export default router;