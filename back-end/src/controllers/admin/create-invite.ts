import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'

const inviteSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  tipo: z.enum(['A', 'C', 'G'], { required_error: 'Informe o tipo de usuário.' }),
})

type CreateInviteBody = z.infer<typeof inviteSchema>

export async function createInvite(
  request: Request<unknown, unknown, CreateInviteBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = inviteSchema.parse(request.body)

    const usuarioExistente = await prisma.usuario.findUnique({ where: { cpf: payload.cpf } })
    if (usuarioExistente) {
      response.status(409).json({ message: 'Já existe um usuário cadastrado com este CPF.' })
      return
    }

    await prisma.convite.deleteMany({ where: { cpfConvidado: payload.cpf, utilizadoEm: null } })

    const token = crypto.randomBytes(16).toString('hex')
    const validoAte = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const convite = await prisma.convite.create({
      data: {
        token,
        cpfConvidado: payload.cpf,
        tipo: payload.tipo,
        criadoPorCpf: request.user?.cpf ?? payload.cpf,
        validoAte,
      },
    })

    response.status(201).json({
      data: {
        token: convite.token,
        cpf: convite.cpfConvidado,
        tipo: convite.tipo,
        validoAte: convite.validoAte.toISOString(),
      },
      message: 'Convite gerado com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
