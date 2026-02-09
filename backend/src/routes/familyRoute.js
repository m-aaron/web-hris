import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveFamilyBackground } from '../controllers/familyController.js';


const router = express.Router();

router.put('/:employee_id/family', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveFamilyBackground);

export default router;