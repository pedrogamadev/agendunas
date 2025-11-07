import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { hashPassword } from '../../lib/password.js'
import { signClienteToken } from '../../lib/token.js'
import { buildClientePayload, clienteAuthSelect } from './user-payload.js'

const customerRegisterSchema = z
  .object({
    cpf: z.string().min(11, 'Informe um CPF válido.'),
    nome: z.string().min(2, 'Informe seu nome.').max(120, 'Nome muito longo.'),
    sobrenome: z.string().min(2, 'Informe seu sobrenome.').max(160, 'Sobrenome muito longo.'),
    dataNascimento: z
      .coerce.date({ invalid_type_error: 'Informe uma data de nascimento válida.' })
      .max(new Date(), 'A data de nascimento não pode estar no futuro.'),
    email: z.string().email('Informe um e-mail válido.').max(180, 'E-mail muito longo.'),
    cidadeOrigem: z.string().min(2, 'Informe sua cidade de origem.').max(160, 'Cidade muito longa.'),
    senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmacaoSenha: z.string().min(8, 'Confirme a senha digitada.'),
  })
  .refine((value) => value.senha === value.confirmacaoSenha, {
    path: ['confirmacaoSenha'],
    message: 'As senhas informadas não conferem.',
  })

function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

export async function customerRegister(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = customerRegisterSchema.parse(request.body)
    const normalizedCpf = sanitizeCpf(payload.cpf)

    if (normalizedCpf.length !== 11) {
      response.status(400).json({ message: 'Informe um CPF válido com 11 dígitos.' })
      return
    }

    const normalizedEmail = payload.email.trim().toLowerCase()

    const [existingByCpf, existingByEmail] = await Promise.all([
      prisma.cliente.findUnique({ where: { cpf: normalizedCpf } }),
      prisma.cliente.findUnique({ where: { email: normalizedEmail } }),
    ])

    if (existingByCpf) {
      response.status(409).json({ message: 'Já existe um cadastro utilizando este CPF.' })
      return
    }

    if (existingByEmail) {
      response.status(409).json({ message: 'Já existe um cadastro utilizando este e-mail.' })
      return
    }

    const senhaHash = await hashPassword(payload.senha)

    const cliente = await prisma.cliente.create({
      data: {
        cpf: normalizedCpf,
        nome: payload.nome.trim(),
        sobrenome: payload.sobrenome.trim(),
        email: normalizedEmail,
        dataNascimento: payload.dataNascimento,
        cidadeOrigem: payload.cidadeOrigem.trim(),
        senhaHash,
      },
      select: clienteAuthSelect,
    })

    const token = signClienteToken({ cpf: cliente.cpf })

    response.status(201).json({
      data: {
        token,
        cliente: buildClientePayload(cliente),
        usuario: null,
      },
      message: 'Cadastro realizado com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
