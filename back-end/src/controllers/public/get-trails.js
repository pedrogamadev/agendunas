import prisma from '../../lib/prisma.js'
import { calculateOccupancy, formatDateTimeLabel } from '../admin/formatters.js'

export async function getTrails(request, response, next) {
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

    const normalized = trails.map((trail) => {
      const upcomingSession = trail.sessions[0]
      const occupancy = upcomingSession
        ? upcomingSession.bookings.reduce((sum, booking) => sum + booking.participantsCount, 0)
        : 0

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
        guides: trail.guides.map((assignment) => ({
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
