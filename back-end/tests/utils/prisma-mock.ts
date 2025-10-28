import { randomUUID } from 'node:crypto'
import type { TrailDifficulty, TrailSessionStatus, TrailStatus } from '@prisma/client'

type TrailData = {
  id: string
  slug: string
  name: string
  description: string
  summary: string | null
  durationMinutes: number
  difficulty: TrailDifficulty | string
  maxGroupSize: number
  badgeLabel: string | null
  imageUrl: string | null
  meetingPoint: string | null
  highlight: boolean
  status: TrailStatus | string
  createdAt: Date
  updatedAt: Date
}

type GuideData = {
  cpf: string
  slug: string
  name: string
  speciality: string | null
  photoUrl: string | null
  contactPhone: string | null
  isActive: boolean
  isFeatured: boolean
}

type TrailGuideAssignment = {
  trailId: string
  guideCpf: string
  assigned: Date
}

type TrailSessionData = {
  id: string
  trailId: string
  primaryGuideCpf: string | null
  contactPhone: string | null
  startsAt: Date
  endsAt: Date | null
  capacity: number
  meetingPoint: string | null
  notes: string | null
  status: TrailSessionStatus | string
  createdAt: Date
  updatedAt: Date
}

type BookingRecord = {
  id: string
  protocol: string
  trailId: string
  sessionId: string | null
  guideCpf: string | null
  status: string
  scheduledFor: Date
  participantsCount: number
  contactName: string
  contactEmail: string
  contactPhone: string
  notes: string | null
  source: string
}

type BookingParticipant = {
  fullName: string
  cpf: string | null
  email: string | null
  phone: string | null
}

type BookingCreateInput = {
  data: {
    protocol: string
    trailId: string
    sessionId: string | null
    guideCpf: string | null
    status: string
    scheduledFor: Date
    participantsCount: number
    contactName: string
    contactEmail: string
    contactPhone: string
    notes?: string | null
    source: string
    participants?: {
      create: BookingParticipant[]
    }
  }
  include?: {
    trail?: { select: Record<string, boolean> }
    guide?: { select: Record<string, boolean> }
  }
}

type BookingFindUniqueArgs = {
  where: { protocol: string }
  select?: Record<string, boolean>
}

type GuideFindFirstArgs = {
  where?: {
    cpf?: string
    isActive?: boolean
    trails?: { some?: { trailId?: string } }
  }
  select?: Record<string, boolean>
}

type TrailFindUniqueArgs = {
  where: { id: string }
  select?: Record<string, boolean>
}

type TrailFindManyArgs = {
  where?: { status?: string }
  include?: {
    sessions?: {
      where?: { startsAt?: { gte?: Date } }
      orderBy?: { startsAt?: 'asc' | 'desc' }
      include?: {
        bookings?: { select: Record<string, boolean> }
        primaryGuide?: { select: Record<string, boolean> }
      }
    }
    guides?: {
      include?: {
        guide?: { select: Record<string, boolean> }
      }
    }
  }
  orderBy?: { name?: 'asc' | 'desc' }
}

type TrailSessionFindUniqueArgs = {
  where: { id: string }
  include?: {
    bookings?: { select: Record<string, boolean> }
  }
}

type GuideFindManyArgs = {
  orderBy?: { name?: 'asc' }
  select?: Record<string, boolean>
}

type ActivityLogCreateArgs = {
  data: { bookingId: string; message: string }
}

function applySelect<T extends Record<string, unknown>>(record: T, select?: Record<string, boolean>): Partial<T> {
  if (!select) {
    return { ...record }
  }

  const picked: Partial<T> = {}
  for (const key of Object.keys(select)) {
    if (select[key]) {
      picked[key as keyof T] = record[key as keyof T]
    }
  }
  return picked
}

function sortByName<T extends { name: string }>(records: T[], direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...records].sort((a, b) => {
    return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  })
}

class PrismaMock {
  public trails = new Map<string, TrailData>()

  public guides = new Map<string, GuideData>()

  public trailAssignments: TrailGuideAssignment[] = []

  public sessions = new Map<string, TrailSessionData>()

  public bookings = new Map<string, BookingRecord>()

  public bookingParticipants = new Map<string, BookingParticipant[]>()

  public activityLogs: ActivityLogCreateArgs['data'][] = []

  public queryLog: string[] = []

  trail = {
    findUnique: async (args: TrailFindUniqueArgs) => {
      const trail = this.trails.get(args.where.id)
      if (!trail) {
        return null
      }
      return applySelect(trail, args.select)
    },
    findMany: async (args?: TrailFindManyArgs) => {
      const { where, include, orderBy } = args ?? {}
      let records = Array.from(this.trails.values())

      if (where?.status) {
        records = records.filter((trail) => trail.status === where.status)
      }

      if (orderBy?.name) {
        records = sortByName(records, orderBy.name)
      } else {
        records = sortByName(records)
      }

      return records.map((trail) => {
        const result: any = { ...trail }

        if (include?.sessions) {
          const sessionArgs = include.sessions
          const minStart = sessionArgs.where?.startsAt?.gte
          let sessions = Array.from(this.sessions.values()).filter((session) => session.trailId === trail.id)

          if (minStart) {
            sessions = sessions.filter((session) => session.startsAt >= minStart)
          }

          const order = sessionArgs.orderBy?.startsAt ?? 'asc'
          sessions = [...sessions].sort((a, b) => {
            return order === 'asc'
              ? a.startsAt.getTime() - b.startsAt.getTime()
              : b.startsAt.getTime() - a.startsAt.getTime()
          })

          result.sessions = sessions.map((session) => {
            const built: any = { ...session }

            if (sessionArgs.include?.bookings) {
              built.bookings = this.getSessionBookings(session.id).map((booking) =>
                applySelect(
                  {
                    participantsCount: booking.participantsCount,
                    status: booking.status,
                  },
                  sessionArgs.include?.bookings?.select,
                ),
              )
            } else {
              built.bookings = this.getSessionBookings(session.id)
            }

            if (sessionArgs.include?.primaryGuide) {
              const guide = session.primaryGuideCpf ? this.guides.get(session.primaryGuideCpf) : null
              built.primaryGuide = guide ? applySelect(guide, sessionArgs.include.primaryGuide.select) : null
            } else {
              built.primaryGuide = null
            }

            return built
          })
        } else {
          result.sessions = []
        }

        if (include?.guides) {
          result.guides = this.trailAssignments
            .filter((assignment) => assignment.trailId === trail.id)
            .map((assignment) => ({
              assigned: assignment.assigned,
              guide: this.guides.get(assignment.guideCpf)
                ? applySelect(this.guides.get(assignment.guideCpf)!, include.guides?.include?.guide?.select)
                : null,
            }))
        } else {
          result.guides = []
        }

        return result
      })
    },
  }

  guide = {
    findFirst: async (args?: GuideFindFirstArgs) => {
      const { where, select } = args ?? {}
      const guides = Array.from(this.guides.values())

      const found = guides.find((guide) => {
        if (where?.cpf && guide.cpf !== where.cpf) {
          return false
        }
        if (where?.isActive !== undefined && guide.isActive !== where.isActive) {
          return false
        }
        if (where?.trails?.some?.trailId) {
          const assigned = this.trailAssignments.some(
            (assignment) => assignment.trailId === where.trails!.some!.trailId && assignment.guideCpf === guide.cpf,
          )
          if (!assigned) {
            return false
          }
        }
        return true
      })

      return found ? applySelect(found, select) : null
    },
    findMany: async (args?: GuideFindManyArgs) => {
      const { orderBy, select } = args ?? {}
      let guides = Array.from(this.guides.values())
      if (orderBy?.name === 'asc') {
        guides = sortByName(guides, 'asc')
      }
      return guides.map((guide) => applySelect(guide, select))
    },
  }

  trailSession = {
    findUnique: async (args: TrailSessionFindUniqueArgs) => {
      const session = this.sessions.get(args.where.id)
      if (!session) {
        return null
      }

      const result: any = { ...session }
      if (args.include?.bookings) {
        result.bookings = this.getSessionBookings(session.id).map((booking) =>
          applySelect(
            {
              participantsCount: booking.participantsCount,
              status: booking.status,
            },
            args.include?.bookings?.select,
          ),
        )
      }
      return result
    },
  }

  booking = {
    findUnique: async (args: BookingFindUniqueArgs) => {
      const booking = Array.from(this.bookings.values()).find((candidate) => candidate.protocol === args.where.protocol)
      if (!booking) {
        return null
      }
      return applySelect(booking, args.select)
    },
    create: async (args: BookingCreateInput) => {
      const id = randomUUID()
      const record: BookingRecord = {
        id,
        protocol: args.data.protocol,
        trailId: args.data.trailId,
        sessionId: args.data.sessionId,
        guideCpf: args.data.guideCpf,
        status: args.data.status,
        scheduledFor: args.data.scheduledFor,
        participantsCount: args.data.participantsCount,
        contactName: args.data.contactName,
        contactEmail: args.data.contactEmail,
        contactPhone: args.data.contactPhone,
        notes: args.data.notes ?? null,
        source: args.data.source,
      }

      this.bookings.set(id, record)
      if (args.data.participants) {
        this.bookingParticipants.set(id, args.data.participants.create)
      }

      const response: any = { ...record }

      if (args.include?.trail) {
        const trail = this.trails.get(record.trailId)
        response.trail = trail ? applySelect(trail, args.include.trail.select) : null
      }

      if (args.include?.guide) {
        const guide = record.guideCpf ? this.guides.get(record.guideCpf) : null
        response.guide = guide ? applySelect(guide, args.include.guide.select) : null
      }

      return response
    },
  }

  activityLog = {
    create: async (args: ActivityLogCreateArgs) => {
      this.activityLogs.push(args.data)
      return args.data
    },
  }

  async $transaction<T>(callback: (client: this) => Promise<T>): Promise<T> {
    return callback(this)
  }

  async $queryRaw<T = unknown>(queryParts: TemplateStringsArray | string, ...values: unknown[]): Promise<T> {
    const query = Array.isArray(queryParts)
      ? queryParts.reduce((acc, part, index) => acc + part + (index < values.length ? String(values[index]) : ''), '')
      : String(queryParts)

    this.queryLog.push(query)

    if (query.includes('"sessoes_trilhas"')) {
      const sessionId = String(values[0])
      if (this.sessions.has(sessionId)) {
        return [{ id: sessionId }] as T
      }
      return [] as T
    }

    return [] as T
  }

  reset(): void {
    this.trails.clear()
    this.guides.clear()
    this.trailAssignments = []
    this.sessions.clear()
    this.bookings.clear()
    this.bookingParticipants.clear()
    this.activityLogs = []
    this.queryLog = []
  }

  private getSessionBookings(sessionId: string): BookingRecord[] {
    return Array.from(this.bookings.values()).filter((booking) => booking.sessionId === sessionId)
  }

  addTrail(trail: TrailData): void {
    this.trails.set(trail.id, trail)
  }

  addGuide(guide: GuideData): void {
    this.guides.set(guide.cpf, guide)
  }

  assignGuideToTrail(assignment: TrailGuideAssignment): void {
    this.trailAssignments.push(assignment)
  }

  addSession(session: TrailSessionData): void {
    this.sessions.set(session.id, session)
  }

  addBooking(booking: BookingRecord): void {
    this.bookings.set(booking.id, booking)
  }
}

export const prismaMock = new PrismaMock()

export type { TrailData, GuideData, TrailSessionData, BookingRecord }
