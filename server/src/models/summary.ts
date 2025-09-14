/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary model for AI Text Summarizer
 * Defines MongoDB schema for storing text summaries
 */

const mongoose = require("mongoose");

/**
 * MongoDB schema for summary documents
 * Includes indexes for performance optimization
 */
const summarySchema = new mongoose.Schema({
    textHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    normalizedHash: {
        type: String,
        required: false,
        index: true
    },
    inputText: {
        type: String,
        required: true,
        index: true
    },
    normalizedText: {
        type: String,
        required: false,
        index: true
    },
    contentType: {
        type: String,
        required: false,
        index: true
    },
    wordCount: {
        type: Number,
        required: false,
        index: true
    },
    summary: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries by hash and creation time
summarySchema.index({ textHash: 1, createdAt: -1 });
summarySchema.index({ normalizedHash: 1, createdAt: -1 });

// Text index for full-text search capabilities on input text
summarySchema.index({ inputText: 'text' });
summarySchema.index({ normalizedText: 'text' });

// Smart caching indexes for content categorization and similarity
summarySchema.index({ contentType: 1, wordCount: 1 });
summarySchema.index({ contentType: 1, wordCount: 1, createdAt: -1 });

const Summary = mongoose.model("Summary", summarySchema);

module.exports = Summary;
