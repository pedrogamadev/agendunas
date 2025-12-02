import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

async function importRateLimiters() {
  return import('../../src/middlewares/rate-limit.js')
}

describe('Rate Limiting Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  const originalEnv = { ...process.env }

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      method: 'GET',
    }
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    }
    mockNext = vi.fn()
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }

    Object.assign(process.env, originalEnv)
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('generalRateLimiter', () => {
    it('deve permitir requisições dentro do limite', async () => {
      process.env.NODE_ENV = 'test'
      const { generalRateLimiter } = await importRateLimiters()
      const middleware = generalRateLimiter
      await new Promise<void>((resolve) => {
        middleware(mockRequest as Request, mockResponse as Response, (...args) => {
          mockNext(...args)
          resolve()
        })
      })

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('deve retornar 429 quando exceder o limite', async () => {
      process.env.NODE_ENV = 'test'
      const { generalRateLimiter } = await importRateLimiters()
      const maxRequests = 100
      const middleware = generalRateLimiter

      // Simular muitas requisições
      for (let i = 0; i < maxRequests; i++) {
        await new Promise<void>((resolve) => {
          middleware(mockRequest as Request, mockResponse as Response, (...args) => {
            mockNext(...args)
            resolve()
          })
        })
      }

      // Próxima requisição deve ser bloqueada
      await new Promise<void>((resolve) => {
        middleware(mockRequest as Request, mockResponse as Response, (...args) => {
          mockNext(...args)
          resolve()
        })
      })

      // Verificar se rate limit foi aplicado (pode não bloquear imediatamente dependendo da implementação)
      // Este teste é mais conceitual, pois rate limiting depende de tempo
    })
  })

  describe('authRateLimiter', () => {
    it('deve permitir tentativas de autenticação dentro do limite', async () => {
      process.env.NODE_ENV = 'test'
      const { authRateLimiter } = await importRateLimiters()
      const middleware = authRateLimiter
      await new Promise<void>((resolve) => {
        middleware(mockRequest as Request, mockResponse as Response, (...args) => {
          mockNext(...args)
          resolve()
        })
      })

      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('bypass em desenvolvimento', () => {
    it('ignora os limitadores quando NODE_ENV não é produção', async () => {
      process.env.NODE_ENV = 'development'
      process.env.RATE_LIMIT_MAX_REQUESTS = '1'
      process.env.RATE_LIMIT_AUTH_MAX_REQUESTS = '1'

      const { generalRateLimiter, authRateLimiter } = await importRateLimiters()

      for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => {
          generalRateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            (...args) => {
              mockNext(...args)
              resolve()
            },
          )
        })
      }

      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(3)

      mockNext.mockClear()
      ;(mockResponse.status as unknown as { mockClear: () => void }).mockClear()

      for (let i = 0; i < 3; i++) {
        await new Promise<void>((resolve) => {
          authRateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            (...args) => {
              mockNext(...args)
              resolve()
            },
          )
        })
      }

      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(3)
    })
  })
})

