/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Loader component for AI Text Summarizer
 * Displays loading spinner during API calls
 */

/**
 * Loader component - Loading indicator
 * Shows a spinning loader animation with better visibility
 * @returns JSX element containing the loading spinner
 */
const Loader = () => {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="relative">
                {/* Spinning ring with inline animation */}
                <div
                    className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"
                    style={{
                        animation: 'spin 1s linear infinite'
                    }}
                ></div>
                {/* Inner dot for better visibility */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
            </div>
            <span className="ml-3 text-gray-600 font-medium">Processing...</span>
        </div>
    )
}

export default Loader