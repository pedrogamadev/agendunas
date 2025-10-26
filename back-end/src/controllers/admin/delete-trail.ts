import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'

const paramsSchema = z.object({
  id: z.string().min(1),
})

type DeleteTrailParams = z.infer<typeof paramsSchema>

export async function deleteTrail(
  request: Request<DeleteTrailParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(request.params)

    await prisma.trail.delete({ where: { id } })

    response.json({ data: { id }, message: 'Trilha removida com sucesso.' })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    next(error)
  }
}
