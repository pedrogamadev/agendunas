import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { calculateOccupancy, formatDateTimeLabel } from '../admin/formatters.js'

const paramsSchema = z.object({
  id: z.string().min(1, 'Informe a sessão desejada.'),
})

type GetSessionAvailabilityParams = z.infer<typeof paramsSchema>

export async function getTrailSessionAvailability(
  request: Request<GetSessionAvailabilityParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(request.params)

    const session = await prisma.trailSession.findUnique({
      where: { id },
      include: {
        trail: { select: { id: true, name: true } },
        primaryGuide: { select: { cpf: true, name: true, contactPhone: true } },
        bookings: { select: { participantsCount: true, status: true } },
      },
    })

    if (!session) {
      response.status(404).json({ message: 'Sessão informada não foi encontrada.' })
      return
    }

    const participantsCount = session.bookings.reduce((total, booking) => {
      return booking.status === 'CANCELLED' ? total : total + booking.participantsCount
    }, 0)

    const availableSpots = Math.max(0, session.capacity - participantsCount)
    const occupancyPercentage = calculateOccupancy(participantsCount, session.capacity)
    const contactPhone = session.contactPhone ?? session.primaryGuide?.contactPhone ?? null

    response.json({
      data: {
        id: session.id,
        trailId: session.trailId,
        trailName: session.trail?.name ?? null,
        startsAt: session.startsAt.toISOString(),
        startsAtLabel: formatDateTimeLabel(session.startsAt),
        endsAt: session.endsAt ? session.endsAt.toISOString() : null,
        status: session.status,
        capacity: session.capacity,
        participantsCount,
        availableSpots,
        occupancyPercentage,
        contactPhone,
        primaryGuide: session.primaryGuide
          ? { cpf: session.primaryGuide.cpf, name: session.primaryGuide.name }
          : null,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
}
