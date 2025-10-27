import type { TipoUsuario } from '@prisma/client'
import jwt from 'jsonwebtoken'

const DEFAULT_EXPIRATION = '12h'
const SECRET = process.env.JWT_SECRET ?? 'agendunas-development-secret'

type TokenPayload = {
  cpf: string
  tipo: TipoUsuario
}

export function signToken(payload: TokenPayload, expiresIn: string = DEFAULT_EXPIRATION): string {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload
}
