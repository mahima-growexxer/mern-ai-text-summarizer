/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Redis client utility for AI Text Summarizer
 * Provides Redis connection for caching and rate limiting
 */

const Redis = require("ioredis");

/**
 * Get Redis client instance
 * Creates and returns a Redis connection for caching operations
 * @returns Redis client instance
 */
const getRedisClient = () => {
    return new Redis(process.env.REDIS_URL || "redis://localhost:6379");
};

module.exports = { getRedisClient };
