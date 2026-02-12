import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveExaminationTaken } from '../controllers/examController.js';


const router = express.Router();

router.post('/:id/examination-taken', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveExaminationTaken);

export default router;