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
const SmartCache = require("../utils/smartCache");

// Initialize Redis client for caching
const redisClient = getRedisClient();

// Load environment variables
dotenv.config();

// Initialize OpenAI client with API key
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Summarize text using AI with smart caching optimization
 * @param text - Input text to be summarized
 * @returns Promise<string> - Generated summary
 */
const summaryService = {
    summarizeText: async (text: string) => {
        // Generate smart cache key using normalization and categorization
        const smartCacheKey = SmartCache.generateCacheKey(text);
        const normalizedText = SmartCache.normalizeText(text);

        console.log(`Smart cache key: ${smartCacheKey}`);
        console.log(`Normalized text: ${normalizedText.substring(0, 100)}...`);

        // Step 1: Check Redis cache with smart key (fastest)
        const cachedSummary = await redisClient.get(smartCacheKey);
        if (cachedSummary) {
            console.log('Found in Redis cache (smart key)');
            return cachedSummary;
        }

        // Step 2: Check for similar cached entries in Redis
        const similarCacheKey = await findSimilarCacheEntry(text, redisClient);
        if (similarCacheKey) {
            const similarSummary = await redisClient.get(similarCacheKey);
            if (similarSummary) {
                console.log('Found similar entry in Redis cache');
                // Cache this result with the new key for future fast access
                await redisClient.set(smartCacheKey, similarSummary, 'EX', 60 * 60 * 24);
                return similarSummary;
            }
        }

        // Step 3: Check MongoDB with normalized text hash
        const normalizedHash = crypto.createHash('sha256').update(normalizedText).digest('hex');
        const summary = await Summary.findOne({ textHash: normalizedHash });

        if (summary) {
            console.log('Found in MongoDB (normalized)');
            // Store in Redis with smart key for future fast access
            await redisClient.set(smartCacheKey, summary.summary, 'EX', 60 * 60 * 24);
            return summary.summary;
        }

        // Step 4: Check for similar entries in MongoDB
        const similarDbEntry = await findSimilarDatabaseEntry(text);
        if (similarDbEntry) {
            console.log('Found similar entry in MongoDB');
            // Cache both in Redis and create new DB entry
            await redisClient.set(smartCacheKey, similarDbEntry.summary, 'EX', 60 * 60 * 24);
            const contentType = SmartCache.detectContentType(normalizedText);
            const wordCount = SmartCache.getWordCount(normalizedText);

            await Summary.create({
                textHash: normalizedHash,
                normalizedHash: normalizedHash,
                inputText: text,
                normalizedText: normalizedText,
                contentType: contentType,
                wordCount: wordCount,
                summary: similarDbEntry.summary
            });
            return similarDbEntry.summary;
        }

        try {
            console.log('No cache found, calling OpenAI API');

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

            console.log('Saving to Redis and MongoDB');

            // Cache the result in Redis with smart key and 24-hour expiration
            await redisClient.set(smartCacheKey, generatedSummary, 'EX', 60 * 60 * 24);

            // Save to database for persistent storage with smart caching metadata
            const contentType = SmartCache.detectContentType(normalizedText);
            const wordCount = SmartCache.getWordCount(normalizedText);

            await Summary.create({
                textHash: normalizedHash,
                normalizedHash: normalizedHash,
                inputText: text,
                normalizedText: normalizedText,
                contentType: contentType,
                wordCount: wordCount,
                summary: generatedSummary
            });

            return generatedSummary;
        } catch (error) {
            console.error('OpenAI API error:', error);
            return `Summary: ${text.substring(0, 100)}...`;
        }
    }
}

/**
 * Find similar cache entry in Redis based on content type and word count
 * @param text - Original input text
 * @param redisClient - Redis client instance
 * @returns Similar cache key if found, null otherwise
 */
async function findSimilarCacheEntry(text: string, redisClient: any): Promise<string | null> {
    const normalizedText = SmartCache.normalizeText(text);
    const wordCount = SmartCache.getWordCount(normalizedText);
    const contentType = SmartCache.detectContentType(normalizedText);

    // Search for similar entries with same content type and similar word count
    const minWords = Math.floor(wordCount * 0.8);
    const maxWords = Math.ceil(wordCount * 1.2);

    try {
        // Get all keys matching the content type pattern
        const pattern = `${contentType}_*`;
        const keys = await redisClient.keys(pattern);

        // Filter keys by word count similarity
        for (const key of keys) {
            const keyParts = key.split('_');
            if (keyParts.length >= 2) {
                const keyWordCount = parseInt(keyParts[1]);
                if (keyWordCount >= minWords && keyWordCount <= maxWords) {
                    return key;
                }
            }
        }
    } catch (error) {
        console.error('Error finding similar cache entry:', error);
    }

    return null;
}

/**
 * Find similar database entry based on normalized text similarity
 * @param text - Original input text
 * @returns Similar summary document if found, null otherwise
 */
async function findSimilarDatabaseEntry(text: string): Promise<any | null> {
    const normalizedText = SmartCache.normalizeText(text);
    const wordCount = SmartCache.getWordCount(normalizedText);
    const contentType = SmartCache.detectContentType(normalizedText);

    try {
        // Find summaries with similar word count (±20%) and same content type
        const minWords = Math.floor(wordCount * 0.8);
        const maxWords = Math.ceil(wordCount * 1.2);

        // First, try to find by content type and similar word count
        const similarByCategory = await Summary.find({
            contentType: contentType,
            wordCount: { $gte: minWords, $lte: maxWords }
        }).sort({ createdAt: -1 }).limit(3);

        if (similarByCategory.length > 0) {
            return similarByCategory[0]; // Return the most recent similar entry
        }

        // Fallback: Use text search on normalized text
        const searchTerms = normalizedText.split(' ').slice(0, 5).join(' '); // Use first 5 words
        const similarSummaries = await Summary.find({
            $text: { $search: searchTerms },
            wordCount: { $gte: minWords, $lte: maxWords }
        }).limit(5);

        if (similarSummaries.length > 0) {
            return similarSummaries[0];
        }

    } catch (error) {
        console.error('Error finding similar database entry:', error);
    }

    return null;
}

module.exports = summaryService;