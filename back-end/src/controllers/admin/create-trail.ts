import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { normalizeTrail, trailInclude } from './trail-service.js'

const createTrailSchema = z.object({
  name: z.string().min(3, 'Informe o nome da trilha.'),
  slug: z.string().min(3).max(160),
  description: z.string().min(20, 'Descreva a trilha com pelo menos 20 caracteres.'),
  summary: z.string().min(1).max(400).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(10),
  difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
  maxGroupSize: z.coerce.number().int().min(1),
  badgeLabel: z.string().min(1).max(120).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
  basePrice: z.union([z.coerce.number().min(0), z.null()]).optional(),
  highlight: z.boolean().optional(),
  meetingPoint: z.string().min(1).max(240).optional().nullable(),
  guideCpfs: z.array(z.string().min(11)).optional().default([]),
})

type CreateTrailBody = z.infer<typeof createTrailSchema>

export async function createTrail(
  request: Request<unknown, unknown, CreateTrailBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = createTrailSchema.parse(request.body)

    const uniqueGuideCpfs = Array.from(new Set(payload.guideCpfs ?? []))

    if (uniqueGuideCpfs.length > 0) {
      const guides = await prisma.guide.findMany({
        where: { cpf: { in: uniqueGuideCpfs } },
        select: { cpf: true },
      })

      if (guides.length !== uniqueGuideCpfs.length) {
        response.status(400).json({ message: 'Alguns guias informados não foram encontrados.' })
        return
      }
    }

    const basePrice =
      payload.basePrice === null ? null : payload.basePrice !== undefined ? payload.basePrice : undefined

    const created = await prisma.trail.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        summary: payload.summary ?? null,
        durationMinutes: payload.durationMinutes,
        difficulty: payload.difficulty,
        maxGroupSize: payload.maxGroupSize,
        badgeLabel: payload.badgeLabel ?? null,
        imageUrl: payload.imageUrl ?? null,
        status: payload.status ?? undefined,
        basePrice,
        highlight: payload.highlight ?? undefined,
        meetingPoint: payload.meetingPoint ?? null,
        guides:
          uniqueGuideCpfs.length > 0
            ? {
                create: uniqueGuideCpfs.map((cpf) => ({
                  guide: { connect: { cpf } },
                })),
              }
            : undefined,
      },
      include: trailInclude,
    })

    response.status(201).json({
      data: normalizeTrail(created),
      message: 'Trilha cadastrada com sucesso.',
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      const conflictError = Object.assign(new Error('Já existe uma trilha com o slug informado.'), {
        statusCode: 409,
      })
      next(conflictError)
      return
    }

    next(error)
  }
}
