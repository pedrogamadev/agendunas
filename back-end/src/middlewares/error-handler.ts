import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

type ApiError = Error & {
  statusCode?: number
}

export function errorHandler(error: unknown, request: Request, response: Response, next: NextFunction): void {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof ZodError) {
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
    // eslint-disable-next-line no-console
    console.error('[API] Unhandled error:', normalizedError)
  }

  response.status(statusCode).json({ message })
}
