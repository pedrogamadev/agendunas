import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { normalizeTrail, trailInclude } from './trail-service.js'

const paramsSchema = z.object({
  id: z.string().min(1),
})

const updateTrailSchema = z.object({
  name: z.string().min(3, 'Informe o nome da trilha.'),
  slug: z.string().min(3).max(160),
  description: z.string().min(20, 'Descreva a trilha com pelo menos 20 caracteres.'),
  summary: z.string().min(1).max(400).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(10),
  difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
  maxGroupSize: z.coerce.number().int().min(1),
  badgeLabel: z.string().min(1).max(120).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  basePrice: z.union([z.coerce.number().min(0), z.null()]).optional(),
  highlight: z.boolean(),
  meetingPoint: z.string().min(1).max(240).optional().nullable(),
  guideCpfs: z.array(z.string().min(11)).optional().default([]),
})

type UpdateTrailParams = z.infer<typeof paramsSchema>

type UpdateTrailBody = z.infer<typeof updateTrailSchema>

export async function updateTrail(
  request: Request<UpdateTrailParams, unknown, UpdateTrailBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(request.params)
    const payload = updateTrailSchema.parse(request.body)

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

    await prisma.trailGuide.deleteMany({ where: { trailId: id } })

    const basePrice =
      payload.basePrice === null ? null : payload.basePrice !== undefined ? payload.basePrice : undefined

    const updated = await prisma.trail.update({
      where: { id },
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
        status: payload.status,
        basePrice,
        highlight: payload.highlight,
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

    response.json({
      data: normalizeTrail(updated),
      message: 'Trilha atualizada com sucesso.',
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const conflictError = Object.assign(new Error('Já existe uma trilha com o slug informado.'), {
          statusCode: 409,
        })
        next(conflictError)
        return
      }

      if (error.code === 'P2025') {
        response.status(404).json({ message: 'Trilha informada não foi encontrada.' })
        return
      }
    }

    next(error)
  }
}
