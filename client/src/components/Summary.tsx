/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Summary component for AI Text Summarizer
 * Displays generated text summaries
 */

/**
 * Summary component - Summary display
 * Shows the generated summary text with styling
 * @param props - Component props containing summary text
 * @returns JSX element containing the summary
 */
const Summary = ({ text }: { text: string }) => {
    return (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Summary:</h3>
            <p>{text}</p>
        </div>
    )
}

export default Summary