const API_BASE = '/api'
const LOGIN_PATH = '/login'

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(message: string, status: number, payload: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export class NetworkError extends Error {
  constructor(message = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export type QueryValue = string | number | boolean | null | undefined

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null
  query?: Record<string, QueryValue>
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE}${normalized}`, window.location.origin)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  return `${url.pathname}${url.search}`
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function isJsonBody(body: unknown): body is object {
  if (body === null || body === undefined) return false
  if (typeof body !== 'object') return false
  if (isFormDataBody(body)) return false
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false
  return true
}

function redirectToLoginIfNeeded(): void {
  if (window.location.pathname === LOGIN_PATH) return
  window.location.assign(LOGIN_PATH)
}

function mensajeDeError(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>
    if (typeof data.mensaje === 'string' && data.mensaje.trim()) return data.mensaje
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.error === 'string' && data.error.trim()) return data.error
  }
  return fallback
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)
  let requestBody: BodyInit | null | undefined

  if (isFormDataBody(body)) {
    requestBody = body
  } else if (isJsonBody(body)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    requestBody = JSON.stringify(body)
  } else {
    requestBody = body ?? undefined
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers,
      body: requestBody,
      credentials: rest.credentials ?? 'include',
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new NetworkError()
  }

  const payload = await parsePayload(response)

  if (response.status === 401) {
    redirectToLoginIfNeeded()
    throw new ApiError(
      mensajeDeError(payload, 'Tu sesión expiró. Inicia sesión de nuevo.'),
      401,
      payload,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      mensajeDeError(payload, `No se pudo completar la solicitud (${response.status}).`),
      response.status,
      payload,
    )
  }

  return payload as T
}

export const api = {
  request: apiRequest,
  get<T>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) {
    return apiRequest<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, body?: ApiRequestOptions['body'], options?: Omit<ApiRequestOptions, 'body' | 'method'>) {
    return apiRequest<T>(path, { ...options, method: 'POST', body })
  },
  put<T>(path: string, body?: ApiRequestOptions['body'], options?: Omit<ApiRequestOptions, 'body' | 'method'>) {
    return apiRequest<T>(path, { ...options, method: 'PUT', body })
  },
  patch<T>(path: string, body?: ApiRequestOptions['body'], options?: Omit<ApiRequestOptions, 'body' | 'method'>) {
    return apiRequest<T>(path, { ...options, method: 'PATCH', body })
  },
  delete<T>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) {
    return apiRequest<T>(path, { ...options, method: 'DELETE' })
  },
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}
