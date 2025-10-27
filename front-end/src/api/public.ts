import { apiRequest } from './client'

export type PublicGuide = {
  cpf: string
  slug: string
  name: string
  speciality: string | null
  biography: string | null
  summary: string | null
  rating: number
  experienceYears: number
  toursCompleted: number
  languages: string[]
  certifications: string[]
  curiosities: string[]
  photoUrl: string | null
  featuredTrail: {
    id: string
    slug: string
    name: string
    durationMinutes: number
  } | null
  trails: {
    id: string
    slug: string
    name: string
    difficulty: string
    durationMinutes: number
  }[]
}

export type PublicTrail = {
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
  upcomingSession: {
    id: string
    startsAt: string
    endsAt: string | null
    capacity: number
    label: string
    occupancyPercentage: number
    primaryGuide: { cpf: string; name: string } | null
  } | null
  guides: {
    cpf: string
    name: string
    speciality: string | null
    photoUrl: string | null
  }[]
}

export type FaunaFloraRecord = {
  id: string
  slug: string
  name: string
  scientificName: string
  category: 'FAUNA' | 'FLORA'
  status: string
  description: string | null
  imageUrl: string | null
  tags: string[]
}

export type CreateBookingPayload = {
  trailId: string
  sessionId?: string
  guideCpf?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  scheduledDate: string
  scheduledTime?: string
  participantsCount: number
  notes?: string
  participants?: Array<{
    fullName: string
    cpf?: string
    email?: string
    phone?: string
  }>
}

export type CreateBookingResponse = {
  id: string
  protocol: string
  status: string
  scheduledFor: string
  scheduledForLabel: string
  contactName: string
  trailName: string
  guideName: string | null
}

export function fetchPublicGuides() {
  return apiRequest<PublicGuide[]>('/guides')
}

export function fetchPublicTrails() {
  return apiRequest<PublicTrail[]>('/trails')
}

export function fetchFaunaFloraRecords() {
  return apiRequest<FaunaFloraRecord[]>('/fauna-flora')
}

export function createPublicBooking(payload: CreateBookingPayload) {
  return apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: payload,
  })
}
