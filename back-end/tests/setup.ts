import { beforeEach } from 'vitest'
import { prismaMock } from './utils/prisma-mock.js'

process.env.NODE_ENV = 'test'

beforeEach(() => {
  prismaMock.reset()
})
