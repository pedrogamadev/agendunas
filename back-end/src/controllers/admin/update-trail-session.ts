import type { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { isValidPhoneInput, normalizePhoneInput } from '../../utils/phone.js'
import { activeBookingStatuses, normalizeTrailSession, trailSessionsInclude } from './trail-service.js'

const updateTrailSessionSchema = z
  .object({
    startsAt: z.string().min(1).optional(),
    endsAt: z.string().min(1).nullable().optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    meetingPoint: z.string().max(240).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
    primaryGuideCpf: z.string().min(11).nullable().optional(),
    contactPhone: z
      .string()
      .min(8, 'Informe um telefone de contato válido.')
      .max(20)
      .nullable()
      .optional()
      .refine((value) => value == null || isValidPhoneInput(value), {
        message: 'Telefone de contato inválido.',
      }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar a sessão.',
  })

type UpdateTrailSessionParams = {
  id: string
}

type UpdateTrailSessionBody = z.infer<typeof updateTrailSessionSchema>

export async function updateTrailSession(
  request: Request<UpdateTrailSessionParams, unknown, UpdateTrailSessionBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = request.params
    const payload = updateTrailSessionSchema.parse(request.body)

    const session = await prisma.trailSession.findUnique({
      where: { id },
      include: {
        trail: { select: { id: true, name: true, maxGroupSize: true } },
        bookings: { select: { id: true, status: true, participantsCount: true } },
      },
    })

    if (!session) {
      response.status(404).json({ message: 'Sessão informada não foi encontrada.' })
      return
    }

    let startsAt: Date | undefined
    if (payload.startsAt) {
      startsAt = new Date(payload.startsAt)
      if (Number.isNaN(startsAt.getTime())) {
        response.status(400).json({ message: 'Data de início da sessão inválida.' })
        return
      }
    }

    let endsAt: Date | null | undefined
    if (payload.endsAt !== undefined) {
      endsAt = payload.endsAt ? new Date(payload.endsAt) : null
      if (endsAt && Number.isNaN(endsAt.getTime())) {
        response.status(400).json({ message: 'Data de término da sessão inválida.' })
        return
      }

      if (startsAt && endsAt && endsAt < startsAt) {
        response.status(400).json({ message: 'Horário final não pode ser anterior ao início.' })
        return
      }

      if (!startsAt && endsAt && session.startsAt > endsAt) {
        response.status(400).json({ message: 'Horário final não pode ser anterior ao início.' })
        return
      }
    }

    if (payload.capacity !== undefined) {
      const totalParticipants = session.bookings.reduce((total, booking) => {
        if (activeBookingStatuses.includes(booking.status)) {
          return total + booking.participantsCount
        }
        return total
      }, 0)

      if (payload.capacity < totalParticipants) {
        response.status(400).json({ message: 'Capacidade não pode ser inferior às reservas existentes.' })
        return
      }

      if (payload.capacity > session.trail.maxGroupSize) {
        response
          .status(400)
          .json({ message: 'Capacidade da sessão não pode exceder o limite da trilha.' })
        return
      }
    }

    let resolvedGuideCpf: string | null | undefined = payload.primaryGuideCpf
    if (payload.primaryGuideCpf !== undefined) {
      if (payload.primaryGuideCpf === null) {
        resolvedGuideCpf = null
      } else {
        const guide = await prisma.guide.findFirst({
          where: { cpf: payload.primaryGuideCpf, isActive: true, trails: { some: { trailId: session.trail.id } } },
          select: { cpf: true },
        })

        if (!guide) {
          response
            .status(400)
            .json({ message: 'Guia informado não está ativo ou não está vinculado à trilha.' })
          return
        }

        resolvedGuideCpf = guide.cpf
      }
    }

    const data: Prisma.TrailSessionUpdateInput = {}

    if (startsAt) {
      data.startsAt = startsAt
    }

    if (payload.endsAt !== undefined) {
      data.endsAt = endsAt ?? null
    }

    if (payload.capacity !== undefined) {
      data.capacity = payload.capacity
    }

    if (payload.meetingPoint !== undefined) {
      data.meetingPoint = payload.meetingPoint ?? null
    }

    if (payload.notes !== undefined) {
      data.notes = payload.notes ?? null
    }

    if (payload.status !== undefined) {
      data.status = payload.status
    }

    if (payload.primaryGuideCpf !== undefined) {
      data.primaryGuideCpf = resolvedGuideCpf
    }

    if (payload.contactPhone !== undefined) {
      data.contactPhone = normalizePhoneInput(payload.contactPhone)
    }

    const updated = await prisma.trailSession.update({
      where: { id },
      data,
      include: trailSessionsInclude.include,
    })

    response.json({
      data: normalizeTrailSession(updated as typeof updated, {
        trailId: session.trail.id,
        trailName: session.trail.name,
      }),
      message: 'Sessão atualizada com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
