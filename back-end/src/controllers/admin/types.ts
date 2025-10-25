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

export type AdminGuide = {
  id: string
  slug: string
  name: string
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
