import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveFamilyBackground, updateFamilyBackground } from '../controllers/familyController.js';


const router = express.Router();

router.put('/:id/family', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveFamilyBackground);
router.put('/:id/family/update', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateFamilyBackground);

export default router;