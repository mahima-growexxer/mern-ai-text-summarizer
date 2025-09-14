/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * ErrorMessage component for AI Text Summarizer
 * Displays error messages to users
 */

import { useState, useEffect } from 'react';

/**
 * ErrorMessage component - Error display
 * Shows error messages with auto-close functionality and manual close option
 * @param props - Component props containing error message and close handler
 * @returns JSX element containing error message
 */
const ErrorMessage = ({ message, onClose }: { message: string; onClose: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(5); // Auto-close after 5 seconds
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsClosing(true);
                    setTimeout(() => onClose(), 300); // Fade out animation
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onClose]);

    return (
        <div className={`bg-red-50 border border-red-200 rounded-md p-4 mb-4 mt-10 transition-all duration-300 ${isClosing ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}>
            <div className="flex">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-red-800">
                            Hold On!
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-1 bg-red-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${(timeLeft / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                        {message}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ErrorMessage