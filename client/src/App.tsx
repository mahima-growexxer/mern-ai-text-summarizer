/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Main App component for AI Text Summarizer
 * Root component that renders the application
 */

import { useState } from 'react'
import './App.css'
import './index.css'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import { AuthProvider, useAuth } from './contexts/AuthContext'

/**
 * AppContent component - Handles authentication flow
 * Shows sign in/up pages or main app based on authentication status
 * @returns JSX element containing the appropriate page
 */
function AppContent() {
  const { isAuthenticated, signIn, signOut, user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (!isAuthenticated) {
    return showSignUp ? (
      <SignUp
        onSignIn={signIn}
        onSwitchToSignIn={() => setShowSignUp(false)}
      />
    ) : (
      <SignIn
        onSignIn={signIn}
        onSwitchToSignUp={() => setShowSignUp(true)}
      />
    );
  }

  return <Home onSignOut={signOut} user={user} />;
}

/**
 * App component - Main application entry point
 * Provides authentication context and renders the app content
 * @returns JSX element containing the application with auth context
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
