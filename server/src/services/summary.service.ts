/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary service for AI Text Summarizer
 * Handles business logic for text summarization with caching
 */

const { OpenAI } = require("openai");
const dotenv = require('dotenv');
const { getRedisClient } = require("../utils/redisClient");
const crypto = require("crypto");
const Summary = require("../models/summary");

// Initialize Redis client for caching
const redisClient = getRedisClient();

// Load environment variables
dotenv.config();

// Initialize OpenAI client with API key
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Summarize text using AI with caching optimization
 * @param text - Input text to be summarized
 * @returns Promise<string> - Generated summary
 */
const summaryService = {
    summarizeText: async (text: string) => {
        // Generate hash for caching and database lookup
        const hash = crypto.createHash('sha256').update(text).digest('hex');

        // Check Redis cache first for fastest response
        const cachedSummary = await redisClient.get(hash);
        const summary = await Summary.findOne({ textHash: hash });

        if (cachedSummary) {
            console.log('Found in redis');
            return cachedSummary;
        } else if (summary) {
            console.log('Found in database');

            // Store in redis for future fast access
            await redisClient.set(hash, summary.summary, 'EX', 60 * 60 * 24);
            return summary.summary;
        }

        try {
            console.log('Not found in cache, calling openai API');

            // Call OpenAI API for text summarization
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text in 100 words: ${text}`
                    }
                ]
            });

            const generatedSummary = response.choices[0]?.message?.content || 'No summary generated';

            console.log('Saving to redis');
            // Cache the result in Redis with 24-hour expiration
            await redisClient.set(hash, generatedSummary, 'EX', 60 * 60 * 24);

            // Save to database for persistent storage
            await Summary.create({
                textHash: hash,
                inputText: text,
                summary: generatedSummary
            });

            return generatedSummary;
        } catch (error) {
            console.error('OpenAI API error:', error);
            return `Summary: ${text.substring(0, 100)}...`;
        }
    }
}

module.exports = summaryService;