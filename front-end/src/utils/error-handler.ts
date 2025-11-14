export type ApiErrorType = 'network' | 'timeout' | 'validation' | 'authentication' | 'authorization' | 'server' | 'unknown'

export interface ApiError extends Error {
  type: ApiErrorType
  statusCode?: number
  originalError?: unknown
}

export function createApiError(
  message: string,
  type: ApiErrorType,
  statusCode?: number,
  originalError?: unknown,
): ApiError {
  const error = new Error(message) as ApiError
  error.type = type
  error.statusCode = statusCode
  error.originalError = originalError
  return error
}

export function parseError(error: unknown): ApiError {
  if (error instanceof Error && 'type' in error) {
    return error as ApiError
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createApiError(
      'Erro de conexão. Verifique sua internet e tente novamente.',
      'network',
      undefined,
      error,
    )
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return createApiError(
        'A requisição demorou muito para responder. Tente novamente.',
        'timeout',
        undefined,
        error,
      )
    }

    // Tentar extrair status code da mensagem
    const statusMatch = error.message.match(/HTTP (\d+)/)
    const statusCode = statusMatch ? Number.parseInt(statusMatch[1], 10) : undefined

    if (statusCode === 401) {
      return createApiError('Sessão expirada. Faça login novamente.', 'authentication', 401, error)
    }

    if (statusCode === 403) {
      return createApiError('Você não tem permissão para esta ação.', 'authorization', 403, error)
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return createApiError(error.message || 'Erro na validação dos dados.', 'validation', statusCode, error)
    }

    if (statusCode && statusCode >= 500) {
      return createApiError(
        'Erro no servidor. Tente novamente mais tarde.',
        'server',
        statusCode,
        error,
      )
    }

    return createApiError(error.message || 'Erro desconhecido.', 'unknown', statusCode, error)
  }

  return createApiError('Erro desconhecido.', 'unknown', undefined, error)
}

export function getErrorMessage(error: unknown): string {
  const apiError = parseError(error)
  return apiError.message
}

export function shouldRetry(error: ApiError, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) {
    return false
  }

  // Não tentar novamente para erros de autenticação, autorização ou validação
  if (['authentication', 'authorization', 'validation'].includes(apiError.type)) {
    return false
  }

  // Tentar novamente para erros de rede, timeout ou servidor
  return ['network', 'timeout', 'server', 'unknown'].includes(apiError.type)
}

export function calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s...
  return baseDelay * Math.pow(2, attempt)
}

