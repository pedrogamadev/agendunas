import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { verifyPassword } from '../../lib/password.js'
import { signToken } from '../../lib/token.js'
import { buildUserPayload, usuarioAuthSelect } from './user-payload.js'

const customerLoginSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  senha: z.string().min(8, 'Informe a senha.'),
})

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

export async function customerLogin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = customerLoginSchema.parse(request.body)
    const normalizedCpf = sanitizeCpf(payload.cpf)

    if (normalizedCpf.length !== 11) {
      response.status(400).json({ message: 'Informe um CPF válido com 11 dígitos.' })
      return
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: normalizedCpf },
      select: {
        ...usuarioAuthSelect,
        senhaHash: true,
      },
    })

    if (!usuario || usuario.tipo !== 'C') {
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
