import { ZodError } from 'zod'

export function errorHandler(error, request, response, next) {
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

  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500
  const message =
    typeof error.message === 'string' && statusCode !== 500
      ? error.message
      : 'Erro inesperado ao processar a solicitação.'

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error('[API] Unhandled error:', error)
  }

  response.status(statusCode).json({ message })
}
