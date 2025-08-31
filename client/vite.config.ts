/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Vite configuration for AI Text Summarizer
 * Build tool configuration for React development
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration object
 * Defines build settings, plugins, and development server options
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
