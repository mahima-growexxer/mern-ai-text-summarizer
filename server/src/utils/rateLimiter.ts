/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Rate limiter utility for AI Text Summarizer
 * Provides rate limiting middleware for API protection
 */

import type { Request, Response, NextFunction } from 'express';
const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('./redisClient');

// Initialize Redis client for distributed rate limiting
const redisClient = getRedisClient();

/**
 * Basic rate limiter for general API endpoints
 * Limits: 100 requests per 15 minutes per IP
 */
const basicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});

/**
 * Strict rate limiter for summary API (more restrictive)
 * Limits: 10 requests per minute per IP
 */
const summaryLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 summary requests per minute
    message: {
        error: 'Too many summary requests, please try again later.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: 'Too many summary requests, please try again later.',
            retryAfter: '1 minute'
        });
    }
});

/**
 * Custom Redis-based rate limiter for distributed systems
 * Provides more control over rate limiting logic
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const redisRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const key = `rate_limit:${clientIp}`;
        const windowMs = 60 * 1000; // 1 minute
        const maxRequests = 20; // 20 requests per minute

        // Get current request count from Redis
        const currentCount = await redisClient.get(key);
        const count = currentCount ? parseInt(currentCount) : 0;

        // Check if rate limit exceeded
        if (count >= maxRequests) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000),
                remainingRequests: 0
            });
        }

        // Increment request count in Redis
        if (count === 0) {
            // First request in this window
            await redisClient.setex(key, Math.ceil(windowMs / 1000), '1');
        } else {
            // Increment existing count
            await redisClient.incr(key);
        }

        // Add rate limit headers for client information
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - count - 1);
        res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        // If Redis fails, allow the request to proceed
        next();
    }
};

/**
 * Rate limiter middleware factory
 * Creates custom rate limiters with configurable options
 * @param options - Configuration options for rate limiter
 * @returns Rate limiter middleware function
 */
const createRateLimiter = (options: {
    windowMs?: number;
    max?: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message || 'Rate limit exceeded',
        keyGenerator: options.keyGenerator || ((req: Request) => req.ip || 'unknown'),
        standardHeaders: true,
        legacyHeaders: false
    });
};

/**
 * Export rate limiter utilities
 */
const rateLimiter = {
    basicLimiter,
    summaryLimiter,
    redisRateLimiter,
    createRateLimiter
};

module.exports = rateLimiter;