import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { createStatusTone, formatDate, formatDateTimeLabel, formatTime } from './formatters.js'

type GetBookingParams = {
  id: string
}

export async function getBooking(
  request: Request<GetBookingParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    if (!id) {
      response.status(400).json({ message: 'Identificador do agendamento não informado.' })
      return
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        trail: {
          select: {
            id: true,
            name: true,
          },
        },
        guide: {
          select: {
            cpf: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            startsAt: true,
            capacity: true,
            meetingPoint: true,
            status: true,
          },
        },
        participants: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            email: true,
            phone: true,
            createdAt: true,
            isBanned: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!booking) {
      response.status(404).json({ message: 'Agendamento não encontrado.' })
      return
    }

    const payload = {
      id: booking.id,
      protocol: booking.protocol,
      status: booking.status,
      statusTone: createStatusTone(booking.status),
      scheduledFor: booking.scheduledFor.toISOString(),
      scheduledDateLabel: formatDate(booking.scheduledFor),
      scheduledTimeLabel: formatTime(booking.scheduledFor),
      scheduledForLabel: formatDateTimeLabel(booking.scheduledFor),
      participantsCount: booking.participantsCount,
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      notes: booking.notes,
      trail: booking.trail,
      guide: booking.guide,
      session: booking.session
        ? {
            id: booking.session.id,
            startsAt: booking.session.startsAt.toISOString(),
            capacity: booking.session.capacity,
            meetingPoint: booking.session.meetingPoint,
            status: booking.session.status,
            startsAtLabel: formatDateTimeLabel(booking.session.startsAt),
          }
        : null,
      participants: booking.participants.map((participant) => ({
        id: participant.id,
        fullName: participant.fullName,
        cpf: participant.cpf,
        email: participant.email,
        phone: participant.phone,
        createdAt: participant.createdAt.toISOString(),
        createdAtLabel: formatDateTimeLabel(participant.createdAt),
        isBanned: participant.isBanned,
      })),
      createdAt: booking.createdAt.toISOString(),
      createdAtLabel: formatDateTimeLabel(booking.createdAt),
      updatedAt: booking.updatedAt.toISOString(),
    }

    response.json({ data: payload })
  } catch (error) {
    next(error)
  }
}
