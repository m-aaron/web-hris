import { Router } from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import { 
    createEmployee, 
    updateEmployee,
    updateEmployeePhoto, 
    getEmployees, 
    getEmployeeById,
    archiveEmployee,
    restoreEmployee,
    bulkArchiveEmployees,
    changeEmployeeStatus,
    exportEmployeesExcel,
    exportSelectedEmployeesExcel,

    getAllActivePositions,
    getAllActiveDesignations,

    getAllActiveEmployees
} from "../controllers/employeeController.js";


const router = Router();

// STATIC ROUTES    

router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), createEmployee);
router.get("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getEmployees);

router.put("/bulk-archive", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), bulkArchiveEmployees);

router.get("/export", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), exportEmployeesExcel);
router.post("/export-selected", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), exportSelectedEmployeesExcel);

router.get("/positions/active", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getAllActivePositions);
router.get("/designations/active", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getAllActiveDesignations);

router.get("/active", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getAllActiveEmployees);


// DYNAMIC ROUTES

router.put("/:id/photo", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), upload.single("photo"), updateEmployeePhoto);

router.get("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), getEmployeeById);
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), updateEmployee);

router.put("/:id/archive", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), archiveEmployee);
router.put("/:id/restore", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), restoreEmployee);

router.put("/:id/status", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.HR), changeEmployeeStatus); 


export default router;