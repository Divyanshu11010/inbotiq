import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 * Renders children when authenticated. Shows loading state while checking.
 */
export default function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-2 mx-auto h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <div className="text-sm text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
