import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { normalizeTrailSession, trailSessionsInclude } from './trail-service.js'

const createTrailSessionSchema = z.object({
  startsAt: z.string().min(1, 'Informe a data e hora de início da sessão.'),
  endsAt: z.string().min(1).optional().nullable(),
  capacity: z.coerce.number().int().min(1, 'Informe a capacidade da sessão.'),
  meetingPoint: z.string().max(240).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
  primaryGuideCpf: z.string().min(11).optional().nullable(),
})

type CreateTrailSessionParams = {
  trailId: string
}

type CreateTrailSessionBody = z.infer<typeof createTrailSessionSchema>

export async function createTrailSession(
  request: Request<CreateTrailSessionParams, unknown, CreateTrailSessionBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { trailId } = request.params
    const payload = createTrailSessionSchema.parse(request.body)

    const startsAt = new Date(payload.startsAt)
    if (Number.isNaN(startsAt.getTime())) {
      response.status(400).json({ message: 'Data de início da sessão inválida.' })
      return
    }

    const endsAt = payload.endsAt ? new Date(payload.endsAt) : null
    if (endsAt && Number.isNaN(endsAt.getTime())) {
      response.status(400).json({ message: 'Data de término da sessão inválida.' })
      return
    }

    if (endsAt && endsAt < startsAt) {
      response.status(400).json({ message: 'Horário final não pode ser anterior ao início.' })
      return
    }

    const trail = await prisma.trail.findUnique({
      where: { id: trailId },
      select: { id: true, name: true, maxGroupSize: true },
    })

    if (!trail) {
      response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
      return
    }

    if (payload.capacity > trail.maxGroupSize) {
      response
        .status(400)
        .json({ message: 'Capacidade da sessão não pode exceder o limite da trilha.' })
      return
    }

    let resolvedGuideCpf: string | null | undefined = payload.primaryGuideCpf ?? undefined

    if (typeof resolvedGuideCpf === 'string') {
      const guide = await prisma.guide.findFirst({
        where: { cpf: resolvedGuideCpf, isActive: true, trails: { some: { trailId } } },
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

    const created = await prisma.trailSession.create({
      data: {
        trailId: trail.id,
        startsAt,
        endsAt,
        capacity: payload.capacity,
        meetingPoint: payload.meetingPoint ?? null,
        notes: payload.notes ?? null,
        status: payload.status ?? 'SCHEDULED',
        primaryGuideCpf: resolvedGuideCpf ?? null,
      },
      include: trailSessionsInclude.include,
    })

    response.status(201).json({
      data: normalizeTrailSession(created as typeof created, {
        trailId: trail.id,
        trailName: trail.name,
      }),
      message: 'Sessão criada com sucesso.',
    })
  } catch (error) {
    next(error)
  }
}
