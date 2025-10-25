import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { calculateOccupancy, formatDateTimeLabel } from '../admin/formatters.js'

type GuideSummary = {
  id: string
  name: string
  speciality: string | null
  photoUrl: string | null
}

type TrailSessionSummary = {
  id: string
  startsAt: Date
  endsAt: Date
  capacity: number
  primaryGuide: { id: string; name: string } | null
  label: string
  occupancyPercentage: number
}

type PublicTrail = {
  id: string
  slug: string
  name: string
  description: string
  summary: string | null
  durationMinutes: number
  difficulty: string
  maxGroupSize: number
  badgeLabel: string | null
  imageUrl: string | null
  meetingPoint: string | null
  highlight: boolean
  upcomingSession: TrailSessionSummary | null
  guides: GuideSummary[]
}

export async function getTrails(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date()
    const trails = await prisma.trail.findMany({
      where: { status: 'ACTIVE' },
      include: {
        sessions: {
          where: { startsAt: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) } },
          orderBy: { startsAt: 'asc' },
          take: 3,
          include: {
            bookings: {
              select: {
                participantsCount: true,
              },
            },
            primaryGuide: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        guides: {
          include: {
            guide: {
              select: {
                id: true,
                name: true,
                speciality: true,
                photoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    type TrailRecord = (typeof trails)[number]

    const normalized: PublicTrail[] = trails.map((trail: TrailRecord) => {
      type GuideAssignment = (typeof trail.guides)[number]

      const upcomingSession = trail.sessions[0]
      let occupancy = 0

      if (upcomingSession) {
        for (const booking of upcomingSession.bookings) {
          occupancy += booking.participantsCount
        }
      }

      return {
        id: trail.id,
        slug: trail.slug,
        name: trail.name,
        description: trail.description,
        summary: trail.summary,
        durationMinutes: trail.durationMinutes,
        difficulty: trail.difficulty,
        maxGroupSize: trail.maxGroupSize,
        badgeLabel: trail.badgeLabel,
        imageUrl: trail.imageUrl,
        meetingPoint: trail.meetingPoint,
        highlight: trail.highlight,
        upcomingSession: upcomingSession
          ? {
              id: upcomingSession.id,
              startsAt: upcomingSession.startsAt,
              endsAt: upcomingSession.endsAt,
              capacity: upcomingSession.capacity,
              primaryGuide: upcomingSession.primaryGuide
                ? {
                    id: upcomingSession.primaryGuide.id,
                    name: upcomingSession.primaryGuide.name,
                  }
                : null,
              label: formatDateTimeLabel(upcomingSession.startsAt),
              occupancyPercentage: calculateOccupancy(occupancy, upcomingSession.capacity),
            }
          : null,
        guides: trail.guides.map((assignment: GuideAssignment) => ({
          id: assignment.guide.id,
          name: assignment.guide.name,
          speciality: assignment.guide.speciality,
          photoUrl: assignment.guide.photoUrl,
        })),
      }
    })

    response.json({ data: normalized })
  } catch (error) {
    next(error)
  }
}
