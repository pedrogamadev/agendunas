import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import {
  buildClientePayload,
  buildUsuarioPayload,
  clienteAuthSelect,
  usuarioAuthSelect,
} from './user-payload.js'

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const authenticated = request.authenticated

    if (!authenticated) {
      response.status(401).json({ message: 'Sessão inválida.' })
      return
    }

    if (authenticated.kind === 'usuario') {
      const usuario = await prisma.usuario.findUnique({
        where: { cpf: authenticated.cpf },
        select: usuarioAuthSelect,
      })

      if (!usuario) {
        response.status(404).json({ message: 'Usuário não encontrado.' })
        return
      }

      response.json({ data: buildUsuarioPayload(usuario) })
      return
    }

    const cliente = await prisma.cliente.findUnique({
      where: { cpf: authenticated.cpf },
      select: clienteAuthSelect,
    })

    if (!cliente) {
      response.status(404).json({ message: 'Cliente não encontrado.' })
      return
    }

    response.json({ data: buildClientePayload(cliente) })
  } catch (error) {
    next(error)
  }
}
