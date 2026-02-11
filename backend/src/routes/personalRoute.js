import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { savePersonalInfo } from '../controllers/personalController.js';


const router = express.Router();

router.put('/:id/personal', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), savePersonalInfo);

export default router;