import { Router } from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { createEmployee, updateEmployeePhoto } from "../controllers/employeeController.js";


const router = Router();

router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createEmployee);
router.put("/:id/photo", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), upload.single("photo"), updateEmployeePhoto);

export default router;