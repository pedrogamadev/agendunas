import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import logger from '../lib/logger.js'

type ApiError = Error & {
  statusCode?: number
}

export function errorHandler(error: unknown, request: Request, response: Response, next: NextFunction): void {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof ZodError) {
    logger.warn(
      {
        path: request.path,
        method: request.method,
        issues: error.issues,
      },
      'Validation error',
    )

    response.status(400).json({
      message: 'Dados inválidos enviados para a API.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
    return
  }

  const normalizedError: ApiError =
    error instanceof Error
      ? error
      : new Error('Erro inesperado ao processar a solicitação.', { cause: error })

  const statusCode = typeof normalizedError.statusCode === 'number' ? normalizedError.statusCode : 500
  const message =
    typeof normalizedError.message === 'string' && statusCode !== 500
      ? normalizedError.message
      : 'Erro inesperado ao processar a solicitação.'

  if (statusCode === 500) {
    logger.error(
      {
        err: normalizedError,
        path: request.path,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('user-agent'),
      },
      'Unhandled error',
    )
  } else {
    logger.warn(
      {
        err: normalizedError,
        path: request.path,
        method: request.method,
        statusCode,
      },
      'Request error',
    )
  }

  response.status(statusCode).json({ message })
}
