import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveExaminationTaken, updateExaminationTaken, deleteExaminationTaken } from '../controllers/examController.js';


const router = express.Router();

router.post('/:id/examination-taken', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveExaminationTaken);
router.put('/:employeeId/examination-taken/:examId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateExaminationTaken);
router.delete('/:employeeId/examination-taken/:examId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteExaminationTaken);


export default router;