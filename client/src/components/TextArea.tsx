/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * TextArea component for AI Text Summarizer
 * Controlled text input component with validation and styling
 */

import React from 'react'

/**
 * Interface for TextArea component props
 */
interface TextAreaProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    rows?: number
    disabled?: boolean
    cols?: number
}

/**
 * TextArea component - Controlled text input
 * Provides a styled textarea with validation and accessibility features
 * @param props - TextAreaProps object containing component configuration
 * @returns JSX element containing the textarea input
 */
const TextArea: React.FC<TextAreaProps> = ({
    value = '',
    onChange = () => { },
    placeholder = 'Enter your text here...',
    className = '',
    rows = 10,
    cols = 50,
    disabled = false,
}) => {
    /**
     * Handle textarea change events
     * Calls the onChange prop with the new value
     * @param e - React change event for textarea
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
    }

    return (
        <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            cols={cols}
            disabled={disabled}
            className={`w-full p-3 border-2 border-gray-300 rounded-md resize-none focus:border-blue-500 focus:outline-none transition-colors duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                } ${className}`}
        />
    )
}

export default TextArea