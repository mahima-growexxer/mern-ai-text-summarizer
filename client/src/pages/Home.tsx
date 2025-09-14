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
import SecurityDashboard from './SecurityDashboard'
import { useAuth } from '../contexts/AuthContext'

interface User {
    id: string;
    email: string;
    isAdmin: boolean;
}

interface HomeProps {
    onSignOut?: () => void;
    user?: User;
}

/**
 * Home component - Main application interface
 * Handles text input, API calls, and displays results
 * @param onSignOut - Callback function to sign out user
 * @param user - Current user object
 * @returns JSX element containing the main application interface
 */
const Home = ({ onSignOut, user }: HomeProps) => {
    const { token, isAdmin } = useAuth();

    // State for managing text input and API responses
    const [text, setText] = useState('')
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [showSecurityDashboard, setShowSecurityDashboard] = useState(false)

    /**
     * Handle summarize button click
     * Validates input and calls summarization API
     */
    const handleSummarize = () => {
        setSummary('')
        if (!text.trim()) {
            setErrorMessage('Please enter some text to summarize')
            setShowErrorMessage(true)
            return
        } else {
            setLoading(true)
            setShowErrorMessage(false)

            // Call the backend API
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            fetch('http://localhost:5000/api/summary', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers
            })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(errorData => {
                            throw new Error(errorData.error || 'Request failed');
                        });
                    }
                    return res.json();
                })
                .then((data: { summary: string, error?: string }) => {
                    if (data.error) {
                        setErrorMessage(data.error);
                        setShowErrorMessage(true);
                    } else {
                        setSummary(data.summary);
                        setErrorMessage(null);
                        setShowErrorMessage(false);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    setErrorMessage(err.message || 'Failed to summarize text');
                    setShowErrorMessage(true);
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

    if (showSecurityDashboard) {
        return <SecurityDashboard onBack={() => setShowSecurityDashboard(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-light-gray-500">
                        AI Text Summarizer
                    </h1>
                    <div className="flex items-center space-x-4">
                        {isAdmin && (
                            <button
                                onClick={() => setShowSecurityDashboard(true)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Security Dashboard
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <TextArea
                        value={text}
                        onChange={setText}
                        placeholder="Paste your text here... (10-300 characters)"
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
                    {showErrorMessage && errorMessage && (
                        <ErrorMessage
                            message={errorMessage}
                            onClose={() => {
                                setShowErrorMessage(false);
                                setErrorMessage(null);
                            }}
                        />
                    )}
                </div>

                {summary && <Summary text={summary} />}

                <div className="flex items-center justify-evenly space-x-2">
                    <span className="text-sm text-gray-600">
                        Welcome, {user?.email}
                    </span>
                    {onSignOut && (
                        <button
                            onClick={onSignOut}
                            className="bg-green-500 text-white px-2 py-1 text-sm rounded hover:bg-green-800"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home