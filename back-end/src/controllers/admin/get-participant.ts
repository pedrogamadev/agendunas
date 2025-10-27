import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { createStatusTone, formatDateTimeLabel } from './formatters.js'

type GetParticipantParams = {
  id: string
}

export async function getParticipant(
  request: Request<GetParticipantParams>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    if (!id) {
      response.status(400).json({ message: 'Identificador do participante não informado.' })
      return
    }

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            trail: { select: { id: true, name: true } },
            guide: { select: { cpf: true, name: true } },
          },
        },
      },
    })

    if (!participant) {
      response.status(404).json({ message: 'Participante não encontrado.' })
      return
    }

    const payload = {
      id: participant.id,
      fullName: participant.fullName,
      cpf: participant.cpf,
      email: participant.email,
      phone: participant.phone,
      createdAt: participant.createdAt.toISOString(),
      createdAtLabel: formatDateTimeLabel(participant.createdAt),
      isBanned: participant.isBanned,
      booking: {
        id: participant.booking.id,
        protocol: participant.booking.protocol,
        status: participant.booking.status,
        statusTone: createStatusTone(participant.booking.status),
        scheduledFor: participant.booking.scheduledFor.toISOString(),
        scheduledForLabel: formatDateTimeLabel(participant.booking.scheduledFor),
        participantsCount: participant.booking.participantsCount,
        contactName: participant.booking.contactName,
        contactEmail: participant.booking.contactEmail,
        contactPhone: participant.booking.contactPhone,
        trail: participant.booking.trail,
        guide: participant.booking.guide,
      },
    }

    response.json({ data: payload })
  } catch (error) {
    next(error)
  }
}
