/**
 * backupController.js
 * 
 * API endpoints for viewing backup status and information.
 * Available only to ADMIN users for security.
 */

import {
    getBackupSummary as getBackupSummaryUtil,
    listBackups,
    formatFileSize
} from "../utils/backupUtils.js";

/**
 * GET /api/backups/summary
 * Returns summary of recent backups (admin only)
 */
export async function getBackupSummary(req, res) {
    try {
        const summary = getBackupSummaryUtil();
        
        res.json({
            status: "success",
            data: summary
        });
    } catch (error) {
        console.error("[Backup Controller] Error getting backup summary:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve backup summary",
            error: error.message
        });
    }
}

/**
 * GET /api/backups/list
 * Returns list of all backups with metadata (admin only)
 */
export async function listAllBackups(req, res) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const backups = listBackups(limit);
        
        res.json({
            status: "success",
            count: backups.length,
            data: backups.map(b => ({
                filename: b.filename,
                size: b.sizeFormatted,
                createdAt: b.createdAt,
                metadata: b.metadata || {
                    context: "unknown",
                    status: "unknown"
                }
            }))
        });
    } catch (error) {
        console.error("[Backup Controller] Error listing backups:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve backup list",
            error: error.message
        });
    }
}

/**
 * GET /api/backups/:filename
 * Download a specific backup file (admin only)
 * Note: For security, backups should be downloaded through secured endpoint only
 */
export async function downloadBackup(req, res) {
    try {
        const { filename } = req.params;
        
        // Validate filename format to prevent directory traversal
        if (!filename.match(/^hris_backup_.*\.sql$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid backup filename"
            });
        }
        
        const backups = listBackups();
        const backup = backups.find(b => b.filename === filename);
        
        if (!backup) {
            return res.status(404).json({
                status: "error",
                message: "Backup file not found"
            });
        }
        
        res.download(backup.path, filename, (err) => {
            if (err) {
                console.error("[Backup Controller] Error downloading backup:", err);
                res.status(500).json({
                    status: "error",
                    message: "Failed to download backup file"
                });
            }
        });
    } catch (error) {
        console.error("[Backup Controller] Error in download:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to process backup download",
            error: error.message
        });
    }
}
