import type { TrailDifficulty, TrailSessionStatus, TrailStatus } from '@prisma/client'

export type MetricTrend = {
  value: string
  direction: 'up' | 'down'
  label: string
}

export type Metric = {
  title: string
  value: string
  helper: string
  trend: MetricTrend
}

export type StatusTone = {
  label: string
  tone: string
}

export type BookingRow = {
  id: string
  protocol: string
  contactName: string
  trailName: string
  dateLabel: string
  timeLabel: string
  participantsCount: number
  guideName: string | null
  status: string
  statusTone: StatusTone
}

export type ParticipantRow = {
  id: string
  name: string
  contact: string
  trailName: string
  datetimeLabel: string
  statusTone: StatusTone
  isBanned: boolean
}

export type SessionSummary = {
  id: string
  trailName: string
  scheduleLabel: string
  occupancy: number
  capacityLabel: string
}

export type EventCard = {
  id: string
  title: string
  description: string
  dateLabel: string
  status?: string
  statusTone?: string
  tag?: string
  tagTone?: string
  capacityLabel?: string | null
}

export type ActivityItem = {
  id: string
  label: string
  message: string
}

export type CalendarDay = {
  date: string
  label: string
  events: string[]
}

export type CalendarOverview = {
  month: string
  year: number
  days: CalendarDay[]
}

export type ReportData = {
  reportMetrics: Metric[]
  lineChartData: { label: string; value: number }[]
  pieChartData: { label: string; value: number; tone: string }[]
  barChartData: { label: string; value: number }[]
}

export type TrailCard = {
  id: string
  name: string
  difficulty: string
  durationMinutes: number
  capacityLabel: string
  status: string
  description: string
  lastSessionLabel: string | null
}

export type GuideTrailSummary = {
  id: string
  name: string
  difficulty: string
}

export type AdminTrailGuideAssignment = {
  cpf: string
  slug: string
  name: string
  contactPhone: string | null
  speciality: string | null
  photoUrl: string | null
  isActive: boolean
  isFeatured: boolean
  assignedAt: string
}

export type AdminTrailGuideOption = {
  cpf: string
  slug: string
  name: string
  contactPhone: string | null
  speciality: string | null
  photoUrl: string | null
  isActive: boolean
  isFeatured: boolean
}

export type AdminTrailSessionParticipant = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  isBanned: boolean
  bookingId: string
  bookingProtocol: string
  bookingStatus: string
  bookingStatusTone: StatusTone
  contactName: string
  contactEmail: string
  contactPhone: string
  scheduledFor: string
  scheduledForLabel: string
  createdAt: string
}

export type AdminTrailSessionBooking = {
  id: string
  protocol: string
  status: string
  statusTone: StatusTone
  scheduledFor: string
  scheduledForLabel: string
  participantsCount: number
  contactName: string
  contactEmail: string
  contactPhone: string
  participants: AdminTrailSessionParticipant[]
}

export type AdminTrailSession = {
  id: string
  trailId: string
  trailName: string | null
  startsAt: string
  endsAt: string | null
  capacity: number
  meetingPoint: string | null
  notes: string | null
  status: TrailSessionStatus
  primaryGuide: { cpf: string; name: string } | null
  contactPhone: string | null
  totalParticipants: number
  availableSpots: number
  occupancyPercentage: number
  bookings: AdminTrailSessionBooking[]
  participants: AdminTrailSessionParticipant[]
}

export type AdminTrail = {
  id: string
  slug: string
  name: string
  description: string
  summary: string | null
  durationMinutes: number
  difficulty: TrailDifficulty
  maxGroupSize: number
  badgeLabel: string | null
  imageUrl: string | null
  status: TrailStatus
  basePrice: number | null
  highlight: boolean
  meetingPoint: string | null
  guides: AdminTrailGuideAssignment[]
  sessions: AdminTrailSession[]
  upcomingSessions: number
  nextSessionStartsAt: string | null
  lastSessionStartsAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminTrailStats = {
  total: number
  highlights: number
  averageCapacity: number
  upcomingSessions: number
  byStatus: Record<TrailStatus, number>
  byDifficulty: Record<TrailDifficulty, number>
}

export type AdminTrailListResponse = {
  trails: AdminTrail[]
  guides: AdminTrailGuideOption[]
  stats: AdminTrailStats
}

export type AdminGuide = {
  cpf: string
  slug: string
  name: string
  contactPhone: string | null
  speciality: string | null
  summary: string | null
  biography: string | null
  experienceYears: number
  toursCompleted: number
  rating: number
  languages: string[]
  certifications: string[]
  curiosities: string[]
  photoUrl: string | null
  isFeatured: boolean
  isActive: boolean
  featuredTrailId: string | null
  featuredTrail: GuideTrailSummary | null
  trails: GuideTrailSummary[]
  createdAt: string
  updatedAt: string
}

export type AdminOverview = {
  metrics: Metric[]
  bookings: BookingRow[]
  participants: ParticipantRow[]
  todaysSessions: SessionSummary[]
  upcomingEvents: EventCard[]
  recentActivity: ActivityItem[]
  eventCards: EventCard[]
  trailCards: TrailCard[]
  calendar: CalendarOverview
  report: ReportData
}
