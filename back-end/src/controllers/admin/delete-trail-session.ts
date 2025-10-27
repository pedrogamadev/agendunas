import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { normalizeTrailSession, trailSessionsInclude } from './trail-service.js'

type DeleteTrailSessionParams = {
  id: string
}

export async function deleteTrailSession(
  request: Request<DeleteTrailSessionParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    const session = await prisma.trailSession.findUnique({
      where: { id },
      include: {
        trail: { select: { id: true, name: true } },
        bookings: { select: { id: true } },
      },
    })

    if (!session) {
      response.status(404).json({ message: 'Sessão informada não foi encontrada.' })
      return
    }

    if (session.bookings.length > 0) {
      const cancelled = await prisma.trailSession.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: trailSessionsInclude.include,
      })

      response.json({
        data: normalizeTrailSession(cancelled as typeof cancelled, {
          trailId: session.trail.id,
          trailName: session.trail.name,
        }),
        message: 'Sessão cancelada pois possui reservas associadas.',
      })
      return
    }

    await prisma.trailSession.delete({ where: { id } })

    response.json({
      data: { id, deleted: true },
      message: 'Sessão removida com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
