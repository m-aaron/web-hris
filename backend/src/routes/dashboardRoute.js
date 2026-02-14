import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { dashboardSummary } from "../controllers/dashboardController.js";


const router = express.Router();

router.get("/summary", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), dashboardSummary);

export default router;