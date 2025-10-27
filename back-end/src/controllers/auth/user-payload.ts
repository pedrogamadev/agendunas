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

export function buildUserPayload(usuario: UsuarioAuthPayload | UsuarioWithPassword | null) {
  if (!usuario) {
    return null
  }

  return {
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
