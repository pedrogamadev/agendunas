import crypto from 'node:crypto'
import prisma from '../../lib/prisma.js'
import { formatDateTimeLabel } from '../admin/formatters.js'
import { z } from 'zod'

const participantSchema = z.object({
  fullName: z.string().min(1, 'Informe o nome do participante'),
  documentId: z.string().min(3).max(32).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
})

const bookingSchema = z.object({
  trailId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  guideId: z.string().min(1).optional(),
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

async function generateProtocol() {
  const now = new Date()
  const prefix = `ACD-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  let attempts = 0

  while (attempts < 5) {
    const candidate = `${prefix}-${String(crypto.randomInt(0, 9999)).padStart(4, '0')}`
    const exists = await prisma.booking.findUnique({ where: { protocol: candidate }, select: { id: true } })
    if (!exists) {
      return candidate
    }
    attempts += 1
  }

  return `${prefix}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
}

export async function createBooking(request, response, next) {
  try {
    const data = bookingSchema.parse(request.body)

    const trail = await prisma.trail.findUnique({
      where: { id: data.trailId },
      select: { id: true, maxGroupSize: true, name: true },
    })

    if (!trail) {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    let session = null
    let scheduledFor
    let guideIdInput = data.guideId ?? null
    let resolvedGuideId = guideIdInput

    if (data.sessionId) {
      session = await prisma.trailSession.findUnique({
        where: { id: data.sessionId },
        include: {
          bookings: { select: { participantsCount: true } },
        },
      })

      if (!session || session.trailId !== data.trailId) {
        response.status(400).json({ message: 'Sessão selecionada não corresponde à trilha informada.' })
        return
      }

      const occupied = session.bookings.reduce((sum, booking) => sum + booking.participantsCount, 0)
      if (occupied + data.participantsCount > session.capacity) {
        response.status(409).json({ message: 'Capacidade da sessão excedida para a quantidade de participantes.' })
        return
      }

      scheduledFor = session.startsAt
      resolvedGuideId = resolvedGuideId ?? session.primaryGuideId
    } else {
      const isoDate = `${data.scheduledDate}T${data.scheduledTime ?? '08:00'}:00`
      const parsedDate = new Date(isoDate)
      if (Number.isNaN(parsedDate.getTime())) {
        response.status(400).json({ message: 'Data ou horário informados são inválidos.' })
        return
      }

      scheduledFor = parsedDate
    }

    if (data.participantsCount > trail.maxGroupSize) {
      response.status(400).json({ message: 'Quantidade de participantes excede o limite da trilha.' })
      return
    }

    if (resolvedGuideId) {
      const guideRecord = await prisma.guide.findFirst({
        where: {
          isActive: true,
          OR: [{ id: resolvedGuideId }, { slug: resolvedGuideId }],
        },
        select: { id: true },
      })

      if (!guideRecord) {
        response.status(400).json({ message: 'Guia informado não está ativo ou não existe.' })
        return
      }

      resolvedGuideId = guideRecord.id
    }

    if (guideIdInput && !resolvedGuideId) {
      response.status(400).json({ message: 'Não foi possível identificar o guia informado.' })
      return
    }

    const protocol = await generateProtocol()

    const booking = await prisma.booking.create({
      data: {
        protocol,
        trailId: trail.id,
        sessionId: session?.id ?? null,
        guideId: resolvedGuideId,
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
                documentId: participant.documentId,
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

    await prisma.activityLog.create({
      data: {
        bookingId: booking.id,
        message: `Nova solicitação de agendamento recebida para ${booking.trail.name}.`,
      },
    })

    response.status(201).json({
      data: {
        id: booking.id,
        protocol: booking.protocol,
        status: booking.status,
        scheduledFor: booking.scheduledFor,
        scheduledForLabel: formatDateTimeLabel(booking.scheduledFor),
        contactName: booking.contactName,
        trailName: booking.trail.name,
        guideName: booking.guide?.name ?? null,
      },
      message: 'Solicitação de agendamento registrada com sucesso. Entraremos em contato para confirmação.',
    })
  } catch (error) {
    next(error)
  }
}
