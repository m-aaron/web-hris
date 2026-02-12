import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { saveReference } from "../controllers/referenceController.js";


const router = express.Router();

router.post('/:id/reference', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), saveReference);

export default router;