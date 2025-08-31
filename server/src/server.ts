/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Server entry point for AI Text Summarizer application
 * Handles server initialization and port configuration
 */

const app = require("./app");

const PORT = process.env.PORT || 5000;

/**
 * Start the Express server and listen on specified port
 * Logs server status when successfully started
 */
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});