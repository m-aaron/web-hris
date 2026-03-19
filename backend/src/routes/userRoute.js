import express from "express";
import { 
    getAllUsers,
    createUser, 
    linkUserToEmployee, 
    unlinkUserFromEmployee, 
    deactivateUser, 
    activateUser 
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { ROLES } from "../constants/roleConstant.js";


const router = express.Router();

// Create new user (Admin only)
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN), getAllUsers);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createUser);
router.patch("/:userId/link-employee", authenticate, authorizeRoles(ROLES.ADMIN), linkUserToEmployee);
router.patch("/:userId/unlink-employee", authenticate, authorizeRoles(ROLES.ADMIN), unlinkUserFromEmployee);
router.patch("/:userId/deactivate", authenticate, authorizeRoles(ROLES.ADMIN), deactivateUser);
router.patch("/:userId/activate", authenticate, authorizeRoles(ROLES.ADMIN), activateUser);

export default router;