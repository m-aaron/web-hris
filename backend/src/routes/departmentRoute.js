import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getDepartments);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createDepartment);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateDepartment);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), deleteDepartment);

export default router;