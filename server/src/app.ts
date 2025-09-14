/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Express application configuration for AI Text Summarizer
 * Sets up middleware, routes, and database connection
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import summaryRoutes from "./routes/summary.routes";
import securityRoutes from "./routes/security.routes";
import authRoutes from "./routes/auth.routes";
import connectDB from "./config/db";
import { basicLimiter, summaryLimiter } from "./utils/rateLimiter";
import { errorHandler, notFoundHandler, securityValidator } from "./middleware/errorHandler";
import { requestTimeout, validateContentType, requestFrequencyLimiter, validateRequestSize, validateHeaders } from "./middleware/requestLimits";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable CORS first (before other middleware that might block preflight requests)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-HTTP-Method-Override'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Apply security headers middleware (should be first)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: true, // Allow for development
}));

// Request timeout protection (30 seconds)
app.use(requestTimeout(30000));

// Validate request headers
app.use(validateHeaders);

// Request frequency limiter (5 requests per second per IP)
app.use(requestFrequencyLimiter);

// Validate request size (5MB limit for this app)
app.use(validateRequestSize(5 * 1024 * 1024));

// Apply rate limiting middleware for general API protection
app.use(basicLimiter); // General rate limiting for all routes

// Security validation middleware
app.use(securityValidator);

// Validate content type (but skip for OPTIONS requests)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next(); // Skip validation for preflight requests
    }
    return validateContentType(req, res, next);
});

// Parse JSON request bodies with size limits
app.use(express.json({
    limit: '5mb', // Match our request size limit
    strict: true,
    type: 'application/json'
}));

// Authentication routes (with basic rate limiting)
app.use("/api/auth", basicLimiter, authRoutes);

// Apply specific rate limiting and routes for summary API
app.use("/api/summary", summaryLimiter, summaryRoutes);

// Security monitoring routes (with basic rate limiting)
app.use("/api/security", basicLimiter, securityRoutes);

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Initialize database connection
connectDB();

module.exports = app;