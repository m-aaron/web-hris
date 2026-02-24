import { Router } from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { 
    createEmployee, 
    updateEmployeePhoto, 
    getEmployees, 
    getEmployeeById,
    archiveEmployee,
    bulkArchiveEmployees,
    changeEmployeeStatus,
    exportEmployeesExcel,
    exportSelectedEmployeesExcel
} from "../controllers/employeeController.js";


const router = Router();

router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createEmployee);
router.put("/:id/photo", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), upload.single("photo"), updateEmployeePhoto);
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getEmployees);
router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getEmployeeById);
router.put("/:id/archive", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), archiveEmployee);
router.put("/bulk-archive", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), bulkArchiveEmployees);
router.put("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), changeEmployeeStatus); 
router.get("/export", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), exportEmployeesExcel);
router.post("/export-selected", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), exportSelectedEmployeesExcel);

export default router;