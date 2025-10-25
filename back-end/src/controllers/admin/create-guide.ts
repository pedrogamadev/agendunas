import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { guideInclude, normalizeGuide } from './guide-service.js'

const guideSchema = z.object({
  name: z.string().min(3, 'Informe o nome do guia.'),
  slug: z.string().min(3).max(120),
  speciality: z.string().min(1).max(160).optional().nullable(),
  summary: z.string().min(1).max(400).optional().nullable(),
  biography: z.string().min(1).max(4000).optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  toursCompleted: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  languages: z.array(z.string().min(1)).optional(),
  certifications: z.array(z.string().min(1)).optional(),
  curiosities: z.array(z.string().min(1)).optional(),
  photoUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  featuredTrailId: z.string().min(1).optional().nullable(),
  trailIds: z.array(z.string().min(1)).optional(),
})

type CreateGuideBody = z.infer<typeof guideSchema>

function normalizeStringList(values?: string[]): string[] {
  if (!values) {
    return []
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

export async function createGuide(
  request: Request<unknown, unknown, CreateGuideBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = guideSchema.parse(request.body)

    const languages = normalizeStringList(payload.languages)
    const certifications = normalizeStringList(payload.certifications)
    const curiosities = normalizeStringList(payload.curiosities)

    const uniqueTrailIds = Array.from(new Set(payload.trailIds ?? []))
    const featuredTrailId = payload.featuredTrailId ?? null

    if (featuredTrailId && !uniqueTrailIds.includes(featuredTrailId)) {
      uniqueTrailIds.push(featuredTrailId)
    }

    if (uniqueTrailIds.length > 0) {
      const trails = await prisma.trail.findMany({
        where: { id: { in: uniqueTrailIds } },
        select: { id: true },
      })

      if (trails.length !== uniqueTrailIds.length) {
        response.status(400).json({ message: 'Algumas trilhas informadas não foram encontradas.' })
        return
      }
    }

    const created = await prisma.guide.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        speciality: payload.speciality ?? null,
        summary: payload.summary ?? null,
        biography: payload.biography ?? null,
        experienceYears: payload.experienceYears ?? undefined,
        toursCompleted: payload.toursCompleted ?? undefined,
        rating: payload.rating ?? undefined,
        languages,
        certifications,
        curiosities,
        photoUrl: payload.photoUrl ?? null,
        isFeatured: payload.isFeatured ?? undefined,
        isActive: payload.isActive ?? undefined,
        featuredTrailId,
        trails: uniqueTrailIds.length
          ? {
              create: uniqueTrailIds.map((trailId) => ({
                trail: { connect: { id: trailId } },
              })),
            }
          : undefined,
      },
      include: guideInclude,
    })

    response.status(201).json({
      data: normalizeGuide(created),
      message: 'Guia cadastrado com sucesso.',
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      const conflictError = Object.assign(new Error('Já existe um guia com o slug informado.'), {
        statusCode: 409,
      })
      next(conflictError)
      return
    }

    next(error)
  }
}
