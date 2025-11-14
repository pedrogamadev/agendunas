import {
  type ApiError,
  calculateRetryDelay,
  createApiError,
  parseError,
  shouldRetry,
} from '../utils/error-handler.js'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiRequestOptions {
  method?: HttpMethod
  body?: unknown
  timeout?: number
  retries?: number
  retryDelay?: number
}

const DEFAULT_TIMEOUT = 30000 // 30 segundos
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY = 1000 // 1 segundo

function getDefaultBaseUrl() {
  if (typeof window !== 'undefined') {
    if (!import.meta.env.DEV) {
      const origin = window.location.origin.replace(/\/$/, '')
      return `${origin}/api`
    }
  }

  return 'http://localhost:3001/api'
}

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken() {
  return authToken
}

function getBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured && typeof configured === 'string') {
    return configured.replace(/\/$/, '')
  }
  return getDefaultBaseUrl()
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()

    if (response.ok && text.trim().length === 0) {
      return undefined as T
    }

    throw createApiError(text || `Erro inesperado (HTTP ${response.status})`, 'server', response.status)
  }

  const payload = (await response.json()) as { data?: T; message?: string; issues?: unknown }
  if (!response.ok) {
    const statusCode = response.status
    const message = payload.message ?? `Erro inesperado (HTTP ${statusCode})`

    if (statusCode === 401) {
      throw createApiError(message, 'authentication', statusCode)
    }

    if (statusCode === 403) {
      throw createApiError(message, 'authorization', statusCode)
    }

    if (statusCode >= 400 && statusCode < 500) {
      throw createApiError(message, 'validation', statusCode, payload.issues)
    }

    if (statusCode >= 500) {
      throw createApiError(message, 'server', statusCode)
    }

    throw createApiError(message, 'unknown', statusCode)
  }

  return (payload?.data ?? payload) as T
}

async function performRequest<T>(
  url: string,
  options: ApiRequestOptions,
  _attempt: number = 0,
): Promise<T> {
  const { method = 'GET', body, timeout = DEFAULT_TIMEOUT } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const signal = createTimeoutSignal(timeout)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })

    return await parseResponse<T>(response)
  } catch (error) {
    // Timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw createApiError('A requisição demorou muito para responder.', 'timeout', undefined, error)
    }

    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw createApiError('Erro de conexão. Verifique sua internet.', 'network', undefined, error)
    }

    // Re-throw ApiError
    if (error instanceof Error && 'type' in error) {
      throw error
    }

    // Unknown error
    throw parseError(error)
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
  } = options

  let lastError: ApiError | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await performRequest<T>(url, options, attempt)
    } catch (error) {
      lastError = parseError(error)

      // Não tentar novamente se não deve retry ou se é a última tentativa
      if (!shouldRetry(lastError, attempt, retries) || attempt >= retries) {
        throw lastError
      }

      // Aguardar antes de tentar novamente
      const delay = calculateRetryDelay(attempt, retryDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Este código não deve ser alcançado, mas TypeScript precisa disso
  throw lastError || createApiError('Erro desconhecido após tentativas.', 'unknown')
}
