import type { TrailDifficulty, TrailSessionStatus, TrailStatus } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import type { AdminTrail, AdminTrailGuideAssignment, AdminTrailSession } from './types.js'

export const trailGuideInclude = {
  include: {
    guide: {
      select: {
        id: true,
        slug: true,
        name: true,
        speciality: true,
        photoUrl: true,
        isActive: true,
        isFeatured: true,
      },
    },
  },
} as const

export const trailSessionsInclude = {
  orderBy: { startsAt: 'desc' as const },
  include: {
    primaryGuide: { select: { id: true, name: true } },
  },
} as const

export const trailInclude = {
  guides: trailGuideInclude,
  sessions: {
    ...trailSessionsInclude,
    take: 12,
  },
} as const

type TrailRecord = Awaited<ReturnType<typeof prisma.trail.findMany>>[number]

type TrailGuideRecord = TrailRecord['guides'][number]

type TrailSessionRecord = TrailRecord['sessions'][number]

type PrimaryGuide = NonNullable<TrailSessionRecord['primaryGuide']>

export function normalizeTrail(trail: TrailRecord): AdminTrail {
  const now = Date.now()
  let lastSessionStartsAt: string | null = null
  let lastSessionTime: number | null = null
  let nextSessionStartsAt: string | null = null
  let nextSessionTime: number | null = null
  let upcomingSessions = 0

  const sessions: AdminTrailSession[] = trail.sessions.map((session: TrailSessionRecord) => {
    const startsAtISO = session.startsAt.toISOString()
    const endsAtISO = session.endsAt ? session.endsAt.toISOString() : null

    const startsAtTime = session.startsAt.getTime()
    if (lastSessionTime === null || startsAtTime > lastSessionTime) {
      lastSessionTime = startsAtTime
      lastSessionStartsAt = startsAtISO
    }

    if (session.status === 'SCHEDULED' && startsAtTime >= now) {
      upcomingSessions += 1
      if (nextSessionTime === null || startsAtTime < nextSessionTime) {
        nextSessionTime = startsAtTime
        nextSessionStartsAt = startsAtISO
      }
    }

    return {
      id: session.id,
      startsAt: startsAtISO,
      endsAt: endsAtISO,
      capacity: session.capacity,
      meetingPoint: session.meetingPoint ?? null,
      status: session.status as TrailSessionStatus,
      primaryGuide: session.primaryGuide
        ? { id: (session.primaryGuide as PrimaryGuide).id, name: (session.primaryGuide as PrimaryGuide).name }
        : null,
    }
  })

  const guides: AdminTrailGuideAssignment[] = trail.guides
    .map((assignment: TrailGuideRecord) => ({
      id: assignment.guide.id,
      slug: assignment.guide.slug,
      name: assignment.guide.name,
      speciality: assignment.guide.speciality ?? null,
      photoUrl: assignment.guide.photoUrl ?? null,
      isActive: assignment.guide.isActive,
      isFeatured: assignment.guide.isFeatured,
      assignedAt: assignment.assigned.toISOString(),
    }))
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) {
        return -1
      }
      if (!a.isFeatured && b.isFeatured) {
        return 1
      }
      if (a.isActive && !b.isActive) {
        return -1
      }
      if (!a.isActive && b.isActive) {
        return 1
      }
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    })

  return {
    id: trail.id,
    slug: trail.slug,
    name: trail.name,
    description: trail.description,
    summary: trail.summary ?? null,
    durationMinutes: trail.durationMinutes,
    difficulty: trail.difficulty as TrailDifficulty,
    maxGroupSize: trail.maxGroupSize,
    badgeLabel: trail.badgeLabel ?? null,
    imageUrl: trail.imageUrl ?? null,
    status: trail.status as TrailStatus,
    basePrice: trail.basePrice ? Number(trail.basePrice) : null,
    highlight: trail.highlight,
    meetingPoint: trail.meetingPoint ?? null,
    guides,
    sessions,
    upcomingSessions,
    nextSessionStartsAt,
    lastSessionStartsAt,
    createdAt: trail.createdAt.toISOString(),
    updatedAt: trail.updatedAt.toISOString(),
  }
}
