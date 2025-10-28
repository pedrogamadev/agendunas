import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../lib/prisma.js'
import { isValidPhoneInput, normalizePhoneInput } from '../../utils/phone.js'
import { guideInclude, normalizeGuide } from './guide-service.js'

const paramsSchema = z.object({
  cpf: z.string().min(11),
})

const guideSchema = z.object({
  name: z.string().min(3, 'Informe o nome do guia.'),
  slug: z.string().min(3).max(120),
  contactPhone: z
    .string()
    .min(8, 'Informe um telefone de contato válido.')
    .max(20)
    .optional()
    .nullable()
    .refine((value) => value == null || isValidPhoneInput(value), {
      message: 'Telefone de contato inválido.',
    }),
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

type UpdateGuideBody = z.infer<typeof guideSchema>

type UpdateGuideParams = z.infer<typeof paramsSchema>

function normalizeStringList(values?: string[]): string[] {
  if (!values) {
    return []
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

export async function updateGuide(
  request: Request<UpdateGuideParams, unknown, UpdateGuideBody>,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { cpf } = paramsSchema.parse(request.params)
    const payload = guideSchema.parse(request.body)

    const languages = payload.languages !== undefined ? normalizeStringList(payload.languages) : undefined
    const certifications =
      payload.certifications !== undefined ? normalizeStringList(payload.certifications) : undefined
    const curiosities =
      payload.curiosities !== undefined ? normalizeStringList(payload.curiosities) : undefined

    const contactPhone = normalizePhoneInput(payload.contactPhone)

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

    await prisma.trailGuide.deleteMany({ where: { guideCpf: cpf } })

    const updated = await prisma.guide.update({
      where: { cpf },
      data: {
        name: payload.name,
        slug: payload.slug,
        contactPhone: payload.contactPhone !== undefined ? contactPhone : undefined,
        speciality: payload.speciality ?? null,
        summary: payload.summary ?? null,
        biography: payload.biography ?? null,
        experienceYears: payload.experienceYears ?? undefined,
        toursCompleted: payload.toursCompleted ?? undefined,
        rating: payload.rating ?? undefined,
        languages: languages !== undefined ? { set: languages } : undefined,
        certifications: certifications !== undefined ? { set: certifications } : undefined,
        curiosities: curiosities !== undefined ? { set: curiosities } : undefined,
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

    response.json({
      data: normalizeGuide(updated),
      message: 'Guia atualizado com sucesso.',
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const conflictError = Object.assign(new Error('Já existe um guia com o slug informado.'), {
          statusCode: 409,
        })
        next(conflictError)
        return
      }

      if (error.code === 'P2025') {
        response.status(404).json({ message: 'Guia informado não foi encontrado.' })
        return
      }
    }

    next(error)
  }
}
