import { Router } from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getLeaveTypes,
    getLeaveApplications,
    getLeaveApplicationById,
    createLeaveApplication,
    updateLeaveApplication,
    getLeaveOverview,
    updateLeaveStatus,
    deleteLeaveApplication,
    getLeaveSummary
} from "../controllers/leaveController.js";

const router = Router();

// Public to authenticated HR / Admin users
router.get("/types", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveTypes);

router.get("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveApplications);
router.get("/overview", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveOverview);
router.get("/applications/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveApplicationById);
router.post("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createLeaveApplication);
router.patch("/applications/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateLeaveApplication);
router.patch("/applications/:id/status", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateLeaveStatus);
router.delete("/applications/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), deleteLeaveApplication);

router.get("/summary/:employeeId", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveSummary);

export default router;
// import express from "express";
// import { ROLES } from "../constants/roleConstant.js";
// import { authenticate } from "../middlewares/authenticateMiddleware.js";
// import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
// import {
//     getLeaveTypes,
//     createLeaveType,
//     updateLeaveType,
//     deleteLeaveType,
//     getLeaveApplications,
//     createLeaveApplication,
//     approveLeaveApplication,
//     rejectLeaveApplication
// } from "../controllers/leaveController.js";


// const router = express.Router();

// router.get("/types", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveTypes);
// router.post("/types", authenticate, authorizeRoles(ROLES.ADMIN), createLeaveType);
// router.patch("/types/:id", authenticate, authorizeRoles(ROLES.ADMIN), updateLeaveType);
// router.delete("/types/:id", authenticate, authorizeRoles(ROLES.ADMIN), deleteLeaveType);
// router.get("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveApplications);
// router.post("/applications", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createLeaveApplication);
// router.patch("/applications/:id/approve", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), approveLeaveApplication);
// router.patch("/applications/:id/reject", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), rejectLeaveApplication);
// // router.get("/balances", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveBalances);
// // router.patch("/balances/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateLeaveBalance);
// // router.get("/summary/:employeeId", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getLeaveSummary);

// export default router;
