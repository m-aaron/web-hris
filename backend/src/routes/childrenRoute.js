import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveChild, updateChild, deleteChild } from '../controllers/childrenController.js';


const router = express.Router();

router.post('/:id/children', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveChild);
router.put('/:employeeId/children/:childId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateChild);
router.delete('/:employeeId/children/:childId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteChild);

export default router;