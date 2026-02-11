import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { 
    saveEducationalQualification,
    saveMajor,
    saveMinor
} from '../controllers/educationController.js';


const router = express.Router();

router.post('/:id/education', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);
router.post('/:id/major', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMajor);
router.post('/:id/minor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMinor);

export default router;