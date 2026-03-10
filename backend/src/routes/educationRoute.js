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
    updateMinor,
    updateHonor,
    updateScholarship,

    deleteEducationalQualification
} from '../controllers/educationController.js';


const router = express.Router();

router.post('/:id/education', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);
router.put('/:employeeId/education/:qualificationId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEducationalQualification);
router.delete('/:employeeId/education/:qualificationId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteEducationalQualification);

router.post('/:id/major', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMajor);
router.put('/:employeeId/major/:majorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMajor);
router.post('/:id/minor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMinor);
router.put('/:employeeId/minor/:minorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMinor);
router.post('/:id/honor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveHonor);
router.put('/:employeeId/honor/:honorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateHonor);
router.post('/:id/scholarship', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveScholarship);
router.put('/:employeeId/scholarship/:scholarshipId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateScholarship);

export default router;