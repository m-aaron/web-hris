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

    deleteEducationalQualification,
    deleteMajor,
    deleteMinor,
    deleteHonor,
    deleteScholarship
} from '../controllers/educationController.js';


const router = express.Router();

router.post('/:id/education', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveEducationalQualification);
router.put('/:employeeId/education/:qualificationId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEducationalQualification);
router.delete('/:employeeId/education/:qualificationId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteEducationalQualification);

router.post('/:educationId/major', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMajor);
router.put('/:educationId/major/:majorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMajor);
router.delete('/:educationId/major/:majorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteMajor);

router.post('/:educationId/minor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveMinor);
router.put('/:educationId/minor/:minorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateMinor);
router.delete('/:educationId/minor/:minorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteMinor);

router.post('/:id/honor', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveHonor);
router.put('/:employeeId/honor/:honorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateHonor);
router.delete('/:employeeId/honor/:honorId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteHonor);

router.post('/:id/scholarship', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveScholarship);
router.put('/:employeeId/scholarship/:scholarshipId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateScholarship);
router.delete('/:employeeId/scholarship/:scholarshipId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteScholarship);

export default router;