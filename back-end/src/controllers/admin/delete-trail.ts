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

    // Verificar se a trilha existe
    const trail = await prisma.trail.findUnique({
      where: { id },
      include: {
        sessions: {
          select: { id: true },
        },
        bookings: {
          select: { id: true },
        },
      },
    })

    if (!trail) {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    // Deletar em cascata usando transação
    await prisma.$transaction(async (tx) => {
      // 1. Deletar todas as sessões da trilha
      // (isso seta sessionId para NULL nos bookings relacionados, mas eles ainda referenciam a trilha)
      await tx.trailSession.deleteMany({
        where: { trailId: id },
      })

      // 2. Deletar todos os bookings relacionados à trilha
      // (isso também remove os participantes via cascade)
      await tx.booking.deleteMany({
        where: { trailId: id },
      })

      // 3. Finalmente, deletar a trilha
      // (TrailGuide já será deletado via cascade do schema)
      await tx.trail.delete({
        where: { id },
      })
    })

    response.json({ data: { id }, message: 'Trilha removida com sucesso.' })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    next(error)
  }
}
