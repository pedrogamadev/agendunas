import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { normalizeTrailSession, trailSessionsInclude } from './trail-service.js'

type ListTrailSessionsParams = {
  trailId: string
}

export async function listTrailSessions(
  request: Request<ListTrailSessionsParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { trailId } = request.params

    const trail = await prisma.trail.findUnique({
      where: { id: trailId },
      select: { id: true, name: true },
    })

    if (!trail) {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    const sessions = await prisma.trailSession.findMany({
      where: { trailId },
      orderBy: trailSessionsInclude.orderBy,
      include: trailSessionsInclude.include,
    })

    const normalized = sessions.map((session) =>
      normalizeTrailSession(session as typeof sessions[number], {
        trailId: trail.id,
        trailName: trail.name,
      }),
    )

    response.json({ data: normalized })
  } catch (error) {
    next(error)
  }
}
