import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setAccessToken, setLogoutHandler } from '../utils/api'

const AuthContext = createContext(null)

/**
 * Auth Provider component
 * Manages authentication state and token refresh
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, _setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const setToken = useCallback((t) => {
    _setToken(t)
    setAccessToken(t)
    if (t) {
      localStorage.setItem('accessToken', t)
    } else {
      localStorage.removeItem('accessToken')
    }
  }, [])

  const clearAuth = useCallback(() => {
    _setToken(null)
    setUser(null)
    setAccessToken(null)
    try {
      localStorage.removeItem('accessToken')
      sessionStorage.clear()
      document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    } catch (e) {
      // ignore storage errors
    }
  }, [])

  const clearClientStorageAndCookie = useCallback(() => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    } catch (e) {
      // ignore
    }
  }, [])

  // Register a logout handler for the API layer so it can trigger a client-side logout
  useEffect(() => {
    setLogoutHandler(() => {
      clearAuth()
      navigate('/login')
    })
  }, [clearAuth, navigate])

  // Restore session from localStorage and refresh token on mount
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setIsLoading(true)
        // Restore access token from localStorage if present
        const savedToken = localStorage.getItem('accessToken')
        if (savedToken) {
          setToken(savedToken)
        }
        // Attempt to refresh token and fetch user data
        const resp = await api.post('/auth/refresh')
        const newToken = resp?.data?.data?.accessToken
        if (newToken) {
          setToken(newToken)
          const me = await api.get('/auth/me')
          if (mounted) {
            const userData = me?.data?.data || me?.data || null
            setUser(userData)
          }
        }
      } catch (e) {
        clearAuth()
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [setToken, clearAuth])

  const signup = useCallback(async (payload) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/signup', payload)
      const newToken = res?.data?.data?.accessToken
      const userData = res?.data?.data?.user || res?.data?.data || null
      if (newToken) setToken(newToken)
      if (userData) setUser(userData)
      return { user: userData }
    } catch (e) {
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [setToken])

  const login = useCallback(async (credentials) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/login', credentials)
      const newToken = res?.data?.data?.accessToken
      const userData = res?.data?.data?.user || res?.data?.data || null
      if (newToken) setToken(newToken)
      if (userData) setUser(userData)
      return { user: userData }
    } catch (e) {
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [setToken])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // ignore
    } finally {
      clearAuth()
      clearClientStorageAndCookie()
      setIsLoading(false)
      navigate('/login')
    }
  }, [clearAuth, navigate])

  const getMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      const userData = res?.data?.data || res?.data?.user || null
      setUser(userData)
      return userData
    } catch (e) {
      return null
    }
  }, [])

  const value = {
    user,
    token,
    isLoading,
    error,
    signup,
    login,
    logout,
    getMe,
    setToken,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
