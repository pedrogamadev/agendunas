import { apiRequest } from './client'

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
  statusTone: { label: string; tone: string }
}

export type ParticipantRow = {
  id: string
  name: string
  contact: string
  trailName: string
  datetimeLabel: string
  statusTone: { label: string; tone: string }
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

export type AdminOverview = {
  metrics: Metric[]
  bookings: BookingRow[]
  participants: ParticipantRow[]
  todaysSessions: SessionSummary[]
  upcomingEvents: EventCard[]
  recentActivity: ActivityItem[]
  eventCards: EventCard[]
  trailCards: Array<{
    id: string
    name: string
    difficulty: string
    durationMinutes: number
    capacityLabel: string
    status: string
    description: string
    lastSessionLabel: string | null
  }>
  calendar: CalendarOverview
  report: ReportData
}

export function fetchAdminOverview() {
  return apiRequest<AdminOverview>('/admin/overview')
}

export function fetchAdminBookings(limit?: number) {
  const query = typeof limit === 'number' ? `?limit=${limit}` : ''
  return apiRequest<BookingRow[]>(`/admin/bookings${query}`)
}

export function fetchAdminParticipants(limit?: number) {
  const query = typeof limit === 'number' ? `?limit=${limit}` : ''
  return apiRequest<ParticipantRow[]>(`/admin/participants${query}`)
}

export function fetchAdminEvents() {
  return apiRequest<{ cards: EventCard[]; upcoming: EventCard[] }>('/admin/events')
}

export function fetchAdminTrails() {
  return apiRequest<AdminOverview['trailCards']>('/admin/trails')
}

export function fetchAdminCalendar() {
  return apiRequest<CalendarOverview>('/admin/calendar')
}

export function fetchAdminReports() {
  return apiRequest<ReportData>('/admin/reports')
}
