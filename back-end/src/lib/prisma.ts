import { PrismaClient } from '@prisma/client'

type GlobalWithPrisma = typeof globalThis & {
  __agendunasPrisma?: PrismaClient
}

const globalForPrisma = globalThis as GlobalWithPrisma

const prisma =
  globalForPrisma.__agendunasPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__agendunasPrisma = prisma
}

export default prisma
