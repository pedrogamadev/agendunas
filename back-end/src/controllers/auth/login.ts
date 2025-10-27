import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { verifyPassword } from '../../lib/password.js'
import { signToken } from '../../lib/token.js'

const loginSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  senha: z.string().min(8, 'Informe a senha.'),
})

type LoginBody = z.infer<typeof loginSchema>

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

export async function login(
  request: Request<unknown, unknown, LoginBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = loginSchema.parse(request.body)

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: payload.cpf },
      select: {
        cpf: true,
        nome: true,
        senhaHash: true,
        tipo: true,
        guia: { select: { slug: true, name: true } },
      },
    })

    if (!usuario) {
      response.status(401).json({ message: 'CPF ou senha inválidos.' })
      return
    }

    const senhaValida = await verifyPassword(payload.senha, usuario.senhaHash)

    if (!senhaValida) {
      response.status(401).json({ message: 'CPF ou senha inválidos.' })
      return
    }

    const token = signToken({ cpf: usuario.cpf, tipo: usuario.tipo })

    response.json({
      data: {
        token,
        usuario: buildUserPayload(usuario),
      },
      message: 'Login realizado com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
