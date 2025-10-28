import crypto from 'node:crypto'
import type { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { formatDateTimeLabel } from '../admin/formatters.js'

const participantSchema = z.object({
  fullName: z.string().min(1, 'Informe o nome do participante'),
  cpf: z.string().min(11).max(14).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
})

const bookingSchema = z.object({
  trailId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  guideCpf: z.string().min(11).optional(),
  contactName: z.string().min(3),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(8),
  scheduledDate: z.string().min(4),
  scheduledTime: z.string().optional(),
  participantsCount: z.coerce.number().int().min(1).max(60),
  notes: z.string().max(1000).optional(),
  participants: z.array(participantSchema).max(60).optional(),
  source: z.enum(['PUBLIC_PORTAL', 'ADMIN']).optional(),
})

type CreateBookingBody = z.infer<typeof bookingSchema>

type TransactionClient = Prisma.TransactionClient

type HttpError = Error & { statusCode: number }

function createHttpError(statusCode: number, message: string): HttpError {
  return Object.assign(new Error(message), { statusCode })
}

async function generateProtocol(client: TransactionClient): Promise<string> {
  const now = new Date()
  const prefix = `ACD-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  let attempts = 0

  while (attempts < 5) {
    const candidate = `${prefix}-${String(crypto.randomInt(0, 9999)).padStart(4, '0')}`
    const exists = await client.booking.findUnique({ where: { protocol: candidate }, select: { id: true } })
    if (!exists) {
      return candidate
    }
    attempts += 1
  }

  return `${prefix}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
}

export async function createBooking(
  request: Request<unknown, unknown, CreateBookingBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = bookingSchema.parse(request.body)

    const created = await prisma.$transaction(async (tx) => {
      const trail = await tx.trail.findUnique({
        where: { id: data.trailId },
        select: { id: true, maxGroupSize: true, name: true },
      })

      if (!trail) {
        throw createHttpError(404, 'Trilha informada não foi encontrada.')
      }

      const guideCpfInput = data.guideCpf ?? null
      let resolvedGuideCpf: string | null = guideCpfInput
      let scheduledFor: Date

      if (data.sessionId) {
        const lockedSession = await tx.$queryRaw<{ id: string }[]>`
          SELECT id
          FROM "sessoes_trilhas"
          WHERE id = ${data.sessionId}
          FOR UPDATE
        `

        if (!lockedSession || lockedSession.length === 0) {
          throw createHttpError(400, 'Sessão selecionada não corresponde à trilha informada.')
        }

        const session = await tx.trailSession.findUnique({
          where: { id: data.sessionId },
          include: {
            bookings: { select: { participantsCount: true, status: true } },
          },
        })

        if (!session || session.trailId !== data.trailId) {
          throw createHttpError(400, 'Sessão selecionada não corresponde à trilha informada.')
        }

        const occupied = session.bookings.reduce((total, booking) => {
          return booking.status === 'CANCELLED' ? total : total + booking.participantsCount
        }, 0)

        if (occupied + data.participantsCount > session.capacity) {
          throw createHttpError(409, 'Capacidade da sessão excedida para a quantidade de participantes.')
        }

        scheduledFor = session.startsAt
        resolvedGuideCpf = resolvedGuideCpf ?? session.primaryGuideCpf
      } else {
        const isoDate = `${data.scheduledDate}T${data.scheduledTime ?? '08:00'}:00`
        const parsedDate = new Date(isoDate)
        if (Number.isNaN(parsedDate.getTime())) {
          throw createHttpError(400, 'Data ou horário informados são inválidos.')
        }

        scheduledFor = parsedDate
      }

      if (data.participantsCount > trail.maxGroupSize) {
        throw createHttpError(400, 'Quantidade de participantes excede o limite da trilha.')
      }

      if (resolvedGuideCpf) {
        const guideRecord = await tx.guide.findFirst({
          where: {
            isActive: true,
            cpf: resolvedGuideCpf,
          },
          select: { cpf: true },
        })

        if (!guideRecord) {
          throw createHttpError(400, 'Guia informado não está ativo ou não existe.')
        }

        resolvedGuideCpf = guideRecord.cpf
      }

      if (guideCpfInput && !resolvedGuideCpf) {
        throw createHttpError(400, 'Não foi possível identificar o guia informado.')
      }

      const protocol = await generateProtocol(tx)

      const booking = await tx.booking.create({
        data: {
          protocol,
          trailId: trail.id,
          sessionId: data.sessionId ?? null,
          guideCpf: resolvedGuideCpf,
          status: 'PENDING',
          scheduledFor,
          participantsCount: data.participantsCount,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          notes: data.notes,
          source: data.source ?? 'PUBLIC_PORTAL',
          participants: data.participants?.length
            ? {
                create: data.participants.map((participant) => ({
                  fullName: participant.fullName,
                  cpf: participant.cpf,
                  email: participant.email,
                  phone: participant.phone,
                })),
              }
            : undefined,
        },
        include: {
          trail: { select: { name: true } },
          guide: { select: { name: true } },
        },
      })

      await tx.activityLog.create({
        data: {
          bookingId: booking.id,
          message: `Nova solicitação de agendamento recebida para ${booking.trail.name}.`,
        },
      })

      return booking
    })

    response.status(201).json({
      data: {
        id: created.id,
        protocol: created.protocol,
        status: created.status,
        scheduledFor: created.scheduledFor,
        scheduledForLabel: formatDateTimeLabel(created.scheduledFor),
        contactName: created.contactName,
        trailName: created.trail.name,
        guideName: created.guide?.name ?? null,
      },
      message: 'Solicitação de agendamento registrada com sucesso. Entraremos em contato para confirmação.',
    })
  } catch (error) {
    if (typeof (error as Partial<HttpError>).statusCode === 'number') {
      const { statusCode } = error as HttpError
      response.status(statusCode).json({ message: (error as Error).message })
      return
    }

    next(error)
  }
}
