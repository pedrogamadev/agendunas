import { describe, expect, it } from 'vitest'
import {
  createApiError,
  parseError,
  getErrorMessage,
  shouldRetry,
  calculateRetryDelay,
  type ApiError,
} from '../error-handler'

describe('Error Handler', () => {
  describe('createApiError', () => {
    it('deve criar erro com tipo e status code', () => {
      const error = createApiError('Test error', 'network', 500)

      expect(error.message).toBe('Test error')
      expect(error.type).toBe('network')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('parseError', () => {
    it('deve identificar erro de rede', () => {
      const networkError = new TypeError('Failed to fetch')
      const parsed = parseError(networkError)

      expect(parsed.type).toBe('network')
      expect(parsed.message).toContain('conexão')
    })

    it('deve identificar erro de timeout', () => {
      const timeoutError = new Error('Request timeout')
      const parsed = parseError(timeoutError)

      expect(parsed.type).toBe('timeout')
    })

    it('deve identificar erro de autenticação (401)', () => {
      const authError = new Error('HTTP 401')
      const parsed = parseError(authError)

      expect(parsed.type).toBe('authentication')
      expect(parsed.statusCode).toBe(401)
    })

    it('deve identificar erro de autorização (403)', () => {
      const authzError = new Error('HTTP 403')
      const parsed = parseError(authzError)

      expect(parsed.type).toBe('authorization')
      expect(parsed.statusCode).toBe(403)
    })

    it('deve identificar erro de validação (4xx)', () => {
      const validationError = new Error('HTTP 400')
      const parsed = parseError(validationError)

      expect(parsed.type).toBe('validation')
      expect(parsed.statusCode).toBe(400)
    })

    it('deve identificar erro de servidor (5xx)', () => {
      const serverError = new Error('HTTP 500')
      const parsed = parseError(serverError)

      expect(parsed.type).toBe('server')
      expect(parsed.statusCode).toBe(500)
    })

    it('deve manter ApiError existente', () => {
      const apiError = createApiError('Test', 'network')
      const parsed = parseError(apiError)

      expect(parsed).toBe(apiError)
    })
  })

  describe('getErrorMessage', () => {
    it('deve retornar mensagem do erro', () => {
      const error = createApiError('Test message', 'network')
      expect(getErrorMessage(error)).toBe('Test message')
    })

    it('deve parsear erro desconhecido', () => {
      const error = new Error('Unknown error')
      expect(getErrorMessage(error)).toBe('Unknown error')
    })
  })

  describe('shouldRetry', () => {
    it('não deve retry para erros de autenticação', () => {
      const error = createApiError('Auth error', 'authentication', 401)
      expect(shouldRetry(error, 0, 3)).toBe(false)
    })

    it('não deve retry para erros de autorização', () => {
      const error = createApiError('Authz error', 'authorization', 403)
      expect(shouldRetry(error, 0, 3)).toBe(false)
    })

    it('não deve retry para erros de validação', () => {
      const error = createApiError('Validation error', 'validation', 400)
      expect(shouldRetry(error, 0, 3)).toBe(false)
    })

    it('deve retry para erros de rede', () => {
      const error = createApiError('Network error', 'network')
      expect(shouldRetry(error, 0, 3)).toBe(true)
    })

    it('deve retry para erros de timeout', () => {
      const error = createApiError('Timeout error', 'timeout')
      expect(shouldRetry(error, 0, 3)).toBe(true)
    })

    it('deve retry para erros de servidor', () => {
      const error = createApiError('Server error', 'server', 500)
      expect(shouldRetry(error, 0, 3)).toBe(true)
    })

    it('não deve retry após máximo de tentativas', () => {
      const error = createApiError('Network error', 'network')
      expect(shouldRetry(error, 3, 3)).toBe(false)
    })
  })

  describe('calculateRetryDelay', () => {
    it('deve calcular delay exponencial', () => {
      expect(calculateRetryDelay(0, 1000)).toBe(1000) // 1s
      expect(calculateRetryDelay(1, 1000)).toBe(2000) // 2s
      expect(calculateRetryDelay(2, 1000)).toBe(4000) // 4s
      expect(calculateRetryDelay(3, 1000)).toBe(8000) // 8s
    })

    it('deve usar base delay customizado', () => {
      expect(calculateRetryDelay(0, 500)).toBe(500)
      expect(calculateRetryDelay(1, 500)).toBe(1000)
    })
  })
})

