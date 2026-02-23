import express from 'express';
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { 
    saveEducationalQualification,
    saveMajor,
    saveMinor,
    saveHonor,
    saveScholarship,
    updateEducationalQualification,
    updateMajor,
    updateMinor
} from '../controllers/educationController.js';


const router = express.Router();

router.post('/:id/education', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);
router.put('/:id/education/update', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEducationalQualification);
router.post('/:id/major', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMajor);
router.put('/:id/major/update', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMajor);
router.post('/:id/minor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMinor);
router.put('/:id/minor/update', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMinor);
router.post('/:id/honor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveHonor);
router.post('/:id/scholarship', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveScholarship);

export default router;