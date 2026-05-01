import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getLeaveTypes,
    getLeaveApplications,
    createLeaveApplication,
    approveLeaveApplication,
    rejectLeaveApplication,
    getLeaveBalances,
    updateLeaveBalance,
    getLeaveSummary
} from "../controllers/leaveController.js";


const router = express.Router();

router.get("/types", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveTypes);
router.get("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveApplications);
router.post("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createLeaveApplication);
router.patch("/applications/:id/approve", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), approveLeaveApplication);
router.patch("/applications/:id/reject", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), rejectLeaveApplication);
router.get("/balances", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveBalances);
router.patch("/balances/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateLeaveBalance);
router.get("/summary/:employeeId", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveSummary);

export default router;
