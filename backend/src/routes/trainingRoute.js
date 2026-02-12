import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveTrainingProgram } from '../controllers/trainingController.js';


const router = express.Router();

router.post('/:id/training', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveTrainingProgram);

export default router;