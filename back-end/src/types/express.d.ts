import type { TipoUsuario } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        cpf: string
        nome: string | null
        tipo: TipoUsuario
      }
    }
  }
}

export {}
