import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import type { BookingRecord, GuideData, TrailData, TrailSessionData } from './utils/prisma-mock.js'
import { prismaMock } from './utils/prisma-mock.js'

vi.mock('../src/lib/prisma.js', () => ({ default: prismaMock }))

import app from '../src/app.js'

function createTrail(overrides: Partial<TrailData> = {}): TrailData {
  return {
    id: overrides.id ?? 'trail-1',
    slug: overrides.slug ?? 'trilha-1',
    name: overrides.name ?? 'Trilha 1',
    description: overrides.description ?? 'Descrição',
    summary: overrides.summary ?? null,
    durationMinutes: overrides.durationMinutes ?? 120,
    difficulty: overrides.difficulty ?? 'EASY',
    maxGroupSize: overrides.maxGroupSize ?? 10,
    badgeLabel: overrides.badgeLabel ?? null,
    imageUrl: overrides.imageUrl ?? null,
    meetingPoint: overrides.meetingPoint ?? 'Centro de Visitantes',
    highlight: overrides.highlight ?? false,
    status: overrides.status ?? 'ACTIVE',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  }
}

function createGuide(overrides: Partial<GuideData> = {}): GuideData {
  return {
    cpf: overrides.cpf ?? '12345678901',
    slug: overrides.slug ?? 'guia-1',
    name: overrides.name ?? 'Guia Teste',
    speciality: overrides.speciality ?? null,
    photoUrl: overrides.photoUrl ?? null,
    contactPhone: overrides.contactPhone ?? '11987654321',
    isActive: overrides.isActive ?? true,
    isFeatured: overrides.isFeatured ?? false,
  }
}

function createSession(overrides: Partial<TrailSessionData> = {}): TrailSessionData {
  const startsAt = overrides.startsAt ?? new Date(Date.now() + 60 * 60 * 1000)
  return {
    id: overrides.id ?? 'session-1',
    trailId: overrides.trailId ?? 'trail-1',
    primaryGuideCpf: overrides.primaryGuideCpf ?? '12345678901',
    contactPhone: overrides.contactPhone ?? '11987654321',
    startsAt,
    endsAt: overrides.endsAt ?? null,
    capacity: overrides.capacity ?? 10,
    meetingPoint: overrides.meetingPoint ?? 'Centro de Visitantes',
    notes: overrides.notes ?? null,
    status: overrides.status ?? 'SCHEDULED',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
  }
}

function createBooking(overrides: Partial<BookingRecord> = {}): BookingRecord {
  return {
    id: overrides.id ?? 'booking-1',
    protocol: overrides.protocol ?? 'ACD-0001',
    trailId: overrides.trailId ?? 'trail-1',
    sessionId: overrides.sessionId ?? 'session-1',
    guideCpf: overrides.guideCpf ?? '12345678901',
    status: overrides.status ?? 'CONFIRMED',
    scheduledFor: overrides.scheduledFor ?? new Date(Date.now() + 60 * 60 * 1000),
    participantsCount: overrides.participantsCount ?? 1,
    contactName: overrides.contactName ?? 'Contato',
    contactEmail: overrides.contactEmail ?? 'contato@example.com',
    contactPhone: overrides.contactPhone ?? '11911111111',
    notes: overrides.notes ?? null,
    source: overrides.source ?? 'PUBLIC_PORTAL',
  }
}

describe('Public API integration', () => {
  it('exposes contact phone for upcoming sessions', async () => {
    const trail = createTrail()
    const guide = createGuide()
    const session = createSession({ trailId: trail.id, primaryGuideCpf: guide.cpf })
    const booking = createBooking({ trailId: trail.id, sessionId: session.id, scheduledFor: session.startsAt })

    prismaMock.addTrail(trail)
    prismaMock.addGuide(guide)
    prismaMock.assignGuideToTrail({ trailId: trail.id, guideCpf: guide.cpf, assigned: new Date() })
    prismaMock.addSession(session)
    prismaMock.addBooking(booking)

    const response = await request(app).get('/api/trails')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)

    const [trailData] = response.body.data as Array<{
      upcomingSession: { contactPhone: string | null } | null
      sessions: Array<{ slots: Array<{ contactPhone: string | null }> }>
    }>

    expect(trailData.upcomingSession?.contactPhone).toBe('11987654321')
    expect(trailData.sessions[0].slots[0].contactPhone).toBe('11987654321')
  })

  it('returns zero available spots when there are no upcoming sessions', async () => {
    const trail = createTrail({ id: 'trail-no-sessions', slug: 'trilha-sem-sessao' })

    prismaMock.addTrail(trail)

    const response = await request(app).get('/api/trails')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)

    const [trailData] = response.body.data as Array<{ availableSpots: number }>
    expect(trailData.availableSpots).toBe(0)
  })

  it('accepts bookings with sessionId even when scheduledDate is omitted', async () => {
    const trail = createTrail({ id: 'trail-session-only', slug: 'trilha-com-sessao' })
    const guide = createGuide({ cpf: '22233344455', slug: 'guia-3' })
    const session = createSession({
      id: 'session-no-date',
      trailId: trail.id,
      primaryGuideCpf: guide.cpf,
      startsAt: new Date('2024-10-05T14:00:00.000Z'),
    })

    prismaMock.addTrail(trail)
    prismaMock.addGuide(guide)
    prismaMock.addSession(session)

    const response = await request(app).post('/api/bookings').send({
      trailId: trail.id,
      sessionId: session.id,
      contactName: 'Carlos Sessão',
      contactEmail: 'carlos@example.com',
      contactPhone: '11933334444',
      participantsCount: 3,
    })

    expect(response.status).toBe(201)
    expect(response.body.data.scheduledFor).toBe(session.startsAt.toISOString())

    const savedBooking = Array.from(prismaMock.bookings.values()).find((booking) => booking.sessionId === session.id)
    expect(savedBooking?.scheduledFor.toISOString()).toBe(session.startsAt.toISOString())
  })

  it('prevents overbooking with transactional locking', async () => {
    const trail = createTrail({ id: 'trail-2', slug: 'trilha-2', name: 'Trilha 2' })
    const guide = createGuide({ cpf: '98765432100', slug: 'guia-2' })
    const session = createSession({
      id: 'session-2',
      trailId: trail.id,
      primaryGuideCpf: guide.cpf,
      capacity: 3,
      contactPhone: '11999998888',
    })

    prismaMock.addTrail(trail)
    prismaMock.addGuide(guide)
    prismaMock.assignGuideToTrail({ trailId: trail.id, guideCpf: guide.cpf, assigned: new Date() })
    prismaMock.addSession(session)

    const payload = {
      trailId: trail.id,
      sessionId: session.id,
      guideCpf: guide.cpf,
      contactName: 'Maria Exploradora',
      contactEmail: 'maria@example.com',
      contactPhone: '11922223333',
      scheduledDate: session.startsAt.toISOString().slice(0, 10),
      participantsCount: 2,
      source: 'PUBLIC_PORTAL' as const,
    }

    const [first, second] = await Promise.all([
      request(app).post('/api/bookings').send(payload),
      request(app).post('/api/bookings').send(payload),
    ])

    const statuses = [first.status, second.status].sort()
    expect(statuses).toEqual([201, 409])

    expect(prismaMock.bookings.size).toBe(1)
    expect(prismaMock.queryLog.some((query) => query.includes('FOR UPDATE'))).toBe(true)
  })
})
