import prisma from '../../lib/prisma.js'
import type { AdminGuide } from './types.js'

export const guideInclude = {
  trails: {
    include: {
      trail: {
        select: {
          id: true,
          name: true,
          difficulty: true,
        },
      },
    },
  },
  featuredTrail: {
    select: {
      id: true,
      name: true,
      difficulty: true,
    },
  },
} as const

type GuideRecord = Awaited<ReturnType<typeof prisma.guide.findMany>>[number]

type TrailAssignment = GuideRecord['trails'][number]

type FeaturedTrail = NonNullable<GuideRecord['featuredTrail']>

export function normalizeGuide(guide: GuideRecord): AdminGuide {
  return {
    cpf: guide.cpf,
    slug: guide.slug,
    name: guide.name,
    speciality: guide.speciality,
    summary: guide.summary,
    biography: guide.biography,
    experienceYears: guide.experienceYears,
    toursCompleted: guide.toursCompleted,
    rating: guide.rating,
    languages: guide.languages,
    certifications: guide.certifications,
    curiosities: guide.curiosities,
    photoUrl: guide.photoUrl,
    isFeatured: guide.isFeatured,
    isActive: guide.isActive,
    featuredTrailId: guide.featuredTrailId,
    featuredTrail: guide.featuredTrail
      ? {
          id: (guide.featuredTrail as FeaturedTrail).id,
          name: (guide.featuredTrail as FeaturedTrail).name,
          difficulty: (guide.featuredTrail as FeaturedTrail).difficulty,
        }
      : null,
    trails: guide.trails.map((assignment: TrailAssignment) => ({
      id: assignment.trail.id,
      name: assignment.trail.name,
      difficulty: assignment.trail.difficulty,
    })),
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
  }
}
