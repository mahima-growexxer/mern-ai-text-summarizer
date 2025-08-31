/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Main entry point for AI Text Summarizer React application
 * Renders the root App component into the DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Create root element and render the App component
 * Initializes the React application in the DOM
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
