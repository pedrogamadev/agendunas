import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'

function buildUserPayload(usuario: Awaited<ReturnType<typeof prisma.usuario.findUnique>>) {
  if (!usuario) {
    return null
  }

  return {
    cpf: usuario.cpf,
    nome: usuario.nome,
    tipo: usuario.tipo,
    guia: usuario.guia
      ? {
          slug: usuario.guia.slug,
          nome: usuario.guia.name,
        }
      : null,
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const authenticated = request.user

    if (!authenticated) {
      response.status(401).json({ message: 'Sessão inválida.' })
      return
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: authenticated.cpf },
      select: {
        cpf: true,
        nome: true,
        tipo: true,
        guia: { select: { slug: true, name: true } },
      },
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
