import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { normalizeTrailSession, trailSessionsInclude } from './trail-service.js'

type ListTrailSessionParticipantsParams = {
  id: string
}

export async function listTrailSessionParticipants(
  request: Request<ListTrailSessionParticipantsParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    const session = await prisma.trailSession.findUnique({
      where: { id },
      include: {
        ...trailSessionsInclude.include,
        trail: { select: { id: true, name: true } },
      },
    })

    if (!session) {
      response.status(404).json({ message: 'Sessão informada não foi encontrada.' })
      return
    }

    const normalized = normalizeTrailSession(session, {
      trailId: session.trail.id,
      trailName: session.trail.name,
    })

    response.json({ data: normalized.participants })
  } catch (error) {
    next(error)
  }
}
