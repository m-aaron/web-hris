import { Router } from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { createEmployee } from "../controllers/employeeController.js";


const router = Router();

router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createEmployee);

export default router;