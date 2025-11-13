import axios from 'axios'

// Base URL configuration - resolves backend API root with '/api' prefix
const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const normalized = RAW_API.replace(/\/$/, '').replace(/\/api$/i, '')
const API_BASE = normalized + '/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// Module-scoped auth state for attaching tokens and handling refresh
let accessToken = null
let logoutHandler = null
let isRefreshing = false
let subscribers = []

export function setAccessToken(token) {
  accessToken = token
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export function setLogoutHandler(fn) {
  logoutHandler = fn
}

function subscribe(cb) {
  subscribers.push(cb)
}

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token))
  subscribers = []
}

// Attach token to outgoing requests when present
api.interceptors.request.use((config) => {
  if (accessToken && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor to handle 401 and try refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      error.response.status === 401 &&
        !originalRequest._retry
    ) {
        // If the 401 originated from the refresh endpoint itself, do not attempt
        // to call refresh again — this would cause an infinite loop.
        if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
          // ensure logout is invoked so app clears auth state
          if (typeof logoutHandler === 'function') logoutHandler()
          return Promise.reject(error)
        }
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribe(async (token) => {
            if (!token) return reject(error)
            originalRequest.headers.Authorization = `Bearer ${token}`
            try {
              const resp = await api(originalRequest)
              resolve(resp)
            } catch (e) {
              reject(e)
            }
          })
        })
      }

      isRefreshing = true
      try {
        const refreshResp = await api.post('/auth/refresh')
        const newToken = refreshResp.data?.data?.accessToken || refreshResp.data?.accessToken
        setAccessToken(newToken)
        onRefreshed(newToken)
        isRefreshing = false
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (e) {
        isRefreshing = false
        onRefreshed(null)
        if (typeof logoutHandler === 'function') logoutHandler()
        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  }
)

// API helper functions
export async function signup(data) {
  const resp = await api.post('/auth/signup', data)
  return resp
}

export async function login(data) {
  const resp = await api.post('/auth/login', data)
  return resp
}

export async function refreshToken() {
  const resp = await api.post('/auth/refresh')
  return resp.data
}

export async function logout() {
  const resp = await api.post('/auth/logout')
  return resp.data
}

export async function getCurrentUser() {
  const resp = await api.get('/auth/me')
  return resp.data
}

export async function verifyEmail(token) {
  const resp = await api.post('/auth/verify-email', { token })
  return resp.data
}

export async function requestPasswordReset(email) {
  const resp = await api.post('/auth/forgot-password', { email })
  return resp.data
}

export async function resetPassword(token, newPassword) {
  const resp = await api.post('/auth/reset-password', { token, password: newPassword })
  return resp.data
}

export default api

export const http = {
  get: (url, cfg) => api.get(url, cfg),
  post: (url, data, cfg) => api.post(url, data, cfg),
  put: (url, data, cfg) => api.put(url, data, cfg),
  del: (url, cfg) => api.delete(url, cfg),
}

/**
 * Normalize API errors into a simple shape { message, status }
 */
export function handleApiError(err) {
  if (!err) return { message: 'Unknown error', status: null }
  const status = err?.response?.status || null
  const data = err?.response?.data
  const message =
    (data && (data.message || data.error || data?.errors || JSON.stringify(data))) || err.message || 'Request failed'
  return { message, status }
}
