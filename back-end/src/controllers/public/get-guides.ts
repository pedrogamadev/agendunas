import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'

type GuideTrailSummary = {
  id: string
  slug: string
  name: string
  difficulty: string
  durationMinutes: number
}

type FeaturedTrailSummary = {
  id: string
  slug: string
  name: string
  durationMinutes: number
}

type GuideProfile = {
  cpf: string
  slug: string
  name: string
  speciality: string | null
  biography: string | null
  summary: string | null
  rating: number | null
  experienceYears: number | null
  toursCompleted: number | null
  languages: string[]
  certifications: string[]
  curiosities: string[]
  photoUrl: string | null
  featuredTrail: FeaturedTrailSummary | null
  trails: GuideTrailSummary[]
}

export async function getGuides(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const guides = await prisma.guide.findMany({
      where: { isActive: true },
      include: {
        trails: {
          include: {
            trail: {
              select: {
                id: true,
                slug: true,
                name: true,
                difficulty: true,
                durationMinutes: true,
              },
            },
          },
        },
        featuredTrail: {
          select: {
            id: true,
            slug: true,
            name: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { name: 'asc' },
      ],
    })

    type GuideRecord = (typeof guides)[number]

    const normalized: GuideProfile[] = guides.map((guide: GuideRecord) => {
      type GuideTrailAssignment = (typeof guide.trails)[number]

      return {
        cpf: guide.cpf,
        slug: guide.slug,
        name: guide.name,
        speciality: guide.speciality,
        biography: guide.biography,
        summary: guide.summary,
        rating: guide.rating,
        experienceYears: guide.experienceYears,
        toursCompleted: guide.toursCompleted,
        languages: guide.languages,
        certifications: guide.certifications,
        curiosities: guide.curiosities,
        photoUrl: guide.photoUrl,
        featuredTrail: guide.featuredTrail
          ? {
              id: guide.featuredTrail.id,
              slug: guide.featuredTrail.slug,
              name: guide.featuredTrail.name,
              durationMinutes: guide.featuredTrail.durationMinutes,
            }
          : null,
        trails: guide.trails.map((assignment: GuideTrailAssignment) => ({
          id: assignment.trail.id,
          slug: assignment.trail.slug,
          name: assignment.trail.name,
          difficulty: assignment.trail.difficulty,
          durationMinutes: assignment.trail.durationMinutes,
        })),
      }
    })

    response.json({ data: normalized })
  } catch (error) {
    next(error)
  }
}
