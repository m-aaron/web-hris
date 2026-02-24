import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveReference, updateReference } from "../controllers/referenceController.js";


const router = express.Router();

router.post('/:id/reference', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveReference);
router.put('/:employeeId/reference/:referenceId', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateReference);

export default router;