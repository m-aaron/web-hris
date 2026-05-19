import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getDesignations,
    createDesignation,
    updateDesignation,
    deleteDesignation,
} from "../controllers/designationController.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles(ROLES.ADMIN), getDesignations);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createDesignation);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateDesignation);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), deleteDesignation);

export default router;
