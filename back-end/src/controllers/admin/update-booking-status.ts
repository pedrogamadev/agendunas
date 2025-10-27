import type { BookingStatus } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { createStatusTone, formatDateTimeLabel } from './formatters.js'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED']),
})

type UpdateBookingStatusParams = {
  id: string
}

type UpdateBookingStatusBody = z.infer<typeof updateSchema>

export async function updateBookingStatus(
  request: Request<UpdateBookingStatusParams, unknown, UpdateBookingStatusBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    if (!id) {
      response.status(400).json({ message: 'Identificador do agendamento não informado.' })
      return
    }

    const payload = updateSchema.parse(request.body)

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: payload.status as BookingStatus },
      include: {
        trail: { select: { name: true } },
      },
    })

    await prisma.activityLog.create({
      data: {
        bookingId: booking.id,
        message: `Status do agendamento ${booking.protocol} atualizado para ${payload.status}.`,
      },
    })

    response.json({
      data: {
        id: booking.id,
        protocol: booking.protocol,
        status: booking.status,
        statusTone: createStatusTone(booking.status),
        updatedAt: booking.updatedAt.toISOString(),
        updatedAtLabel: formatDateTimeLabel(booking.updatedAt),
        trailName: booking.trail.name,
      },
      message: 'Status do agendamento atualizado com sucesso.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: error.errors[0]?.message ?? 'Dados inválidos.' })
      return
    }

    next(error)
  }
}
