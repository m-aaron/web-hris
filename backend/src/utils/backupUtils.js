/**
 * backupUtils.js
 * 
 * Unified backup utilities for consistent backup naming, storage, and logging
 * across the entire application (manual backups, resets, deployments)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the root backups directory (consolidates all backups in one place)
 */
export function getBackupsDirectory() {
    // Backups go to project root/backups folder
    const backupsDir = path.resolve(__dirname, "../../../backups");
    
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    return backupsDir;
}

/**
 * Get formatted timestamp with day name for readable backup naming
 * Format: "2026-05-25_124936_Monday"
 */
export function getReadableTimestamp() {
    const now = new Date();
    
    // Get date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    // Get time components
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    
    // Get day name
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[now.getDay()];
    
    return `${year}-${month}-${day}_${hours}${minutes}${seconds}_${dayName}`;
}

/**
 * Generate standardized backup filename
 * Format: hris_backup_[YYYY-MM-DD]_[HHmmss]_[DayName].sql
 * Example: hris_backup_2026-05-25_124936_Monday.sql
 */
export function generateBackupFilename(context = "manual") {
    const timestamp = getReadableTimestamp();
    return `hris_backup_${timestamp}.sql`;
}

/**
 * Get full backup file path
 */
export function getBackupFilePath(filename = null) {
    const backupsDir = getBackupsDirectory();
    const filename_ = filename || generateBackupFilename();
    return path.join(backupsDir, filename_);
}

/**
 * Create backup metadata file
 * Stores information about each backup for HR tracking
 */
export function createBackupMetadata(filename, context = "manual", description = "") {
    const now = new Date();
    const metadataPath = path.join(getBackupsDirectory(), `${filename}.meta.json`);
    
    const metadata = {
        filename,
        timestamp: now.toISOString(),
        readableTimestamp: now.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "UTC"
        }),
        context, // "manual", "reset", "deployment", "scheduled"
        description,
        backupSize: null, // Will be set after backup completes
        status: "pending"
    };
    
    // Store metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
    return metadata;
}

/**
 * Update backup metadata after successful backup
 */
export function updateBackupMetadata(filename, status = "completed", backupSize = null) {
    const metadataPath = path.join(getBackupsDirectory(), `${filename}.meta.json`);
    
    try {
        let metadata = {};
        if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        }
        
        metadata.status = status;
        if (backupSize !== null) {
            metadata.backupSize = backupSize;
            metadata.backupSizeFormatted = formatFileSize(backupSize);
        }
        metadata.completedAt = new Date().toISOString();
        
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
        return metadata;
    } catch (error) {
        console.error(`[Backup Utils] Failed to update metadata for ${filename}:`, error.message);
    }
}

/**
 * Format file size for human readability (bytes to MB/GB)
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * List all backups with metadata
 */
export function listBackups(limit = null) {
    const backupsDir = getBackupsDirectory();
    const files = fs.readdirSync(backupsDir);
    
    const backups = files
        .filter(f => f.endsWith(".sql") && !f.includes(".meta"))
        .map(filename => {
            const filepath = path.join(backupsDir, filename);
            const stats = fs.statSync(filepath);
            const metadataPath = path.join(backupsDir, `${filename}.meta.json`);
            
            let metadata = null;
            if (fs.existsSync(metadataPath)) {
                try {
                    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
                } catch (e) {
                    // Ignore metadata parse errors
                }
            }
            
            return {
                filename,
                path: filepath,
                size: stats.size,
                sizeFormatted: formatFileSize(stats.size),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                metadata
            };
        })
        .sort((a, b) => b.modifiedAt - a.modifiedAt);
    
    return limit ? backups.slice(0, limit) : backups;
}

/**
 * Get backup summary for display in UI/logs
 */
export function getBackupSummary() {
    const backups = listBackups(5);
    
    return {
        totalBackups: backups.length,
        latestBackup: backups.length > 0 ? {
            filename: backups[0].filename,
            size: backups[0].sizeFormatted,
            createdAt: backups[0].metadata?.readableTimestamp || backups[0].createdAt.toLocaleString(),
            context: backups[0].metadata?.context || "unknown"
        } : null,
        backupsDirectory: getBackupsDirectory(),
        recentBackups: backups.slice(0, 5).map(b => ({
            filename: b.filename,
            size: b.sizeFormatted,
            createdAt: b.metadata?.readableTimestamp || b.createdAt.toLocaleString(),
            context: b.metadata?.context || "unknown"
        }))
    };
}

/**
 * Cleanup old backups (keep only N most recent)
 */
export function cleanupOldBackups(keepCount = 10) {
    const backups = listBackups();
    
    if (backups.length <= keepCount) {
        return { deleted: 0, backupsRemaining: backups.length };
    }
    
    const toDelete = backups.slice(keepCount);
    let deleted = 0;
    
    toDelete.forEach(backup => {
        try {
            fs.unlinkSync(backup.path);
            const metadataPath = backup.path + ".meta.json";
            if (fs.existsSync(metadataPath)) {
                fs.unlinkSync(metadataPath);
            }
            deleted++;
        } catch (error) {
            console.error(`[Backup Utils] Failed to delete backup ${backup.filename}:`, error.message);
        }
    });
    
    return { deleted, backupsRemaining: backups.length - deleted };
}

/**
 * Add header comment to SQL backup file with metadata
 */
export function addBackupHeader(filepath, context = "manual", description = "") {
    try {
        const content = fs.readFileSync(filepath, "utf-8");
        const now = new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        
        const header = `-- MC HRIS Database Backup
-- Generated: ${now}
-- Context: ${context}
-- Description: ${description || "No description"}
-- Database: hris_db
-- This file contains a complete database schema and data snapshot

`;
        
        const updatedContent = header + content;
        fs.writeFileSync(filepath, updatedContent, "utf-8");
    } catch (error) {
        console.error(`[Backup Utils] Failed to add header to backup:`, error.message);
    }
}

export default {
    getBackupsDirectory,
    getReadableTimestamp,
    generateBackupFilename,
    getBackupFilePath,
    createBackupMetadata,
    updateBackupMetadata,
    formatFileSize,
    listBackups,
    getBackupSummary,
    cleanupOldBackups,
    addBackupHeader
};
