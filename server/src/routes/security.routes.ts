/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Security routes for AI Text Summarizer
 * Provides security monitoring endpoints
 */

import express from "express";
import { promises as fs } from "fs";
import path from "path";
import type { Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = express.Router();

/**
 * Get security logs from file
 * GET /api/security/logs
 * Requires admin authentication
 */
router.get("/logs", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const logPath = path.join(__dirname, "../../logs/security.log");

        // Read the security log file
        const logContent = await fs.readFile(logPath, 'utf-8');

        // Parse log entries (assuming JSON format from Winston)
        const logLines = logContent.trim().split('\n').filter((line: string) => line.trim());
        const logs = logLines.map((line: string) => {
            try {
                return JSON.parse(line);
            } catch {
                // If not JSON, return as plain text
                return { message: line, timestamp: new Date().toISOString() };
            }
        }).reverse(); // Show newest first

        res.json({
            success: true,
            data: {
                logs: logs.slice(0, 50), // Limit to last 50 entries
                total: logs.length
            }
        });
    } catch (error) {
        console.error('Error reading security logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to read security logs'
        });
    }
});

export default router;
