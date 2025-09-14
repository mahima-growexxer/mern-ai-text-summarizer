/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Home page component for AI Text Summarizer
 * Main interface for text input and summarization
 */

import { useState } from 'react'
import TextArea from "../components/TextArea"
import Summary from '../components/Summary'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

/**
 * Home component - Main application interface
 * Handles text input, API calls, and displays results
 * @returns JSX element containing the main application interface
 */
const Home = () => {
    // State for managing text input and API responses
    const [text, setText] = useState('')
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showErrorMessage, setShowErrorMessage] = useState(false)

    /**
     * Handle summarize button click
     * Validates input and calls summarization API
     */
    const handleSummarize = () => {
        setSummary('')
        if (!text.trim()) {
            setErrorMessage('pleaseEnterSomeTextToSummarize')
            setShowErrorMessage(true)
            return
        } else {
            setLoading(true)
            setShowErrorMessage(false)

            // Call the backend API
            fetch('http://localhost:5000/api/summary', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then((data: { summary: string, error: 'pleaseEnterSomeTextToSummarize' | 'lessThan10Characters' }) => {
                    setSummary(data.summary)
                    setLoading(false)
                    setErrorMessage('' as 'pleaseEnterSomeTextToSummarize' | 'lessThan10Characters' | null)
                    setShowErrorMessage(false)
                })
                .catch(err => {
                    setLoading(false)
                    setErrorMessage(err.error as 'pleaseEnterSomeTextToSummarize' | 'lessThan10Characters' | null)
                    setShowErrorMessage(true)
                })
        }
    }

    /**
     * Handle clear button click
     * Resets all state values
     */
    const handleClear = () => {
        setSummary('')
        setText('')
        setErrorMessage('')
        setShowErrorMessage(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-light-gray-500 text-center mb-8">
                    AI Text Summarizer
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <TextArea
                        value={text}
                        onChange={setText}
                        placeholder="Paste your text here... (minimum 10 characters)"
                        rows={8}
                        className="mb-4"
                    />

                    <div className="flex justify-evenly gap-4 mt-30">
                        <button
                            onClick={handleSummarize}
                            disabled={!text.trim() || loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                        >
                            {loading ? 'Summarizing...' : 'Summarize Text'}
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                        >
                            Clear
                        </button>
                    </div>

                    {loading && <Loader />}
                    {showErrorMessage && <ErrorMessage type={errorMessage || ''} />}
                </div>

                {summary && <Summary text={summary} />}
            </div>
        </div>
    )
}

export default Home