import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveOtherInfo } from '../controllers/otherInfoController.js';


const router = express.Router();

router.put('/:id/other-info', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveOtherInfo);

export default router;