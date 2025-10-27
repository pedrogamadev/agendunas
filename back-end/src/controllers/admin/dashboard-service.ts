import prisma from '../../lib/prisma.js'
import {
  calculateOccupancy,
  createStatusTone,
  formatDate,
  formatDateTimeLabel,
  formatMonthLabel,
  formatTime,
  toISODate,
} from './formatters.js'
import { normalizeTrail, trailInclude, trailSessionsInclude } from './trail-service.js'
import type {
  ActivityItem,
  AdminOverview,
  BookingRow,
  CalendarOverview,
  EventCard,
  ParticipantRow,
  ReportData,
  SessionSummary,
  TrailCard,
} from './types.js'

export async function fetchBookingsTable(limit = 12): Promise<BookingRow[]> {
  const bookings = await prisma.booking.findMany({
    orderBy: { scheduledFor: 'asc' },
    take: limit,
    include: {
      trail: { select: { name: true } },
      guide: { select: { name: true } },
    },
  })

  type BookingRecord = (typeof bookings)[number]

  return bookings.map((booking: BookingRecord): BookingRow => ({
    id: booking.id,
    protocol: booking.protocol,
    contactName: booking.contactName,
    trailName: booking.trail.name,
    dateLabel: formatDate(booking.scheduledFor),
    timeLabel: formatTime(booking.scheduledFor),
    participantsCount: booking.participantsCount,
    guideName: booking.guide?.name ?? null,
    status: booking.status,
    statusTone: createStatusTone(booking.status),
  }))
}

export async function fetchParticipantsTable(limit = 12): Promise<ParticipantRow[]> {
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      booking: {
        include: {
          trail: { select: { name: true } },
        },
      },
    },
  })

  type ParticipantRecord = (typeof participants)[number]

  return participants.map((participant: ParticipantRecord): ParticipantRow => ({
    id: participant.id,
    name: participant.fullName,
    contact: participant.phone ?? participant.email ?? participant.booking.contactName,
    trailName: participant.booking.trail.name,
    datetimeLabel: formatDateTimeLabel(participant.booking.scheduledFor),
    statusTone: participant.isBanned
      ? { label: 'Banido', tone: 'danger' }
      : createStatusTone(participant.booking.status),
    isBanned: participant.isBanned,
  }))
}

export async function fetchTodaysSessions(): Promise<SessionSummary[]> {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const sessions = await prisma.trailSession.findMany({
    where: {
      startsAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startsAt: 'asc' },
    include: {
      trail: {
        select: {
          id: true,
          name: true,
          maxGroupSize: true,
        },
      },
      primaryGuide: { select: { id: true, name: true } },
      bookings: { select: { participantsCount: true } },
    },
  })

  type SessionRecord = (typeof sessions)[number]

  return sessions.map((session: SessionRecord): SessionSummary => {
    let occupied = 0
    for (const booking of session.bookings) {
      occupied += booking.participantsCount
    }

    return {
      id: session.id,
      trailName: session.trail.name,
      scheduleLabel: `${formatTime(session.startsAt)} • Guia: ${session.primaryGuide?.name ?? 'A definir'}`,
      occupancy: calculateOccupancy(occupied, session.capacity),
      capacityLabel: `${occupied} / ${session.capacity} vagas`,
    }
  })
}

export async function fetchUpcomingEvents(limit = 4): Promise<EventCard[]> {
  const now = new Date()
  const events = await prisma.event.findMany({
    where: { startsAt: { gte: now } },
    orderBy: { startsAt: 'asc' },
    take: limit,
  })

  type EventRecord = (typeof events)[number]

  return events.map((event: EventRecord): EventCard => ({
    id: event.id,
    title: event.title,
    description: event.description,
    dateLabel: `${formatDate(event.startsAt)} • ${formatTime(event.startsAt)}`,
    status: event.status,
    statusTone: event.status === 'PUBLISHED' ? 'success' : event.status === 'DRAFT' ? 'warning' : 'info',
    capacityLabel: event.capacity ? `${event.capacity} vagas` : null,
  }))
}

export async function fetchRecentActivities(limit = 6): Promise<ActivityItem[]> {
  const activities = await prisma.activityLog.findMany({
    orderBy: { loggedAt: 'desc' },
    take: limit,
  })

  type ActivityRecord = (typeof activities)[number]

  return activities.map((activity: ActivityRecord): ActivityItem => ({
    id: activity.id,
    label: formatDateTimeLabel(activity.loggedAt),
    message: activity.message,
  }))
}

export async function fetchEventCards(limit = 6): Promise<EventCard[]> {
  const events = await prisma.event.findMany({
    orderBy: [
      { highlight: 'desc' },
      { startsAt: 'asc' },
    ],
    take: limit,
  })

  type EventRecord = (typeof events)[number]

  return events.map((event: EventRecord): EventCard => ({
    id: event.id,
    title: event.title,
    description: event.description,
    tag: event.status === 'PUBLISHED' ? 'Publicado' : event.status === 'DRAFT' ? 'Rascunho' : 'Atualização',
    tagTone:
      event.status === 'PUBLISHED'
        ? 'success'
        : event.status === 'DRAFT'
        ? 'warning'
        : event.status === 'CANCELLED'
        ? 'danger'
        : 'info',
    dateLabel: `${formatDate(event.startsAt)} • ${formatTime(event.startsAt)}`,
    capacityLabel: event.capacity ? `${event.capacity} vagas` : undefined,
  }))
}

export async function fetchTrailCards(limit = 6): Promise<TrailCard[]> {
  const trails = await prisma.trail.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ highlight: 'desc' }, { name: 'asc' }],
    take: limit,
    include: {
      ...trailInclude,
      sessions: {
        ...trailSessionsInclude,
        take: 1,
      },
    },
  })

  const statusLabels = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Indisponível',
    MAINTENANCE: 'Em manutenção',
  } as const

  return trails.map((trail) => {
    const normalized = normalizeTrail(trail)

    return {
      id: normalized.id,
      name: normalized.name,
      difficulty: normalized.difficulty,
      durationMinutes: normalized.durationMinutes,
      capacityLabel: `${normalized.maxGroupSize} pessoas`,
      status: statusLabels[normalized.status] ?? 'Indisponível',
      description: normalized.summary ?? normalized.description.slice(0, 160),
      lastSessionLabel: normalized.lastSessionStartsAt
        ? formatDate(new Date(normalized.lastSessionStartsAt))
        : null,
    }
  })
}

export async function fetchCalendarOverview(): Promise<CalendarOverview> {
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))

  const sessions = await prisma.trailSession.findMany({
    where: {
      startsAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      trail: { select: { name: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  type SessionRecord = (typeof sessions)[number]

  const daysMap = new Map<string, string[]>()

  sessions.forEach((session: SessionRecord) => {
    const key = toISODate(session.startsAt)
    if (!daysMap.has(key)) {
      daysMap.set(key, [])
    }

    const eventsForDay = daysMap.get(key)
    if (eventsForDay) {
      eventsForDay.push(`${formatTime(session.startsAt)} • ${session.trail.name}`)
    }
  })

  const days: CalendarOverview['days'] = []
  for (let day = 1; day <= endOfMonth.getUTCDate(); day += 1) {
    const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day))
    const iso = toISODate(current)
    days.push({
      date: iso,
      label: String(day),
      events: daysMap.get(iso) ?? [],
    })
  }

  return {
    month: formatMonthLabel(now),
    year: now.getUTCFullYear(),
    days,
  }
}

export async function fetchReportData(): Promise<ReportData> {
  const [totalBookings, groupedStatuses, publishedEvents, bookingsForMonths, bookingsByTrail] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.booking.findMany({
      where: {
        scheduledFor: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
        },
      },
      select: {
        scheduledFor: true,
        status: true,
      },
    }),
    prisma.booking.groupBy({
      by: ['trailId'],
      _sum: { participantsCount: true },
      _count: { _all: true },
    }),
  ])

  type GroupedStatus = (typeof groupedStatuses)[number]
  type BookingForMonth = (typeof bookingsForMonths)[number]
  type BookingByTrail = (typeof bookingsByTrail)[number]

  const statusCount = Object.fromEntries(
    groupedStatuses.map((item: GroupedStatus) => [item.status, item._count._all]),
  ) as Record<string, number>
  const confirmed = statusCount.CONFIRMED ?? 0
  const cancelled = statusCount.CANCELLED ?? 0
  const pending = statusCount.PENDING ?? 0
  const total = totalBookings || confirmed + cancelled + pending

  const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0

  const monthlyAccumulator = new Map<string, number>()
  const chartStart = new Date()
  chartStart.setMonth(chartStart.getMonth() - 5)
  chartStart.setDate(1)
  chartStart.setHours(0, 0, 0, 0)

  bookingsForMonths.forEach((booking: BookingForMonth) => {
    if (booking.scheduledFor < chartStart) {
      return
    }
    const key = `${booking.scheduledFor.getFullYear()}-${String(booking.scheduledFor.getMonth() + 1).padStart(2, '0')}`
    monthlyAccumulator.set(key, (monthlyAccumulator.get(key) ?? 0) + 1)
  })

  const lineChartData: ReportData['lineChartData'] = []
  const reference = new Date(chartStart)
  for (let i = 0; i < 6; i += 1) {
    const key = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`
    lineChartData.push({
      label: formatMonthLabel(reference),
      value: monthlyAccumulator.get(key) ?? 0,
    })
    reference.setMonth(reference.getMonth() + 1)
  }

  const pieChartData: ReportData['pieChartData'] = [
    { label: 'Confirmados', value: confirmed, tone: '#1aa361' },
    { label: 'Pendentes', value: pending, tone: '#f2c94c' },
    { label: 'Cancelados', value: cancelled, tone: '#eb5757' },
    {
      label: 'Outros',
      value: Math.max(total - confirmed - pending - cancelled, 0),
      tone: '#2d9cdb',
    },
  ]

  const trailIds = bookingsByTrail.map((item: BookingByTrail) => item.trailId)
  const trails = await prisma.trail.findMany({
    where: { id: { in: trailIds } },
    select: { id: true, name: true },
  })
  type TrailRecord = (typeof trails)[number]

  const trailNameMap = Object.fromEntries(trails.map((trail: TrailRecord) => [trail.id, trail.name])) as Record<
    string,
    string
  >

  const barChartData = bookingsByTrail
    .map((item: BookingByTrail): { label: string; value: number } => ({
      label: trailNameMap[item.trailId] ?? 'Trilha',
      value: item._sum.participantsCount ?? 0,
    }))
    .sort((a: { label: string; value: number }, b: { label: string; value: number }) => b.value - a.value)
    .slice(0, 6)

  const reportMetrics: ReportData['reportMetrics'] = [
    {
      title: 'Total de Agendamentos',
      value: String(totalBookings),
      helper: 'Últimos 6 meses consolidados',
      trend: { value: '+15%', direction: 'up', label: 'tendência' },
    },
    {
      title: 'Taxa de Confirmação',
      value: `${confirmationRate}%`,
      helper: 'Reservas confirmadas vs. total',
      trend: { value: '+5 pts', direction: 'up', label: 'comparado ao mês anterior' },
    },
    {
      title: 'Taxa de Cancelamento',
      value: `${cancellationRate}%`,
      helper: 'Cancelamentos reportados no período',
      trend: { value: '-2 pts', direction: 'down', label: 'meta interna' },
    },
    {
      title: 'Eventos Publicados',
      value: String(publishedEvents),
      helper: 'Eventos com inscrições abertas',
      trend: { value: '+12%', direction: 'up', label: 'evolução' },
    },
  ]

  return {
    reportMetrics,
    lineChartData,
    pieChartData,
    barChartData,
  }
}

export async function buildOverviewPayload(): Promise<AdminOverview> {
  const [
    bookings,
    participants,
    todaysSessions,
    upcomingEvents,
    recentActivity,
    eventCards,
    trailCards,
    calendar,
    report,
  ] = await Promise.all([
    fetchBookingsTable(8),
    fetchParticipantsTable(8),
    fetchTodaysSessions(),
    fetchUpcomingEvents(4),
    fetchRecentActivities(6),
    fetchEventCards(6),
    fetchTrailCards(6),
    fetchCalendarOverview(),
    fetchReportData(),
  ])

  const totalsByStatus = bookings.reduce<Record<string, number>>((acc, booking) => {
    acc.total = (acc.total ?? 0) + 1
    acc[booking.status] = (acc[booking.status] ?? 0) + 1
    return acc
  }, { total: 0 })

  const metrics: AdminOverview['metrics'] = [
    {
      title: 'Agendamentos Hoje',
      value: String(todaysSessions.reduce((sum, session) => sum + session.occupancy, 0)),
      helper: 'Índice médio de ocupação nas sessões do dia',
      trend: { value: '+12%', direction: 'up', label: 'vs. ontem' },
    },
    {
      title: 'Confirmados',
      value: String(totalsByStatus.CONFIRMED ?? 0),
      helper: 'Reservas confirmadas na agenda ativa',
      trend: { value: '+5%', direction: 'up', label: 'últimos 7 dias' },
    },
    {
      title: 'Pendentes',
      value: String(totalsByStatus.PENDING ?? 0),
      helper: 'Aguardando confirmação do visitante',
      trend: { value: '-3%', direction: 'down', label: 'na semana' },
    },
    {
      title: 'Cancelados',
      value: String(totalsByStatus.CANCELLED ?? 0),
      helper: 'Cancelamentos registrados nas últimas 24h',
      trend: { value: '-2%', direction: 'down', label: 'vs. mês anterior' },
    },
  ]

  return {
    metrics,
    bookings,
    participants,
    todaysSessions,
    upcomingEvents,
    recentActivity,
    eventCards,
    trailCards,
    calendar,
    report,
  }
}
