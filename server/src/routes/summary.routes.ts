/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary routes for AI Text Summarizer
 * Defines API endpoints for text summarization
 */

const express = require("express");
const { summarizeText } = require("../controllers/summary.controller");

const router = express.Router();

/**
 * POST /api/summary
 * Endpoint to summarize text using AI
 * Requires text in request body
 */
router.post("/", summarizeText);

module.exports = router;