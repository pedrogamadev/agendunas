import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { verifyPassword } from '../../lib/password.js'
import { signUsuarioToken } from '../../lib/token.js'
import { buildUsuarioPayload, usuarioAuthSelect } from './user-payload.js'

const loginSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  senha: z.string().min(8, 'Informe a senha.'),
})

type LoginBody = z.infer<typeof loginSchema>

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
        ...usuarioAuthSelect,
        senhaHash: true,
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

    const token = signUsuarioToken({ cpf: usuario.cpf, tipo: usuario.tipo })

    response.json({
      data: {
        token,
        usuario: buildUsuarioPayload(usuario),
        cliente: null,
      },
      message: 'Login realizado com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
