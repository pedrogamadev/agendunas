import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { createStatusTone, formatDateTimeLabel } from './formatters.js'

const updateParticipantSchema = z.object({
  isBanned: z.boolean().optional(),
})

type UpdateParticipantParams = {
  id: string
}

type UpdateParticipantBody = z.infer<typeof updateParticipantSchema>

export async function updateParticipant(
  request: Request<UpdateParticipantParams, unknown, UpdateParticipantBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params

    if (!id) {
      response.status(400).json({ message: 'Identificador do participante não informado.' })
      return
    }

    const payload = updateParticipantSchema.parse(request.body)

    const participant = await prisma.participant.update({
      where: { id },
      data: {
        isBanned: payload.isBanned ?? undefined,
      },
      include: {
        booking: {
          include: {
            trail: { select: { name: true } },
          },
        },
      },
    })

    await prisma.activityLog.create({
      data: {
        bookingId: participant.bookingId,
        message: payload.isBanned
          ? `Participante ${participant.fullName} banido do sistema.`
          : `Participante ${participant.fullName} reativado no sistema.`,
      },
    })

    response.json({
      data: {
        id: participant.id,
        fullName: participant.fullName,
        isBanned: participant.isBanned,
        updatedAt: participant.updatedAt.toISOString(),
        updatedAtLabel: formatDateTimeLabel(participant.updatedAt),
        booking: {
          id: participant.booking.id,
          protocol: participant.booking.protocol,
          trailName: participant.booking.trail.name,
          status: participant.booking.status,
          statusTone: createStatusTone(participant.booking.status),
        },
      },
      message: 'Dados do participante atualizados com sucesso.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: error.errors[0]?.message ?? 'Dados inválidos.' })
      return
    }

    next(error)
  }
}
