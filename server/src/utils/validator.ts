/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Validator utility for AI Text Summarizer
 * Provides input validation functions for text processing
 */

/**
 * Interface for validation results
 */
interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validator object containing validation functions
 */
const validator = {
    /**
     * Validates text input for summarization
     * @param text - Text to validate
     * @returns ValidationResult - Object containing validation status and error message
     */
    validateText(text: string): ValidationResult {
        // Check if text exists
        if (!text) {
            return { isValid: false, error: 'Text is required' };
        }

        // Check minimum length requirement
        if (text.length < 10) {
            return { isValid: false, error: 'Text must be at least 10 characters long' };
        }

        // Check maximum length limit
        if (text.length > 5000) {
            return { isValid: false, error: 'Text must be less than 5000 characters long' };
        }

        return { isValid: true };
    }
};

module.exports = validator;
