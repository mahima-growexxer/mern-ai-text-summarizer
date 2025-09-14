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
const { securityLogger } = require("../utils/securityLogger");

/**
 * Summarize text using AI service
 * @param req - Express request object containing text in body
 * @param res - Express response object
 * @returns JSON response with summary and metadata
 */
const summarizeText = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        // Validate request body structure
        const bodyValidation = validator.validateRequestBody(req.body);
        if (!bodyValidation.isValid) {
            securityLogger.logValidationFailed(req, 'Body Structure', bodyValidation.error || '');
            return res.status(400).json({
                error: bodyValidation.error
            });
        }

        const text = req.body.text;

        // Validate and sanitize input text using enhanced validator
        const validationResult = validator.validateText(text);
        if (!validationResult.isValid) {
            // Log specific attack type if detected
            if (validationResult.attackType) {
                if (validationResult.attackType === 'INPUT_TOO_LARGE') {
                    securityLogger.logSuspiciousRequest(req, `Large input attempt: ${validationResult.attackDetails}`);
                } else {
                    securityLogger.logSuspiciousRequest(req, `${validationResult.attackType}: ${validationResult.attackDetails}`);
                }
            } else {
                securityLogger.logValidationFailed(req, 'Text Input', validationResult.error || '');
            }

            return res.status(400).json({
                error: validationResult.error
            });
        }

        // Use sanitized text for processing
        const sanitizedText = validationResult.sanitizedText || text;

        // Call summary service to generate AI summary
        const summary = await summaryService.summarizeText(sanitizedText);

        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Log successful request
        securityLogger.logSuccess(req, responseTime);

        // Return successful response with summary and metadata
        res.json({
            summary,
            originalLength: text.length,
            sanitizedLength: sanitizedText.length,
            summaryLength: summary.length,
            responseTime: responseTime
        });
    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Log the error
        securityLogger.logError(req, error as Error, 500);

        console.error('Summarization error:', error);
        res.status(500).json({
            error: 'Failed to summarize text',
            responseTime: responseTime
        });
    }
};

module.exports = { summarizeText };
