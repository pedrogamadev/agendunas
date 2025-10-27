import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'

const paramsSchema = z.object({
  cpf: z.string().min(11),
})

type DeleteGuideParams = z.infer<typeof paramsSchema>

export async function deleteGuide(
  request: Request<DeleteGuideParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { cpf } = paramsSchema.parse(request.params)

    await prisma.guide.delete({ where: { cpf } })

    response.json({ data: { cpf }, message: 'Guia removido com sucesso.' })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ message: 'Guia informado não foi encontrado.' })
      return
    }

    next(error)
  }
}
