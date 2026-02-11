import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { 
    saveEducationalQualification,
    saveMajor,
    saveMinor,
    saveHonor,
    saveScholarship
} from '../controllers/educationController.js';


const router = express.Router();

router.post('/:id/education', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);
router.post('/:id/major', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMajor);
router.post('/:id/minor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMinor);
router.post('/:id/honor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveHonor);
router.post('/:id/scholarship', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveScholarship);

export default router;