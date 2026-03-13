import express from 'express';  
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveEmploymentHistory, updateEmploymentHistory, deleteEmploymentHistory } from '../controllers/historyController.js';


const router = express.Router();

router.post('/:id/employment-history', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEmploymentHistory);
router.put('/:employeeId/employment-history/:historyId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEmploymentHistory);
router.delete('/:employeeId/employment-history/:historyId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteEmploymentHistory);

export default router;