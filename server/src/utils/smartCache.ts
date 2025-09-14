/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Smart caching utility for AI Text Summarizer
 * Implements intelligent text normalization and similarity-based caching
 */

const crypto = require("crypto");

/**
 * Content types for categorization
 */
enum ContentType {
    ARTICLE = 'article',
    EMAIL = 'email',
    DOCUMENT = 'document',
    NEWS = 'news',
    RESEARCH = 'research',
    GENERAL = 'general'
}

/**
 * Smart cache utility class
 */
class SmartCache {

    /**
     * Normalize text for better cache matching
     * Removes variations that don't affect meaning
     * @param text - Input text to normalize
     * @returns Normalized text string
     */
    static normalizeText(text: string): string {
        return text
            .toLowerCase()                          // Convert to lowercase
            .replace(/[^\w\s]/g, ' ')              // Replace punctuation with spaces
            .replace(/\s+/g, ' ')                  // Multiple spaces → single space
            .trim()                                // Remove leading/trailing spaces
            .replace(/\b(please|kindly|can you|could you)\s+/gi, '') // Remove polite words
            .replace(/\b(summarize|summary|summarise)\b/gi, 'summarize') // Normalize synonyms
            .replace(/\b(artificial intelligence|ai)\b/gi, 'ai') // Normalize AI terms
            .replace(/\b(machine learning|ml)\b/gi, 'ml')        // Normalize ML terms
            .replace(/\b(article|post|piece|content)\b/gi, 'article') // Normalize content types
            .trim();
    }

    /**
     * Detect content type based on keywords
     * @param normalizedText - Normalized text to analyze
     * @returns Content type category
     */
    static detectContentType(normalizedText: string): ContentType {
        const text = normalizedText.toLowerCase();

        if (text.includes('email') || text.includes('message') || text.includes('correspondence')) {
            return ContentType.EMAIL;
        }
        if (text.includes('news') || text.includes('breaking') || text.includes('report')) {
            return ContentType.NEWS;
        }
        if (text.includes('research') || text.includes('study') || text.includes('paper') || text.includes('journal')) {
            return ContentType.RESEARCH;
        }
        if (text.includes('article') || text.includes('blog') || text.includes('post')) {
            return ContentType.ARTICLE;
        }
        if (text.includes('document') || text.includes('file') || text.includes('pdf')) {
            return ContentType.DOCUMENT;
        }

        return ContentType.GENERAL;
    }

    /**
     * Calculate word count from text
     * @param text - Text to count words
     * @returns Number of words
     */
    static getWordCount(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Check if two texts have similar length (within 20% difference)
     * @param text1 - First text
     * @param text2 - Second text
     * @returns True if lengths are similar
     */
    static isSimilarLength(text1: string, text2: string): boolean {
        const count1 = this.getWordCount(text1);
        const count2 = this.getWordCount(text2);

        if (count1 === 0 || count2 === 0) return false;

        const ratio = Math.min(count1, count2) / Math.max(count1, count2);
        return ratio >= 0.8; // 80% similarity threshold
    }

    /**
     * Generate smart cache key with normalization and categorization
     * @param text - Original input text
     * @returns Smart cache key string
     */
    static generateCacheKey(text: string): string {
        const normalized = this.normalizeText(text);
        const wordCount = this.getWordCount(normalized);
        const contentType = this.detectContentType(normalized);

        // Create hash of normalized text
        const textHash = crypto.createHash('sha256').update(normalized).digest('hex');

        // Create structured cache key: contentType_wordCount_hash
        return `${contentType}_${wordCount}_${textHash}`;
    }

    /**
     * Generate similarity-based cache keys for fuzzy matching
     * Creates multiple keys for different word count ranges
     * @param text - Original input text
     * @returns Array of potential cache keys to check
     */
    static generateSimilarCacheKeys(text: string): string[] {
        const normalized = this.normalizeText(text);
        const wordCount = this.getWordCount(normalized);
        const contentType = this.detectContentType(normalized);
        const textHash = crypto.createHash('sha256').update(normalized).digest('hex');

        const keys: string[] = [];

        // Primary key (exact match)
        keys.push(`${contentType}_${wordCount}_${textHash}`);

        // Similar length keys (±20% word count)
        const minWords = Math.floor(wordCount * 0.8);
        const maxWords = Math.ceil(wordCount * 1.2);

        for (let count = minWords; count <= maxWords; count++) {
            if (count !== wordCount) {
                keys.push(`${contentType}_${count}_*`); // Wildcard for hash
            }
        }

        return keys;
    }

    /**
     * Create a pattern for Redis key matching
     * @param text - Original input text
     * @returns Redis pattern for SCAN operations
     */
    static generateCachePattern(text: string): string {
        const normalized = this.normalizeText(text);
        const wordCount = this.getWordCount(normalized);
        const contentType = this.detectContentType(normalized);

        // Pattern for similar content: same type, similar word count
        const minWords = Math.floor(wordCount * 0.8);
        const maxWords = Math.ceil(wordCount * 1.2);

        return `${contentType}_[${minWords}-${maxWords}]_*`;
    }
}

module.exports = SmartCache;
