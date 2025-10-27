import type { NextFunction, Request, Response } from 'express'
import prisma from '../../lib/prisma.js'
import { calculateOccupancy, formatDate, formatDateTimeLabel, formatTime } from '../admin/formatters.js'

type GuideSummary = {
  cpf: string
  name: string
  speciality: string | null
  photoUrl: string | null
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
  availableSpots: number
  badgeLabel: string | null
  imageUrl: string | null
  meetingPoint: string | null
  highlight: boolean
  upcomingSession: {
    id: string
    startsAt: string
    endsAt: string | null
    capacity: number
    label: string
    occupancyPercentage: number
    primaryGuide: { cpf: string; name: string } | null
  } | null
  sessions: Array<{
    date: string
    dateLabel: string
    slots: Array<{
      id: string
      startsAt: string
      endsAt: string | null
      timeLabel: string
      capacity: number
      availableSpots: number
      occupancyPercentage: number
      status: string
      primaryGuide: { cpf: string; name: string } | null
    }>
  }>
  guides: GuideSummary[]
}

export async function getTrails(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date()
    const trails = await prisma.trail.findMany({
      where: { status: 'ACTIVE' },
      include: {
        sessions: {
          where: { startsAt: { gte: now } },
          orderBy: { startsAt: 'asc' },
          include: {
            bookings: {
              select: {
                participantsCount: true,
                status: true,
              },
            },
            primaryGuide: {
              select: {
                cpf: true,
                name: true,
              },
            },
          },
        },
        guides: {
          include: {
            guide: {
              select: {
                cpf: true,
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

      const sessionGroups = new Map<
        string,
        {
          date: string
          dateLabel: string
          slots: PublicTrail['sessions'][number]['slots']
        }
      >()

      let upcomingSession: (typeof trail.sessions)[number] | null = null
      let upcomingAvailableSpots = trail.maxGroupSize

      for (const session of trail.sessions) {
        const sessionDate = session.startsAt.toISOString().slice(0, 10)
        const dateLabel = formatDate(session.startsAt)

        const totalParticipants = session.bookings.reduce((total, booking) => {
          return booking.status === 'CANCELLED' ? total : total + booking.participantsCount
        }, 0)

        const availableSpots = Math.max(0, session.capacity - totalParticipants)
        const occupancyPercentage = calculateOccupancy(totalParticipants, session.capacity)

        if (!upcomingSession) {
          upcomingSession = session
          upcomingAvailableSpots = availableSpots
        }

        const slot = {
          id: session.id,
          startsAt: session.startsAt.toISOString(),
          endsAt: session.endsAt ? session.endsAt.toISOString() : null,
          timeLabel: formatTime(session.startsAt),
          capacity: session.capacity,
          availableSpots,
          occupancyPercentage,
          status: session.status,
          primaryGuide: session.primaryGuide
            ? { cpf: session.primaryGuide.cpf, name: session.primaryGuide.name }
            : null,
        }

        if (!sessionGroups.has(sessionDate)) {
          sessionGroups.set(sessionDate, {
            date: sessionDate,
            dateLabel,
            slots: [slot],
          })
        } else {
          sessionGroups.get(sessionDate)!.slots.push(slot)
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
        availableSpots: upcomingAvailableSpots,
        badgeLabel: trail.badgeLabel,
        imageUrl: trail.imageUrl,
        meetingPoint: trail.meetingPoint,
        highlight: trail.highlight,
        upcomingSession: upcomingSession
          ? {
              id: upcomingSession.id,
              startsAt: upcomingSession.startsAt.toISOString(),
              endsAt: upcomingSession.endsAt ? upcomingSession.endsAt.toISOString() : null,
              capacity: upcomingSession.capacity,
              label: formatDateTimeLabel(upcomingSession.startsAt),
              occupancyPercentage: calculateOccupancy(
                upcomingSession.bookings.reduce((total, booking) => {
                  return booking.status === 'CANCELLED' ? total : total + booking.participantsCount
                }, 0),
                upcomingSession.capacity,
              ),
              primaryGuide: upcomingSession.primaryGuide
                ? {
                    cpf: upcomingSession.primaryGuide.cpf,
                    name: upcomingSession.primaryGuide.name,
                  }
                : null,
            }
          : null,
        sessions: Array.from(sessionGroups.values()).map((group) => ({
          ...group,
          slots: group.slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
        })),
        guides: trail.guides.map((assignment: GuideAssignment) => ({
          cpf: assignment.guide.cpf,
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
