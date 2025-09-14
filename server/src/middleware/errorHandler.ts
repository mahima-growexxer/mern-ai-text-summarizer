/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Secure error handling middleware for AI Text Summarizer
 * Prevents information leakage and provides consistent error responses
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Interface for standardized error responses
 */
interface ErrorResponse {
    error: string;
    statusCode: number;
    timestamp: string;
    path: string;
    requestId?: string;
}

/**
 * Custom application error class
 */
class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized, secure responses
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (in production, use proper logging service)
    console.error('Error Details:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Default error response
    let statusCode = error.statusCode || 500;
    let message = 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        // Mongoose validation error
        statusCode = 400;
        message = 'Invalid input data';
    } else if (err.name === 'CastError') {
        // Mongoose bad ObjectId
        statusCode = 400;
        message = 'Invalid resource ID';
    } else if (err.code === 11000) {
        // Mongoose duplicate key error
        statusCode = 400;
        message = 'Duplicate resource';
    } else if (err.name === 'JsonWebTokenError') {
        // JWT error
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        // JWT expired
        statusCode = 401;
        message = 'Token expired';
    } else if (err.type === 'entity.parse.failed') {
        // JSON parsing error
        statusCode = 400;
        message = 'Invalid JSON format';
    } else if (err.type === 'entity.too.large') {
        // Request too large
        statusCode = 413;
        message = 'Request payload too large';
    } else if (error.isOperational) {
        // Operational errors (safe to show message)
        message = error.message;
    }

    // Create standardized error response
    const errorResponse: ErrorResponse = {
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    // Add request ID if available (useful for tracking)
    if (req.headers['x-request-id']) {
        errorResponse.requestId = req.headers['x-request-id'] as string;
    }

    // In development, include more details
    if (process.env.NODE_ENV === 'development') {
        (errorResponse as any).details = {
            originalMessage: err.message,
            stack: err.stack,
        };
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for undefined routes
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

/**
 * Async error wrapper to catch async function errors
 * @param fn - Async function to wrap
 * @returns Wrapped function with error handling
 */
const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Security-focused request validation middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const securityValidator = (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
        if (req.headers[header]) {
            console.warn(`Suspicious header detected: ${header} = ${req.headers[header]}`);
        }
    }

    // Log unusual request patterns
    if (req.url.includes('..') || req.url.includes('%2e%2e')) {
        console.warn(`Directory traversal attempt detected: ${req.url} from IP: ${req.ip}`);
        return next(new AppError('Invalid request path', 400));
    }

    // Check for SQL injection patterns in URL
    const sqlPatterns = /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i;
    if (sqlPatterns.test(req.url)) {
        console.warn(`SQL injection attempt detected: ${req.url} from IP: ${req.ip}`);
        return next(new AppError('Invalid request format', 400));
    }

    next();
};

module.exports = {
    errorHandler,
    notFoundHandler,
    catchAsync,
    securityValidator,
    AppError
};
