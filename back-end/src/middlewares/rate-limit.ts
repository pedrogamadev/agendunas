import type { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'

const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) // 15 minutos padrão
const maxRequests = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10) // 100 requisições padrão

export const generalRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (request: Request) => {
    // Pular rate limiting em ambiente de teste
    return process.env.NODE_ENV === 'test'
  },
})

const authWindowMs = Number.parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10) // 15 minutos
const authMaxRequests = Number.parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5', 10) // 5 tentativas padrão

export const authRateLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMaxRequests,
  message: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (request: Request) => {
    return process.env.NODE_ENV === 'test'
  },
})

