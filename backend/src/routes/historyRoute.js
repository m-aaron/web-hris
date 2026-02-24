import express from 'express';  
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveEmploymentHistory, updateEmploymentHistory } from '../controllers/historyController.js';


const router = express.Router();

router.post('/:id/employment-history', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEmploymentHistory);
router.put('/:employeeId/employment-history/:historyId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEmploymentHistory);

export default router;