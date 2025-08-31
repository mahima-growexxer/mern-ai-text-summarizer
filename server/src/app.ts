/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Express application configuration for AI Text Summarizer
 * Sets up middleware, routes, and database connection
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const summaryRoutes = require("./routes/summary.routes");
const connectDB = require("./config/db");
const { basicLimiter, summaryLimiter } = require("./utils/rateLimiter");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Apply rate limiting middleware for general API protection
app.use(basicLimiter); // General rate limiting for all routes

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Apply specific rate limiting and routes for summary API
app.use("/api/summary", summaryLimiter, summaryRoutes);

// Initialize database connection
connectDB();

module.exports = app;