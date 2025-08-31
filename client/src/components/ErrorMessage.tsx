/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * ErrorMessage component for AI Text Summarizer
 * Displays error messages to users
 */

/**
 * ErrorMessage component - Error display
 * Shows error messages with appropriate styling
 * @param props - Component props containing error type
 * @returns JSX element containing error message
 */
const ErrorMessage = ({ type }: { type: string }) => {
    return (
        <div className="text-red-500">
            {type === 'pleaseEnterSomeTextToSummarize' && 'Please enter some text to summarize'}
            {type === 'lessThan10Characters' && 'Text must be at least 10 characters long'}
            {type === 'failedToSummarize' && 'Failed to summarize text'}
        </div>
    )
}

export default ErrorMessage