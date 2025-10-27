import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { buildUserPayload, usuarioAuthSelect } from './user-payload.js'

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const authenticated = request.user

    if (!authenticated) {
      response.status(401).json({ message: 'Sessão inválida.' })
      return
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: authenticated.cpf },
      select: usuarioAuthSelect,
    })

    if (!usuario) {
      response.status(404).json({ message: 'Usuário não encontrado.' })
      return
    }

    response.json({ data: buildUserPayload(usuario) })
  } catch (error) {
    next(error)
  }
}
