import { Prisma } from '@prisma/client'

const usuarioAuthDefaultArgs = Prisma.validator<Prisma.UsuarioDefaultArgs>()({
  select: {
    cpf: true,
    nome: true,
    sobrenome: true,
    email: true,
    dataNascimento: true,
    cidadeOrigem: true,
    tipo: true,
    guia: { select: { slug: true, name: true } },
  },
})

export const usuarioAuthSelect = usuarioAuthDefaultArgs.select

export type UsuarioAuthPayload = Prisma.UsuarioGetPayload<typeof usuarioAuthDefaultArgs>
export type UsuarioWithPassword = UsuarioAuthPayload & { senhaHash: string }

export function buildUsuarioPayload(usuario: UsuarioAuthPayload | UsuarioWithPassword | null) {
  if (!usuario) {
    return null
  }

  return {
    kind: 'usuario' as const,
    cpf: usuario.cpf,
    nome: usuario.nome,
    sobrenome: usuario.sobrenome,
    email: usuario.email,
    dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.toISOString() : null,
    cidadeOrigem: usuario.cidadeOrigem,
    tipo: usuario.tipo,
    guia: usuario.guia
      ? {
          slug: usuario.guia.slug,
          nome: usuario.guia.name,
        }
      : null,
  }
}

const clienteAuthDefaultArgs = Prisma.validator<Prisma.ClienteDefaultArgs>()({
  select: {
    cpf: true,
    nome: true,
    sobrenome: true,
    email: true,
    dataNascimento: true,
    cidadeOrigem: true,
  },
})

export const clienteAuthSelect = clienteAuthDefaultArgs.select

export type ClienteAuthPayload = Prisma.ClienteGetPayload<typeof clienteAuthDefaultArgs>
export type ClienteWithPassword = ClienteAuthPayload & { senhaHash: string }

export function buildClientePayload(cliente: ClienteAuthPayload | ClienteWithPassword | null) {
  if (!cliente) {
    return null
  }

  return {
    kind: 'cliente' as const,
    cpf: cliente.cpf,
    nome: cliente.nome,
    sobrenome: cliente.sobrenome,
    email: cliente.email,
    dataNascimento: cliente.dataNascimento ? cliente.dataNascimento.toISOString() : null,
    cidadeOrigem: cliente.cidadeOrigem,
  }
}
