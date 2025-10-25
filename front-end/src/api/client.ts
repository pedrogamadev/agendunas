export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const DEFAULT_BASE_URL = 'http://localhost:3001/api'

function getBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured && typeof configured === 'string') {
    return configured.replace(/\/$/, '')
  }
  return DEFAULT_BASE_URL
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

    throw new Error(text || `Erro inesperado (HTTP ${response.status})`)
  }

  const payload = (await response.json()) as { data?: T; message?: string }
  if (!response.ok) {
    throw new Error(payload.message ?? `Erro inesperado (HTTP ${response.status})`)
  }

  return (payload?.data ?? payload) as T
}

export async function apiRequest<T>(path: string, options: { method?: HttpMethod; body?: unknown } = {}) {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const { method = 'GET', body } = options

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response)
}
