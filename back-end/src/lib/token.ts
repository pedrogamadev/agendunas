import type { TipoUsuario } from '@prisma/client'
import jwt from 'jsonwebtoken'

const DEFAULT_EXPIRATION = '12h'
const SECRET = process.env.JWT_SECRET ?? 'agendunas-development-secret'

export type UsuarioTokenPayload = {
  scope: 'usuario'
  cpf: string
  tipo: TipoUsuario
}

export type ClienteTokenPayload = {
  scope: 'cliente'
  cpf: string
}

export type TokenPayload = UsuarioTokenPayload | ClienteTokenPayload

export function signToken(payload: TokenPayload, expiresIn: string = DEFAULT_EXPIRATION): string {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function signUsuarioToken(
  payload: Omit<UsuarioTokenPayload, 'scope'>,
  expiresIn: string = DEFAULT_EXPIRATION,
): string {
  return signToken({ ...payload, scope: 'usuario' }, expiresIn)
}

export function signClienteToken(
  payload: Omit<ClienteTokenPayload, 'scope'>,
  expiresIn: string = DEFAULT_EXPIRATION,
): string {
  return signToken({ ...payload, scope: 'cliente' }, expiresIn)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload
}
