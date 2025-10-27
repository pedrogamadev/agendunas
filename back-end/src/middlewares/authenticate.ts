import type { NextFunction, Request, Response } from 'express'
import prisma from '../lib/prisma.js'
import { verifyToken } from '../lib/token.js'

export async function authenticate(request: Request, response: Response, next: NextFunction): Promise<void> {
  const authorization = request.headers.authorization

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    response.status(401).json({ message: 'É necessário estar autenticado para acessar este recurso.' })
    return
  }

  const token = authorization.slice(7).trim()

  try {
    const payload = verifyToken(token)

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: payload.cpf },
      select: { cpf: true, nome: true, tipo: true },
    })

    if (!usuario) {
      response.status(401).json({ message: 'Sessão inválida.' })
      return
    }

    request.user = usuario
    next()
  } catch (error) {
    response.status(401).json({ message: 'Sessão expirada ou token inválido.' })
  }
}
