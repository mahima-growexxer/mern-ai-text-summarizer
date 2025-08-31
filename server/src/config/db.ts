/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Database configuration for AI Text Summarizer
 * Handles MongoDB connection setup and management
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Connect to MongoDB database
 * Establishes connection with error handling and logging
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;