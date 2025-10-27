import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { hashPassword } from '../../lib/password.js'
import { signToken } from '../../lib/token.js'

const registerSchema = z.object({
  cpf: z.string().min(11, 'Informe um CPF válido.'),
  token: z.string().min(8, 'Informe o token recebido pelo administrador.'),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  confirmacaoSenha: z.string().min(8, 'Confirme a senha digitada.'),
  nome: z.string().min(3).max(160).optional(),
})

type RegisterBody = z.infer<typeof registerSchema>

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

export async function register(
  request: Request<unknown, unknown, RegisterBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = registerSchema.parse(request.body)

    if (payload.senha !== payload.confirmacaoSenha) {
      response.status(400).json({ message: 'As senhas informadas não conferem.' })
      return
    }

    const convite = await prisma.convite.findUnique({ where: { token: payload.token } })

    if (!convite) {
      response.status(400).json({ message: 'Token inválido ou expirado.' })
      return
    }

    if (convite.cpfConvidado !== payload.cpf) {
      response.status(400).json({ message: 'O token informado não corresponde ao CPF.' })
      return
    }

    if (convite.utilizadoEm) {
      response.status(400).json({ message: 'Este token já foi utilizado.' })
      return
    }

    if (convite.validoAte.getTime() < Date.now()) {
      response.status(400).json({ message: 'O token informado está expirado.' })
      return
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where: { cpf: payload.cpf } })
    if (usuarioExistente) {
      response.status(409).json({ message: 'Já existe um usuário cadastrado com este CPF.' })
      return
    }

    const senhaHash = await hashPassword(payload.senha)

    await prisma.usuario.create({
      data: {
        cpf: payload.cpf,
        nome: payload.nome ?? null,
        senhaHash,
        tipo: convite.tipo,
      },
    })

    if (convite.tipo === 'G') {
      await prisma.guide.create({
        data: {
          cpf: payload.cpf,
          slug: payload.cpf,
          name: payload.nome ?? `Guia ${payload.cpf.slice(-4)}`,
          speciality: null,
          summary: null,
          biography: null,
          experienceYears: 0,
          toursCompleted: 0,
          rating: 0,
          languages: [],
          certifications: [],
          curiosities: [],
          photoUrl: null,
          isFeatured: false,
          isActive: true,
        },
      })
    }

    await prisma.convite.update({
      where: { token: convite.token },
      data: { utilizadoEm: new Date() },
    })

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: payload.cpf },
      select: {
        cpf: true,
        nome: true,
        tipo: true,
        guia: { select: { slug: true, name: true } },
      },
    })

    const token = signToken({ cpf: payload.cpf, tipo: convite.tipo })

    response.status(201).json({
      data: {
        token,
        usuario: buildUserPayload(usuario),
      },
      message: 'Cadastro realizado com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
