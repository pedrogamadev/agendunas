import type { NextFunction, Request, Response } from 'express'

export function authorizeAdmin(request: Request, response: Response, next: NextFunction): void {
  if (!request.user || request.user.tipo !== 'A') {
    response.status(403).json({ message: 'Você não possui permissão para acessar esta área.' })
    return
  }

  next()
}
