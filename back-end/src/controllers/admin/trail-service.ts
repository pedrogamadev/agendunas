import type { BookingStatus, TrailDifficulty, TrailSessionStatus, TrailStatus } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import { calculateOccupancy, createStatusTone, formatDateTimeLabel } from './formatters.js'
import type {
  AdminTrail,
  AdminTrailGuideAssignment,
  AdminTrailSession,
  AdminTrailSessionBooking,
  AdminTrailSessionParticipant,
} from './types.js'

export const trailGuideInclude = {
  include: {
    guide: {
        select: {
          cpf: true,
          slug: true,
          name: true,
          contactPhone: true,
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
    primaryGuide: { select: { cpf: true, name: true } },
    bookings: {
      orderBy: { scheduledFor: 'asc' },
      include: {
        participants: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isBanned: true,
            createdAt: true,
          },
        },
      },
    },
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

type TrailSessionBookingRecord = NonNullable<TrailSessionRecord['bookings']>[number]

type TrailSessionParticipantRecord =
  NonNullable<TrailSessionBookingRecord['participants']>[number]

export const activeBookingStatuses: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'RESCHEDULED',
]

function normalizeSessionParticipant(
  participant: TrailSessionParticipantRecord,
  booking: TrailSessionBookingRecord,
): AdminTrailSessionParticipant {
  return {
    id: participant.id,
    fullName: participant.fullName,
    email: participant.email ?? null,
    phone: participant.phone ?? null,
    isBanned: participant.isBanned,
    bookingId: booking.id,
    bookingProtocol: booking.protocol,
    bookingStatus: booking.status,
    bookingStatusTone: createStatusTone(booking.status),
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    scheduledFor: booking.scheduledFor.toISOString(),
    scheduledForLabel: formatDateTimeLabel(booking.scheduledFor),
    createdAt: participant.createdAt.toISOString(),
  }
}

function normalizeSessionBooking(
  booking: TrailSessionBookingRecord,
): AdminTrailSessionBooking {
  const participants = (booking.participants ?? []).map((participant) =>
    normalizeSessionParticipant(participant, booking),
  )

  return {
    id: booking.id,
    protocol: booking.protocol,
    status: booking.status,
    statusTone: createStatusTone(booking.status),
    scheduledFor: booking.scheduledFor.toISOString(),
    scheduledForLabel: formatDateTimeLabel(booking.scheduledFor),
    participantsCount: booking.participantsCount,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    participants,
  }
}

export function normalizeTrailSession(
  session: TrailSessionRecord,
  context?: { trailId: string; trailName: string },
): AdminTrailSession {
  const startsAtISO = session.startsAt.toISOString()
  const endsAtISO = session.endsAt ? session.endsAt.toISOString() : null

  const bookings = (session.bookings ?? []).map(normalizeSessionBooking)

  const totalParticipants = bookings.reduce((total, booking) => {
    if (activeBookingStatuses.includes(booking.status)) {
      return total + booking.participantsCount
    }
    return total
  }, 0)

  const availableSpots = Math.max(0, session.capacity - totalParticipants)
  const occupancyPercentage = calculateOccupancy(totalParticipants, session.capacity)

  return {
    id: session.id,
    trailId: context?.trailId ?? session.trailId,
    trailName: context?.trailName ?? null,
    startsAt: startsAtISO,
    endsAt: endsAtISO,
    capacity: session.capacity,
    meetingPoint: session.meetingPoint ?? null,
    notes: session.notes ?? null,
    status: session.status as TrailSessionStatus,
    primaryGuide: session.primaryGuide
      ? { cpf: (session.primaryGuide as PrimaryGuide).cpf, name: (session.primaryGuide as PrimaryGuide).name }
      : null,
    contactPhone: session.contactPhone ?? null,
    totalParticipants,
    availableSpots,
    occupancyPercentage,
    bookings,
    participants: bookings.flatMap((booking) => booking.participants),
  }
}

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

    return normalizeTrailSession(session, { trailId: trail.id, trailName: trail.name })
  })

  const guides: AdminTrailGuideAssignment[] = trail.guides
    .map((assignment: TrailGuideRecord) => ({
      cpf: assignment.guide.cpf,
      slug: assignment.guide.slug,
      name: assignment.guide.name,
      contactPhone: assignment.guide.contactPhone ?? null,
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
