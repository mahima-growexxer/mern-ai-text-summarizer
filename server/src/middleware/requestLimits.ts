/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Request limits middleware for AI Text Summarizer
 * Provides protection against DoS attacks and resource exhaustion
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Request timeout middleware
 * Prevents long-running requests from consuming resources
 * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
 */
const requestTimeout = (timeoutMs: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Set request timeout
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                console.warn(`Request timeout: ${req.method} ${req.url} from IP: ${req.ip}`);
                res.status(408).json({
                    error: 'Request timeout',
                    statusCode: 408,
                    timestamp: new Date().toISOString()
                });
            }
        }, timeoutMs);

        // Clear timeout when response is finished
        res.on('finish', () => {
            clearTimeout(timeout);
        });

        next();
    };
};

/**
 * Content-Type validation middleware
 * Ensures only allowed content types are processed
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const validateContentType = (req: Request, res: Response, next: NextFunction) => {
    // Skip validation for GET requests
    if (req.method === 'GET') {
        return next();
    }

    const contentType = req.headers['content-type'];
    const allowedTypes = [
        'application/json',
        'application/json; charset=utf-8'
    ];

    if (!contentType || !allowedTypes.some(type => contentType.includes(type.split(';')[0]))) {
        console.warn(`Invalid content type: ${contentType} from IP: ${req.ip}`);
        return res.status(415).json({
            error: 'Unsupported Media Type. Expected application/json',
            statusCode: 415,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * Request frequency limiter per IP
 * Prevents rapid-fire requests from single IP
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const requestFrequencyLimiter = (() => {
    const requestCounts = new Map<string, { count: number; timestamp: number }>();
    const windowMs = 1000; // 1 second window
    const maxRequests = 5; // Max 5 requests per second per IP

    return (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || 'unknown';
        const now = Date.now();

        const clientData = requestCounts.get(clientIp);

        if (!clientData || now - clientData.timestamp > windowMs) {
            // Reset or initialize counter
            requestCounts.set(clientIp, { count: 1, timestamp: now });
        } else {
            // Increment counter
            clientData.count++;

            if (clientData.count > maxRequests) {
                console.warn(`Request frequency limit exceeded: ${clientIp} - ${clientData.count} requests`);
                return res.status(429).json({
                    error: 'Too many requests. Please slow down.',
                    statusCode: 429,
                    retryAfter: Math.ceil(windowMs / 1000),
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance
            const cutoff = now - windowMs * 10; // Keep last 10 windows
            for (const [ip, data] of requestCounts.entries()) {
                if (data.timestamp < cutoff) {
                    requestCounts.delete(ip);
                }
            }
        }

        next();
    };
})();

/**
 * Request size validator
 * Validates request payload size before processing
 * @param maxSize - Maximum allowed size in bytes
 */
const validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => { // 10MB default
    return (req: Request, res: Response, next: NextFunction) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');

        if (contentLength > maxSize) {
            console.warn(`Request too large: ${contentLength} bytes from IP: ${req.ip}`);
            return res.status(413).json({
                error: `Request payload too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
                statusCode: 413,
                timestamp: new Date().toISOString()
            });
        }

        next();
    };
};

/**
 * Header security validator
 * Validates and sanitizes request headers
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious User-Agent strings
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousPatterns = [
        /sqlmap/i,
        /nikto/i,
        /nessus/i,
        /burp/i,
        /nmap/i,
        /<script/i,
        /javascript:/i
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(userAgent)) {
            console.warn(`Suspicious User-Agent detected: ${userAgent} from IP: ${req.ip}`);
            return res.status(400).json({
                error: 'Invalid request headers',
                statusCode: 400,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Limit header count to prevent header pollution attacks
    const headerCount = Object.keys(req.headers).length;
    if (headerCount > 50) {
        console.warn(`Too many headers: ${headerCount} from IP: ${req.ip}`);
        return res.status(400).json({
            error: 'Too many request headers',
            statusCode: 400,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

module.exports = {
    requestTimeout,
    validateContentType,
    requestFrequencyLimiter,
    validateRequestSize,
    validateHeaders
};
