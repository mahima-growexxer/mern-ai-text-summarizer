/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary routes for AI Text Summarizer
 * Defines API endpoints for text summarization
 */

import express from "express";
import { summarizeText } from "../controllers/summary.controller";

const router = express.Router();

/**
 * POST /api/summary
 * Endpoint to summarize text using AI
 * Requires text in request body
 */
router.post("/", summarizeText);

export default router;