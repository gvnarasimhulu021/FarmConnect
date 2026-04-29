const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const AUTH_STORAGE_KEY = 'farmconnect-auth'

let refreshPromise = null

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function resolveAccessToken(auth) {
  if (!auth || typeof auth !== 'object') {
    return ''
  }
  return auth.accessToken || auth.token || ''
}

function storeAuth(auth) {
  if (typeof window === 'undefined' || !auth || typeof auth !== 'object') {
    return
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  window.dispatchEvent(new CustomEvent('farmconnect-auth-refreshed', { detail: auth }))
}

function canTryRefresh(path) {
  return !path.startsWith('/api/auth/login')
    && !path.startsWith('/api/auth/register')
    && !path.startsWith('/api/auth/refresh')
    && !path.startsWith('/api/auth/verify')
    && !path.startsWith('/api/auth/resend-otp')
    && !path.startsWith('/api/auth/stats')
    && !path.startsWith('/api/auth/forgot-password/')
}

async function refreshAccessToken() {
  const currentAuth = readStoredAuth()
  const refreshToken = currentAuth?.refreshToken
  if (!refreshToken) {
    throw new Error('Session expired. Please login again.')
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Session expired. Please login again.')
  }

  const refreshed = await response.json()
  const merged = {
    ...(currentAuth ?? {}),
    ...(refreshed ?? {}),
    token: refreshed?.token ?? refreshed?.accessToken ?? currentAuth?.token ?? '',
    accessToken: refreshed?.accessToken ?? refreshed?.token ?? currentAuth?.accessToken ?? '',
    refreshToken: refreshed?.refreshToken ?? currentAuth?.refreshToken ?? '',
  }

  storeAuth(merged)
  return merged
}

async function getValidAccessToken(path, fallbackToken = '') {
  const storedAuth = readStoredAuth()
  const storedToken = resolveAccessToken(storedAuth)
  const candidateToken = storedToken || fallbackToken || ''

  if (candidateToken) {
    return candidateToken
  }

  if (!canTryRefresh(path)) {
    return ''
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  const refreshedAuth = await refreshPromise
  return resolveAccessToken(refreshedAuth)
}

function buildHeaders(options, token = '') {
  const headers = { ...(options.headers ?? {}) }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (options.body && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function performRequest(path, options = {}, token = '') {
  const headers = buildHeaders(options, token)
  return fetch(`${API_BASE}${path}`, { ...options, headers })
}

async function toApiError(response, path) {
  let message = `Request failed with status ${response.status} (${path})`

  const errorHeader = response.headers.get('X-Error-Message')
  if (errorHeader) {
    message = errorHeader
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      const payload = await response.json()
      if (payload?.message) {
        message = payload.message
      } else if (payload?.error && payload.error !== 'Bad Request') {
        message = payload.error
      }
    } catch {
      // keep fallback message
    }
  } else {
    try {
      const text = await response.text()
      if (text?.trim()) {
        message = text
      }
    } catch {
      // keep fallback message
    }
  }

  if (message === 'Bad Request') {
    message = `Bad Request (${path})`
  }

  return new Error(message)
}

export async function apiRequest(path, options = {}, token = '') {
  let effectiveToken = await getValidAccessToken(path, token)
  let response = await performRequest(path, options, effectiveToken)

  // Auto-refresh expired access token once, then retry original request.
  if (response.status === 401 && canTryRefresh(path)) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const refreshedAuth = await refreshPromise
      effectiveToken = resolveAccessToken(refreshedAuth)
      response = await performRequest(path, options, effectiveToken)
    } catch {
      // fall through to standardized error handling
    }
  }

  if (!response.ok) {
    throw await toApiError(response, path)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? response.json() : null
}
