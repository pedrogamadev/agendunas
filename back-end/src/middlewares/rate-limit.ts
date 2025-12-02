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
const authMaxRequests = Number.parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '10', 10) // limite mais alto para suportar verificações de sessão

function sanitizeCpf(rawCpf: unknown): string | undefined {
  if (typeof rawCpf !== 'string') {
    return undefined
  }

  const onlyDigits = rawCpf.replace(/\D/g, '')
  return onlyDigits.length > 0 ? onlyDigits : undefined
}

const authLimiterSkipPaths = new Set(['/me'])

function shouldSkipAuthLimiter(request: Request): boolean {
  if (process.env.NODE_ENV === 'test') {
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
    
    // Solução para o erro de TypeScript (undefined)
    const ip = request.ip || ''

    // Retorna a chave composta ou apenas o IP
    return normalizedCpf ? `${ip}:${normalizedCpf}` : ip
  },
  validate:false,
})