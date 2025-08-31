/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary controller for AI Text Summarizer
 * Handles HTTP requests for text summarization
 */

import type { Request, Response } from "express";
const summaryService = require("../services/summary.service");
const validator = require("../utils/validator");

/**
 * Summarize text using AI service
 * @param req - Express request object containing text in body
 * @param res - Express response object
 * @returns JSON response with summary and metadata
 */
const summarizeText = async (req: Request, res: Response) => {
    try {
        const text = req.body?.text;

        // Validate input text using validator utility
        const validationResult = validator.validateText(text);
        if (!validationResult.isValid) {
            return res.status(400).json({
                error: validationResult.error
            });
        }

        // Call summary service to generate AI summary
        const summary = await summaryService.summarizeText(text);

        // Return successful response with summary and metadata
        res.json({
            summary,
            originalLength: text.length,
            summaryLength: summary.length
        });
    } catch (error) {
        console.error('Summarization error:', error);
        res.status(500).json({
            error: 'Failed to summarize text'
        });
    }
};

module.exports = { summarizeText };
