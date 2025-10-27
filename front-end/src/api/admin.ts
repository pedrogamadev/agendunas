import { apiRequest } from './client'
import type { CreateBookingPayload, CreateBookingResponse } from './public'

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
  statusTone: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
}

export type ParticipantRow = {
  id: string
  name: string
  contact: string
  trailName: string
  datetimeLabel: string
  statusTone: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
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

export type AdminBookingDetail = {
  id: string
  protocol: string
  status: string
  statusTone: { label: string; tone: string }
  scheduledFor: string
  scheduledDateLabel: string
  scheduledTimeLabel: string
  scheduledForLabel: string
  participantsCount: number
  contactName: string
  contactEmail: string
  contactPhone: string
  notes?: string | null
  trail: { id: string; name: string }
  guide: { cpf: string; name: string } | null
  session: {
    id: string
    startsAt: string
    capacity: number
    meetingPoint: string | null
    status: string
    startsAtLabel: string
  } | null
  participants: Array<{
    id: string
    fullName: string
    cpf?: string | null
    email?: string | null
    phone?: string | null
    createdAt: string
    createdAtLabel: string
    isBanned: boolean
  }>
  createdAt: string
  createdAtLabel: string
  updatedAt: string
}

export function fetchAdminBooking(id: string) {
  return apiRequest<AdminBookingDetail>(`/admin/bookings/${id}`)
}

export type UpdateAdminBookingStatusPayload = {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'
}

export function updateAdminBookingStatus(id: string, payload: UpdateAdminBookingStatusPayload) {
  return apiRequest(`/admin/bookings/${id}/status`, { method: 'PATCH', body: payload })
}

export type CreateAdminBookingPayload = CreateBookingPayload & {
  source?: 'ADMIN'
}

export function createAdminBooking(payload: CreateAdminBookingPayload) {
  return apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: { ...payload, source: 'ADMIN' },
  })
}

export function fetchAdminBookings(limit?: number) {
  const query = typeof limit === 'number' ? `?limit=${limit}` : ''
  return apiRequest<BookingRow[]>(`/admin/bookings${query}`)
}

export function fetchAdminParticipants(limit?: number) {
  const query = typeof limit === 'number' ? `?limit=${limit}` : ''
  return apiRequest<ParticipantRow[]>(`/admin/participants${query}`)
}

export type AdminParticipantDetail = {
  id: string
  fullName: string
  cpf?: string | null
  email?: string | null
  phone?: string | null
  createdAt: string
  createdAtLabel: string
  isBanned: boolean
  booking: {
    id: string
    protocol: string
    status: string
    statusTone: { label: string; tone: string }
    scheduledFor: string
    scheduledForLabel: string
    participantsCount: number
    contactName: string
    contactEmail: string
    contactPhone: string
    trail: { id: string; name: string }
    guide: { cpf: string; name: string } | null
  }
}

export function fetchAdminParticipant(id: string) {
  return apiRequest<AdminParticipantDetail>(`/admin/participants/${id}`)
}

export type UpdateAdminParticipantPayload = {
  isBanned?: boolean
}

export function updateAdminParticipant(id: string, payload: UpdateAdminParticipantPayload) {
  return apiRequest(`/admin/participants/${id}`, { method: 'PATCH', body: payload })
}

export function fetchAdminEvents() {
  return apiRequest<{ cards: EventCard[]; upcoming: EventCard[] }>('/admin/events')
}

export type CreateAdminEventPayload = {
  title: string
  slug: string
  description: string
  location?: string
  startsAt: string
  endsAt?: string
  capacity?: number
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED'
  highlight?: boolean
}

export function createAdminEvent(payload: CreateAdminEventPayload) {
  return apiRequest('/admin/events', { method: 'POST', body: payload })
}

export type TrailStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export type TrailDifficulty = 'EASY' | 'MODERATE' | 'HARD'

export type TrailSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'

export type AdminTrailGuideAssignment = {
  cpf: string
  slug: string
  name: string
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
  bookingStatusTone: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
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
  statusTone: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
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

export type CreateAdminTrailPayload = {
  name: string
  slug: string
  description: string
  summary?: string | null
  durationMinutes: number
  difficulty: TrailDifficulty
  maxGroupSize: number
  badgeLabel?: string | null
  imageUrl?: string | null
  status?: TrailStatus
  basePrice?: number | null
  highlight?: boolean
  meetingPoint?: string | null
  guideCpfs?: string[]
}

export type UpdateAdminTrailPayload = {
  name: string
  slug: string
  description: string
  summary?: string | null
  durationMinutes: number
  difficulty: TrailDifficulty
  maxGroupSize: number
  badgeLabel?: string | null
  imageUrl?: string | null
  status: TrailStatus
  basePrice?: number | null
  highlight: boolean
  meetingPoint?: string | null
  guideCpfs?: string[]
}

export function fetchAdminTrails() {
  return apiRequest<AdminTrailListResponse>('/admin/trails')
}

export function fetchAdminTrailSessions(trailId: string) {
  return apiRequest<AdminTrailSession[]>(`/admin/trails/${trailId}/sessions`)
}

export type CreateAdminTrailSessionPayload = {
  startsAt: string
  endsAt?: string | null
  capacity: number
  meetingPoint?: string | null
  notes?: string | null
  status?: TrailSessionStatus
  primaryGuideCpf?: string | null
}

export function createAdminTrailSession(trailId: string, payload: CreateAdminTrailSessionPayload) {
  return apiRequest<AdminTrailSession>(`/admin/trails/${trailId}/sessions`, {
    method: 'POST',
    body: payload,
  })
}

export type UpdateAdminTrailSessionPayload = {
  startsAt?: string
  endsAt?: string | null
  capacity?: number
  meetingPoint?: string | null
  notes?: string | null
  status?: TrailSessionStatus
  primaryGuideCpf?: string | null
}

export function updateAdminTrailSession(id: string, payload: UpdateAdminTrailSessionPayload) {
  return apiRequest<AdminTrailSession>(`/admin/sessions/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export type DeleteAdminTrailSessionResponse = AdminTrailSession | { id: string; deleted: true }

export function deleteAdminTrailSession(id: string) {
  return apiRequest<DeleteAdminTrailSessionResponse>(`/admin/sessions/${id}`, {
    method: 'DELETE',
  })
}

export function fetchAdminTrailSessionParticipants(id: string) {
  return apiRequest<AdminTrailSessionParticipant[]>(`/admin/sessions/${id}/participants`)
}

export function createAdminTrail(payload: CreateAdminTrailPayload) {
  return apiRequest<AdminTrail>('/admin/trails', { method: 'POST', body: payload })
}

export function updateAdminTrail(id: string, payload: UpdateAdminTrailPayload) {
  return apiRequest<AdminTrail>(`/admin/trails/${id}`, { method: 'PUT', body: payload })
}

export function deleteAdminTrail(id: string) {
  return apiRequest<{ id: string }>(`/admin/trails/${id}`, { method: 'DELETE' })
}

export function fetchAdminCalendar() {
  return apiRequest<CalendarOverview>('/admin/calendar')
}

export function fetchAdminReports() {
  return apiRequest<ReportData>('/admin/reports')
}

export type AdminGuideTrail = {
  id: string
  name: string
  difficulty: string
}

export type AdminGuide = {
  cpf: string
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
  featuredTrail: AdminGuideTrail | null
  trails: AdminGuideTrail[]
  createdAt: string
  updatedAt: string
}

export type AdminGuidePayload = {
  cpf: string
  name: string
  slug: string
  speciality?: string | null
  summary?: string | null
  biography?: string | null
  experienceYears?: number
  toursCompleted?: number
  rating?: number
  languages?: string[]
  certifications?: string[]
  curiosities?: string[]
  photoUrl?: string | null
  isFeatured?: boolean
  isActive?: boolean
  featuredTrailId?: string | null
  trailIds?: string[]
}

export type AdminGuideListResponse = {
  guides: AdminGuide[]
  trails: AdminGuideTrail[]
}

export function fetchAdminGuides() {
  return apiRequest<AdminGuideListResponse>('/admin/guides')
}

export function createAdminGuide(payload: AdminGuidePayload) {
  return apiRequest<AdminGuide>('/admin/guides', { method: 'POST', body: payload })
}

export function updateAdminGuide(cpf: string, payload: AdminGuidePayload) {
  return apiRequest<AdminGuide>(`/admin/guides/${cpf}`, { method: 'PUT', body: payload })
}

export function deleteAdminGuide(cpf: string) {
  return apiRequest<{ cpf: string }>(`/admin/guides/${cpf}`, { method: 'DELETE' })
}

export type AdminInvitePayload = {
  cpf: string
  tipo: 'A' | 'C' | 'G'
}

export type AdminInviteResponse = {
  token: string
  cpf: string
  tipo: 'A' | 'C' | 'G'
  validoAte: string
}

export function createAdminInvite(payload: AdminInvitePayload) {
  return apiRequest<AdminInviteResponse>('/admin/convites', { method: 'POST', body: payload })
}
