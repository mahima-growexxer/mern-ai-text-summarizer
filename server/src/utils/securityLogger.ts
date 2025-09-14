/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Security logging utility for AI Text Summarizer
 * Tracks security events and suspicious activities using Winston
 */

import type { Request } from 'express';
const winston = require('winston');

/**
 * Security event types
 */
enum SecurityEventType {
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    LARGE_PAYLOAD = 'LARGE_PAYLOAD',
    INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
    REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
    MALICIOUS_PATTERN = 'MALICIOUS_PATTERN',
    API_ERROR = 'API_ERROR',
    SUCCESS = 'SUCCESS'
}

/**
 * Security event interface
 */
interface SecurityEvent {
    timestamp: string;
    eventType: SecurityEventType;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    clientIp: string;
    userAgent: string;
    url: string;
    method: string;
    statusCode?: number;
    additionalData?: any;
}

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'ai-text-summarizer' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all security logs to `security.log`
        new winston.transports.File({ filename: 'logs/security.log', level: 'warn' }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Security logger class with Winston integration
 */
class SecurityLogger {
    /**
     * Log a security event using Winston
     * @param eventType - Type of security event
     * @param message - Event message
     * @param req - Express request object
     * @param severity - Event severity level
     * @param additionalData - Additional event data
     */
    logEvent(
        eventType: SecurityEventType,
        message: string,
        req: Request,
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
        additionalData?: any
    ): void {
        const logData = {
            eventType,
            severity,
            clientIp: this.getClientIP(req),
            userAgent: req.headers['user-agent'] || 'Unknown',
            url: req.url,
            method: req.method,
            ...additionalData
        };

        // Map severity to Winston log levels
        switch (severity) {
            case 'CRITICAL':
                logger.error(message, logData);
                break;
            case 'HIGH':
                logger.error(message, logData);
                break;
            case 'MEDIUM':
                logger.warn(message, logData);
                break;
            case 'LOW':
                logger.info(message, logData);
                break;
        }
    }

    /**
     * Log rate limit exceeded event
     * @param req - Express request object
     * @param limitType - Type of rate limit exceeded
     */
    logRateLimitExceeded(req: Request, limitType: string): void {
        this.logEvent(
            SecurityEventType.RATE_LIMIT_EXCEEDED,
            `Rate limit exceeded: ${limitType}`,
            req,
            'HIGH',
            { limitType }
        );
    }

    /**
     * Log suspicious request
     * @param req - Express request object
     * @param reason - Reason for suspicion
     */
    logSuspiciousRequest(req: Request, reason: string): void {
        this.logEvent(
            SecurityEventType.SUSPICIOUS_REQUEST,
            `Suspicious request detected: ${reason}`,
            req,
            'HIGH',
            { reason }
        );
    }

    /**
     * Log validation failure
     * @param req - Express request object
     * @param validationType - Type of validation that failed
     * @param details - Validation failure details
     */
    logValidationFailed(req: Request, validationType: string, details: string): void {
        this.logEvent(
            SecurityEventType.VALIDATION_FAILED,
            `Validation failed: ${validationType} - ${details}`,
            req,
            'MEDIUM',
            { validationType, details }
        );
    }

    /**
     * Log successful API request
     * @param req - Express request object
     * @param responseTime - Request response time
     */
    logSuccess(req: Request, responseTime?: number): void {
        this.logEvent(
            SecurityEventType.SUCCESS,
            'API request completed successfully',
            req,
            'LOW',
            { responseTime }
        );
    }

    /**
     * Log API error
     * @param req - Express request object
     * @param error - Error object
     * @param statusCode - HTTP status code
     */
    logError(req: Request, error: Error, statusCode: number): void {
        this.logEvent(
            SecurityEventType.API_ERROR,
            `API error: ${error.message}`,
            req,
            statusCode >= 500 ? 'CRITICAL' : 'MEDIUM',
            {
                errorName: error.name,
                statusCode,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        );
    }

    /**
     * Get client IP address from request
     * @param req - Express request object
     * @returns Client IP address
     */
    private getClientIP(req: Request): string {
        return req.ip ||
            req.connection.remoteAddress ||
            req.headers['x-forwarded-for'] as string ||
            req.headers['x-real-ip'] as string ||
            'unknown';
    }
}

// Create singleton instance
const securityLogger = new SecurityLogger();

module.exports = {
    securityLogger,
    SecurityEventType
};
