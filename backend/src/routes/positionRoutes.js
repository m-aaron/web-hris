import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getPositions,
    createPosition,
    updatePosition,
    togglePositionActive,
    deletePosition,
} from "../controllers/positionController.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getPositions);
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN), createPosition);
router.patch("/:id/toggle-active", authenticate, authorizeRoles(ROLES.ADMIN), togglePositionActive);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ADMIN), updatePosition);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN), deletePosition);

export default router;
