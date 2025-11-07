import type { TipoUsuario } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        kind: 'usuario'
        cpf: string
        nome: string | null
        tipo: TipoUsuario
      }
      authenticated?:
        | {
            kind: 'usuario'
            cpf: string
            nome: string | null
            tipo: TipoUsuario
          }
        | {
            kind: 'cliente'
            cpf: string
            nome: string
          }
    }
  }
}

export {}
