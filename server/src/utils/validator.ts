/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Enhanced Validator utility for AI Text Summarizer
 * Provides input validation and sanitization functions for secure text processing
 */

const validatorLib = require('validator');

/**
 * Interface for validation results
 */
interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitizedText?: string;
    attackType?: string;
    attackDetails?: string;
}

/**
 * Validator object containing validation and sanitization functions
 */
const validator = {
    /**
     * Validates and sanitizes text input for summarization
     * @param text - Text to validate and sanitize
     * @returns ValidationResult - Object containing validation status, error message, and sanitized text
     */
    validateText(text: string): ValidationResult {
        // Check if text exists
        if (!text || typeof text !== 'string') {
            return { isValid: false, error: 'Text is required and must be a string' };
        }

        // Sanitize the input text
        let sanitizedText = this.sanitizeText(text);

        // Check if sanitized text is empty after cleaning
        if (!sanitizedText.trim()) {
            return { isValid: false, error: 'Text cannot be empty after sanitization' };
        }

        // Check minimum length requirement
        if (sanitizedText.length < 10) {
            return { isValid: false, error: 'Text must be at least 10 characters long' };
        }

        // Check maximum length limit (300 characters for this application)
        if (sanitizedText.length > 300) {
            return {
                isValid: false,
                error: 'Text must be less than 300 characters long',
                attackType: 'INPUT_TOO_LARGE',
                attackDetails: `Input length: ${sanitizedText.length} characters`
            };
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
            // XSS patterns
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
            /javascript:/gi, // JavaScript protocol
            /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
            /eval\s*\(/gi, // eval function calls
            /expression\s*\(/gi, // CSS expressions

            // SQL injection patterns
            /('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)|(\bunion\b)|(\bselect\b)|(\binsert\b)|(\bupdate\b)|(\bdelete\b)|(\bdrop\b)|(\bcreate\b)|(\balter\b)|(\bexec\b)|(\bexecute\b))/gi,
            /(\bunion\s+select\b)/gi, // Union select
            /(\bselect\s+.*\s+from\b)/gi, // Select from
            /(\binsert\s+into\b)/gi, // Insert into
            /(\bupdate\s+.*\s+set\b)/gi, // Update set
            /(\bdelete\s+from\b)/gi, // Delete from
            /(\bdrop\s+table\b)/gi, // Drop table
            /(\bcreate\s+table\b)/gi, // Create table
            /(\balter\s+table\b)/gi, // Alter table
            /(\bexec\s+\w+)/gi, // Exec commands
            /(\bxp_cmdshell\b)/gi, // SQL Server command shell
            /(\bwaitfor\s+delay\b)/gi, // Time-based SQL injection
            /(\bor\s+1\s*=\s*1\b)/gi, // Classic SQL injection
            /(\band\s+1\s*=\s*1\b)/gi, // Boolean-based SQL injection
        ];

        // Check for specific attack patterns with detailed logging
        const xssPatterns = [
            { pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, type: 'XSS Script Tags' },
            { pattern: /javascript:/gi, type: 'XSS JavaScript Protocol' },
            { pattern: /on\w+\s*=/gi, type: 'XSS Event Handlers' },
            { pattern: /eval\s*\(/gi, type: 'XSS Eval Function' },
            { pattern: /expression\s*\(/gi, type: 'XSS CSS Expression' }
        ];

        const sqlPatterns = [
            { pattern: /(\bunion\s+select\b)/gi, type: 'SQL Union Select' },
            { pattern: /(\bselect\s+.*\s+from\b)/gi, type: 'SQL Select From' },
            { pattern: /(\binsert\s+into\b)/gi, type: 'SQL Insert Into' },
            { pattern: /(\bupdate\s+.*\s+set\b)/gi, type: 'SQL Update Set' },
            { pattern: /(\bdelete\s+from\b)/gi, type: 'SQL Delete From' },
            { pattern: /(\bdrop\s+table\b)/gi, type: 'SQL Drop Table' },
            { pattern: /(\bcreate\s+table\b)/gi, type: 'SQL Create Table' },
            { pattern: /(\balter\s+table\b)/gi, type: 'SQL Alter Table' },
            { pattern: /(\bexec\s+\w+)/gi, type: 'SQL Exec Command' },
            { pattern: /(\bxp_cmdshell\b)/gi, type: 'SQL Command Shell' },
            { pattern: /(\bwaitfor\s+delay\b)/gi, type: 'SQL Time-based Injection' },
            { pattern: /(\bor\s+1\s*=\s*1\b)/gi, type: 'SQL Boolean Injection' },
            { pattern: /(\band\s+1\s*=\s*1\b)/gi, type: 'SQL Boolean Injection' },
            { pattern: /('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/))/gi, type: 'SQL Injection Characters' }
        ];

        // Check for XSS attacks
        for (const { pattern, type } of xssPatterns) {
            if (pattern.test(sanitizedText)) {
                return {
                    isValid: false,
                    error: `XSS attack detected: ${type}`,
                    attackType: 'XSS',
                    attackDetails: type
                };
            }
        }

        // Check for SQL injection attacks
        for (const { pattern, type } of sqlPatterns) {
            if (pattern.test(sanitizedText)) {
                return {
                    isValid: false,
                    error: `SQL injection attack detected: ${type}`,
                    attackType: 'SQL_INJECTION',
                    attackDetails: type
                };
            }
        }

        return {
            isValid: true,
            sanitizedText: sanitizedText
        };
    },

    /**
     * Sanitizes text input by removing/escaping dangerous content
     * @param text - Text to sanitize
     * @returns Sanitized text string
     */
    sanitizeText(text: string): string {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let sanitized = text;

        // Remove null bytes and control characters
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // Escape HTML entities to prevent XSS
        sanitized = validatorLib.escape(sanitized);

        // Remove excessive whitespace but preserve structure
        sanitized = sanitized.replace(/\s+/g, ' ').trim();

        // Remove potentially dangerous protocols
        sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, '');

        // Limit consecutive special characters
        sanitized = sanitized.replace(/[!@#$%^&*()_+=\[\]{}|;':",./<>?`~]{10,}/g, '');

        return sanitized;
    },

    /**
     * Validates request body structure
     * @param body - Request body to validate
     * @returns ValidationResult - Object containing validation status and error message
     */
    validateRequestBody(body: any): ValidationResult {
        if (!body || typeof body !== 'object') {
            return { isValid: false, error: 'Request body is required and must be an object' };
        }

        if (!body.text) {
            return { isValid: false, error: 'Text field is required in request body' };
        }

        // Check for unexpected fields
        const allowedFields = ['text'];
        const extraFields = Object.keys(body).filter(key => !allowedFields.includes(key));

        if (extraFields.length > 0) {
            return {
                isValid: false,
                error: `Unexpected fields in request: ${extraFields.join(', ')}`
            };
        }

        return { isValid: true };
    }
};

module.exports = validator;
