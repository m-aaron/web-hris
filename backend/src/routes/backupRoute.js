/**
 * backupRoute.js
 * 
 * Routes for backup management endpoints.
 * All endpoints require ADMIN authentication.
 */

import express from "express";
import { ROLES } from "../constants/roleConstant.js";
import { authenticate } from "../middlewares/authenticateMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeMiddleware.js";
import {
    getBackupSummary,
    listAllBackups,
    downloadBackup
} from "../controllers/backupController.js";

const router = express.Router();

/**
 * All backup endpoints require ADMIN role
 */

/**
 * GET /api/backups/summary
 * Returns summary of recent backups
 */
router.get(
    "/summary",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.HR),
    getBackupSummary
);

/**
 * GET /api/backups/list
 * Returns list of all backups with metadata
 * Query params:
 *   - limit: number of backups to return (default: all)
 */
router.get(
    "/list",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.HR),
    listAllBackups
);

/**
 * GET /api/backups/download/:filename
 * Download a specific backup file
 */
router.get(
    "/download/:filename",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.HR),
    downloadBackup
);

export default router;
