/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Authentication middleware for AI Text Summarizer
 * Handles JWT token verification and user authorization
 */

import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        isAdmin: boolean;
    };
}

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Access token required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: "Invalid or expired token"
        });
    }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Authentication required"
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            error: "Admin access required"
        });
    }

    next();
};
