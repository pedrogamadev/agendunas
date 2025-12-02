import type { Request, Response } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production'
const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED?.toLowerCase() !== 'false'

const windowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10) // 15 minutos padrão
const defaultMaxRequests = isProduction ? '100' : '1000'
const maxRequests = Number.parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS ?? defaultMaxRequests,
  10,
)

function shouldSkipRateLimit(): boolean {
  return !isProduction || !isRateLimitEnabled
}

export const generalRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
})

const authWindowMs = Number.parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? '900000', 10) // 15 minutos
const defaultAuthMaxRequests = isProduction ? '10' : '100'
const authMaxRequests = Number.parseInt(
  process.env.RATE_LIMIT_AUTH_MAX_REQUESTS ?? defaultAuthMaxRequests,
  10,
)

function sanitizeCpf(rawCpf: unknown): string | undefined {
  if (typeof rawCpf !== 'string') {
    return undefined
  }

  const onlyDigits = rawCpf.replace(/\D/g, '')
  return onlyDigits.length > 0 ? onlyDigits : undefined
}

const authLimiterSkipPaths = new Set(['/me'])

function shouldSkipAuthLimiter(request: Request): boolean {
  if (shouldSkipRateLimit()) {
    return true
  }

  // Não contar verificações de sessão idempotentes
  if (request.method === 'GET' && authLimiterSkipPaths.has(request.path)) {
    return true
  }

  // Ignorar pré-flight ou leituras
  return request.method === 'OPTIONS' || request.method === 'HEAD'
}

export const authRateLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMaxRequests,
  message: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipAuthLimiter,
  keyGenerator: (request: Request) => {
    const normalizedCpf = sanitizeCpf(request.body?.cpf)
    const normalizedIp = ipKeyGenerator(request)
    return normalizedCpf ? `${normalizedIp}:${normalizedCpf}` : normalizedIp
  },
})

    // Retorna a chave composta ou apenas o IP
    return normalizedCpf ? `${ip}:${normalizedCpf}` : ip
  },
  validate:false,
})