import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveChild } from '../controllers/childrenController.js';


const router = express.Router();

router.post('/:employee_id/children', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveChild);

export default router;