import express from "express";
import { createUser, linkUserToEmployee, unlinkUserFromEmployee } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { ROLES } from "../constants/roleConstant.js";


const router = express.Router();

// Create new user (Admin only)
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createUser);
router.patch("/:userId/link-employee", authenticate, authorizeRoles(ROLES.ADMIN), linkUserToEmployee);
router.patch("/:userId/unlink-employee", authenticate, authorizeRoles(ROLES.ADMIN), unlinkUserFromEmployee);

export default router;