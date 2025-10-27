import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { formatDateTimeLabel } from './formatters.js'

const createEventSchema = z.object({
  title: z.string().min(3, 'Informe o título do evento.'),
  slug: z.string().min(3, 'Informe um identificador (slug) para o evento.'),
  description: z.string().min(10, 'Descreva o evento com pelo menos 10 caracteres.'),
  location: z.string().optional(),
  startsAt: z.string().min(8, 'Informe a data e horário de início do evento.'),
  endsAt: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'ARCHIVED']).default('DRAFT'),
  highlight: z.boolean().optional(),
})

type CreateEventBody = z.infer<typeof createEventSchema>

export async function createEvent(
  request: Request<unknown, unknown, CreateEventBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = createEventSchema.parse(request.body)

    const startsAtDate = new Date(payload.startsAt)
    if (Number.isNaN(startsAtDate.getTime())) {
      response.status(400).json({ message: 'Data de início inválida.' })
      return
    }

    const endsAtDate = payload.endsAt ? new Date(payload.endsAt) : null
    if (payload.endsAt && endsAtDate && Number.isNaN(endsAtDate.getTime())) {
      response.status(400).json({ message: 'Data de término inválida.' })
      return
    }

    const event = await prisma.event.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        location: payload.location,
        startsAt: startsAtDate,
        endsAt: endsAtDate ?? undefined,
        capacity: payload.capacity,
        status: payload.status,
        highlight: payload.highlight ?? false,
      },
    })

    await prisma.activityLog.create({
      data: {
        eventId: event.id,
        message: `Novo evento cadastrado: ${event.title}.`,
      },
    })

    response.status(201).json({
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt.toISOString(),
        startsAtLabel: formatDateTimeLabel(event.startsAt),
        endsAt: event.endsAt?.toISOString() ?? null,
        capacity: event.capacity,
        status: event.status,
        highlight: event.highlight,
      },
      message: 'Evento cadastrado com sucesso.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: error.errors[0]?.message ?? 'Dados inválidos.' })
      return
    }

    next(error)
  }
}
