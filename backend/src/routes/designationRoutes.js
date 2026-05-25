import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getDesignations,
    getActiveDesignations,
    createDesignation,
    updateDesignation,
    toggleDesignationActive,
    deleteDesignation,
} from "../controllers/designationController.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getDesignations);
router.get("/active", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getActiveDesignations);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createDesignation);
router.patch("/:id/toggle-active", authenticate, authorizeRoles(ROLES.ADMIN), toggleDesignationActive);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateDesignation);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), deleteDesignation);

export default router;
