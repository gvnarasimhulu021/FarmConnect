const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiRequest(path, options = {}, token = '') {
  const headers = { ...(options.headers ?? {}) }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (options.body && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
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
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? response.json() : null
}
