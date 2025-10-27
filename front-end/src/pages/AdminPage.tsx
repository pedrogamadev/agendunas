import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import AdminLayout, { type AdminSection } from '../components/admin/AdminLayout'
import MetricCard, { type MetricCardProps } from '../components/admin/MetricCard'
import AdminTable, {
  type AdminTableAction,
  type AdminTableColumn,
  type AdminTableRow,
} from '../components/admin/AdminTable'
import {
  fetchAdminOverview,
  fetchAdminGuides,
  fetchAdminTrails,
  fetchAdminBooking,
  fetchAdminParticipant,
  createAdminGuide,
  createAdminTrail,
  createAdminInvite,
  createAdminBooking,
  createAdminEvent,
  updateAdminGuide,
  updateAdminTrail,
  updateAdminBookingStatus,
  updateAdminParticipant,
  deleteAdminGuide,
  deleteAdminTrail,
  type AdminOverview,
  type AdminBookingDetail,
  type AdminInviteResponse,
  type AdminGuide,
  type AdminGuidePayload,
  type AdminGuideTrail,
  type AdminTrail,
  type AdminTrailStats,
  type AdminTrailGuideOption,
  type CreateAdminTrailPayload,
  type UpdateAdminTrailPayload,
  type AdminParticipantDetail,
  type TrailDifficulty,
  type TrailStatus,
} from '../api/admin'
import { formatCpf, formatCpfForInput, sanitizeCpf } from '../utils/cpf'
import './AdminPage.css'

type SectionKey =
  | 'dashboard'
  | 'agendamentos'
  | 'participantes'
  | 'eventos'
  | 'trilhas'
  | 'guias'
  | 'calendario'
  | 'relatorios'
  | 'configuracoes'

type SectionConfig = {
  title: string
  description?: string
  actions?: ReactNode
  content: ReactNode
}

type DashboardSession = {
  id: string
  name: string
  schedule: string
  occupancy: number
  capacity: string
}

type DashboardEventHighlight = {
  id: string
  title: string
  description: string
  date: string
}

type DashboardActivity = {
  id: string
  time: string
  text: string
}

type DashboardEventCard = {
  id: string
  title: string
  description: string
  tag: string
  tagTone: string
  date: string
  capacity: string
}

type DashboardTrailCard = {
  id: string
  name: string
  difficulty: string
  duration: string
  capacity: string
  status: string
  description: string
}

type DashboardCalendarDay = {
  id: string
  date: string
  events: string[]
}

type DashboardReport = {
  metrics: MetricCardProps[]
  lineChart: Array<{ label: string; value: number }>
  pieChart: Array<{ label: string; value: number; tone: string }>
  barChart: Array<{ label: string; value: number }>
}

type AdminPageData = {
  metrics: MetricCardProps[]
  bookingRows: AdminTableRow[]
  participantRows: AdminTableRow[]
  todaysTrails: DashboardSession[]
  upcomingEvents: DashboardEventHighlight[]
  recentActivity: DashboardActivity[]
  eventCards: DashboardEventCard[]
  trailCards: DashboardTrailCard[]
  calendar: {
    title: string
    days: DashboardCalendarDay[]
  }
  report: DashboardReport
  isLive: boolean
  error?: string | null
}

type GuideFormState = {
  cpf: string
  name: string
  slug: string
  speciality: string
  summary: string
  biography: string
  experienceYears: string
  languages: string
  certifications: string
  photoUrl: string
  isFeatured: boolean
  isActive: boolean
  featuredTrailId: string
  trailIds: string[]
}

type GuidesState = {
  items: AdminGuide[]
  trails: AdminGuideTrail[]
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

const initialGuideFormState: GuideFormState = {
  cpf: '',
  name: '',
  slug: '',
  speciality: '',
  summary: '',
  biography: '',
  experienceYears: '0',
  languages: '',
  certifications: '',
  photoUrl: '',
  isFeatured: false,
  isActive: true,
  featuredTrailId: '',
  trailIds: [],
}

type TrailFormState = {
  name: string
  slug: string
  description: string
  summary: string
  durationMinutes: string
  difficulty: TrailDifficulty
  maxGroupSize: string
  badgeLabel: string
  imageUrl: string
  status: TrailStatus
  basePrice: string
  highlight: boolean
  meetingPoint: string
  guideCpfs: string[]
}

type TrailsState = {
  items: AdminTrail[]
  guides: AdminTrailGuideOption[]
  stats: AdminTrailStats | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

const initialTrailFormState: TrailFormState = {
  name: '',
  slug: '',
  description: '',
  summary: '',
  durationMinutes: '120',
  difficulty: 'MODERATE',
  maxGroupSize: '20',
  badgeLabel: '',
  imageUrl: '',
  status: 'ACTIVE',
  basePrice: '',
  highlight: false,
  meetingPoint: '',
  guideCpfs: [],
}

type BookingParticipantForm = {
  id: string
  fullName: string
  cpf: string
  email: string
  phone: string
}

type BookingFormState = {
  trailId: string
  sessionId: string
  guideCpf: string
  contactName: string
  contactEmail: string
  contactPhone: string
  scheduledDate: string
  scheduledTime: string
  participantsCount: string
  notes: string
  participants: BookingParticipantForm[]
}

const initialBookingFormState: BookingFormState = {
  trailId: '',
  sessionId: '',
  guideCpf: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  scheduledDate: '',
  scheduledTime: '08:00',
  participantsCount: '1',
  notes: '',
  participants: [],
}

type EventFormState = {
  title: string
  slug: string
  description: string
  location: string
  startsAtDate: string
  startsAtTime: string
  endsAtDate: string
  endsAtTime: string
  capacity: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED'
  highlight: boolean
}

const initialEventFormState: EventFormState = {
  title: '',
  slug: '',
  description: '',
  location: '',
  startsAtDate: '',
  startsAtTime: '08:00',
  endsAtDate: '',
  endsAtTime: '10:00',
  capacity: '',
  status: 'DRAFT',
  highlight: false,
}

const TRAIL_STATUS_LABELS: Record<TrailStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Indisponível',
  MAINTENANCE: 'Em manutenção',
}

const TRAIL_DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  EASY: 'Leve',
  MODERATE: 'Moderada',
  HARD: 'Intensa',
}

const INVITE_ROLE_LABELS: Record<'A' | 'C' | 'G', string> = {
  A: 'Administrador',
  C: 'Colaborador',
  G: 'Guia',
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const createTempId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatTrailDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '—'
  }

  const hours = Math.floor(minutes / 60)
  const remaining = minutes - hours * 60

  if (hours <= 0) {
    return `${minutes} min`
  }

  if (remaining <= 0) {
    return `${hours}h`
  }

  return `${hours}h${String(remaining).padStart(2, '0')}`
}

const formatDateLabel = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const formatTimeLabel = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : timeFormatter.format(date)
}

const createIcon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    {children}
  </svg>
)

const sidebarSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: createIcon(
      <>
        <rect x="4" y="12" width="3.5" height="8" rx="1" fill="currentColor" />
        <rect x="10.25" y="4" width="3.5" height="16" rx="1" fill="currentColor" />
        <rect x="16.5" y="8" width="3.5" height="12" rx="1" fill="currentColor" />
      </>,
    ),
  },
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    icon: createIcon(
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" fill="currentColor" opacity="0.72" />
        <rect x="4" y="9" width="16" height="11" rx="2" fill="currentColor" />
        <rect x="7" y="2" width="2" height="4" rx="1" fill="currentColor" />
        <rect x="15" y="2" width="2" height="4" rx="1" fill="currentColor" />
      </>,
    ),
  },
  {
    id: 'participantes',
    label: 'Participantes',
    icon: createIcon(
      <>
        <circle cx="12" cy="9" r="4" fill="currentColor" />
        <path
          d="M5 20c.6-3.6 3.6-6 7-6s6.4 2.4 7 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>,
    ),
  },
  {
    id: 'eventos',
    label: 'Eventos',
    icon: createIcon(
      <path
        d="m12 3.5 2 3.9 4.3.6-3.1 3 0.7 4.3L12 13.8 8.1 15.3l0.7-4.3-3.1-3 4.3-.6Z"
        fill="currentColor"
      />,
    ),
  },
  {
    id: 'trilhas',
    label: 'Trilhas',
    icon: createIcon(
      <path
        d="M6 20c1.5-3.5 3.5-5.3 6-5.3s4.5 1.8 6 5.3h-2.3c-1.2-2.4-2.4-3.6-3.7-3.6s-2.5 1.2-3.7 3.6Zm3.5-9.1a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm5-6.4-1 3.2-3 .4 2.4 2.1-.6 3 2.7-1.6 2.7 1.6-.6-3 2.4-2.1-3-.4Z"
        fill="currentColor"
      />,
    ),
  },
  {
    id: 'guias',
    label: 'Guias',
    icon: createIcon(
      <>
        <path
          d="M5 18c.4-2.8 2.8-4.8 5.8-4.8 3.2 0 5.7 2.2 6.2 5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M12 5.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" fill="currentColor" />
      </>,
    ),
  },
  {
    id: 'calendario',
    label: 'Calendário',
    icon: createIcon(
      <>
        <rect x="4" y="6" width="16" height="14" rx="3" fill="currentColor" opacity="0.68" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="2" width="2" height="4" rx="1" fill="currentColor" />
        <rect x="14" y="2" width="2" height="4" rx="1" fill="currentColor" />
      </>,
    ),
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: createIcon(
      <>
        <path
          d="M6 18V8.5a2.5 2.5 0 0 1 5 0V18Zm7 0v-6a2.5 2.5 0 1 1 5 0v6Z"
          fill="currentColor"
        />
        <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>,
    ),
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: createIcon(
      <path
        d="m12 7 1-2.8 2 .8 1.8-1.3 1.4 1.4-1.3 1.8.8 2L21 10l-.3 2-2.2.3-.8 2 1.3 1.8-1.4 1.4-1.8-1.3-2 .8L13 21l-2-.3-.3-2.2-2-.8-1.8 1.3-1.4-1.4 1.3-1.8-.8-2L3 12l.3-2L5.5 9l.8-2L5 5.2 6.4 3.8 8.2 5l2-.8ZM12 9.5A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z"
        fill="currentColor"
      />,
    ),
  },
] satisfies Array<AdminSection & { id: SectionKey }>

const sectionKeys = sidebarSections.map((section) => section.id)

const isSectionKey = (value: string): value is SectionKey =>
  (sectionKeys as string[]).includes(value)

const tableActions: AdminTableAction[] = [
  {
    id: 'view',
    label: 'Ver detalhes',
    icon: createIcon(<path d="M12 6c4 0 7.5 2.6 9 6-1.5 3.4-5 6-9 6s-7.5-2.6-9-6c1.5-3.4 5-6 9-6Zm0 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" />),
  },
  {
    id: 'confirm',
    label: 'Confirmar',
    icon: createIcon(
      <path d="m10.2 16.6-3.8-3.8 1.4-1.4 2.4 2.4 5.6-5.6 1.4 1.4Z" fill="currentColor" />,
    ),
  },
  {
    id: 'cancel',
    label: 'Cancelar',
    tone: 'danger',
    icon: createIcon(
      <path d="m7.4 7.4 9.2 9.2-1.4 1.4-9.2-9.2Zm9.2 0-9.2 9.2 1.4 1.4 9.2-9.2Z" fill="currentColor" />,
    ),
  },
]

const bookingColumns: AdminTableColumn[] = [
  { id: 'protocol', label: 'Protocolo' },
  { id: 'name', label: 'Nome' },
  { id: 'trail', label: 'Trilha' },
  { id: 'date', label: 'Data' },
  { id: 'time', label: 'Horário' },
  { id: 'participants', label: 'Participantes', align: 'center' },
  { id: 'guide', label: 'Guia' },
]

const participantColumns: AdminTableColumn[] = [
  { id: 'name', label: 'Nome' },
  { id: 'contact', label: 'Contato' },
  { id: 'trail', label: 'Trilha' },
  { id: 'datetime', label: 'Data & Horário' },
  { id: 'status', label: 'Status', align: 'center' },
]


type ChartDatum = {
  label: string
  value: number
}

type PieDatum = {
  label: string
  value: number
  tone: string
}

const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="admin-card">
    <header className="admin-card__header">
      <h2>{title}</h2>
    </header>
    <div className="admin-card__content">{children}</div>
  </section>
)

const LineChart = ({ data }: { data: ChartDatum[] }) => {
  if (data.length === 0) {
    return null
  }

  const maxValue = Math.max(...data.map((item) => item.value))
  const minValue = Math.min(...data.map((item) => item.value))
  const range = maxValue - minValue || 1
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="admin-line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="adminLineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(44, 210, 130, 0.45)" />
            <stop offset="100%" stopColor="rgba(44, 210, 130, 0)" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="#1aa361" strokeWidth="3" strokeLinecap="round" />
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#adminLineGradient)"
          opacity="0.7"
        />
      </svg>
      <div className="admin-chart__labels">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}

const PieChart = ({ data }: { data: PieDatum[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let accumulator = 0
  const gradientStops = data.map((segment) => {
    const start = total > 0 ? (accumulator / total) * 360 : 0
    accumulator += segment.value
    const end = total > 0 ? (accumulator / total) * 360 : 360
    return `${segment.tone} ${start}deg ${end}deg`
  })

  const gradient =
    gradientStops.length > 0
      ? `conic-gradient(${gradientStops.join(', ')})`
      : 'conic-gradient(#1aa361 0deg 360deg)'

  return (
    <div className="admin-pie-chart">
      <div className="admin-pie-chart__circle" style={{ background: gradient }} aria-hidden="true" />
      <div className="admin-pie-chart__legend">
        {data.map((item) => (
          <span key={item.label}>
            <span className="admin-pie-chart__dot" style={{ backgroundColor: item.tone }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const BarChart = ({ data }: { data: ChartDatum[] }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  return (
    <div className="admin-bar-chart">
      {data.map((item) => (
        <div key={item.label} className="admin-bar-chart__item">
          <div
            className="admin-bar-chart__bar"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
            aria-label={`${item.label}: ${item.value}`}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

type SectionBuilderParams = {
  key: SectionKey
  data: AdminPageData
  trailsSection: SectionConfig
  guidesSection: SectionConfig
  bookingActionFeedback: { message: string; tone: 'success' | 'error' } | null
  onOpenBookingModal: () => void
  onBookingTableAction: (rowId: string, actionId: string) => void
  onParticipantTableAction: (rowId: string, actionId: string) => void
  onOpenEventModal: () => void
}

const buildSection = ({
  key,
  data,
  trailsSection,
  guidesSection,
  bookingActionFeedback,
  onOpenBookingModal,
  onBookingTableAction,
  onParticipantTableAction,
  onOpenEventModal,
}: SectionBuilderParams): SectionConfig => {
  if (key === 'trilhas') {
    return trailsSection
  }

  if (key === 'guias') {
    return guidesSection
  }

  switch (key) {
    case 'dashboard':
      return {
        title: 'Dashboard',
        description: 'Visão geral da operação do Parque das Dunas',
        content: (
          <div className="admin-dashboard">
            {!data.isLive && data.error && (
              <div className="admin-alert-card">
                <strong>Exibindo dados de demonstração</strong>
                <p>{data.error}</p>
              </div>
            )}
            <div className="admin-grid admin-grid--metrics">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>
            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Trilhas de Hoje</h2>
                  <span>Ocupação por trilha</span>
                </header>
                <div className="admin-card__content">
                  <ul className="admin-trail-list">
                    {data.todaysTrails.map((trail) => (
                      <li key={trail.id}>
                        <div className="admin-trail-list__meta">
                          <strong>{trail.name}</strong>
                          <span>{trail.schedule}</span>
                        </div>
                        <div className="admin-trail-list__capacity">
                          <span>{trail.capacity}</span>
                          <span>{trail.occupancy}%</span>
                        </div>
                        <div className="admin-progress">
                          <div className="admin-progress__bar" style={{ width: `${trail.occupancy}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Clima & Condições</h2>
                  <span>Integração meteorológica em desenvolvimento</span>
                </header>
                <div className="admin-card__content">
                  <p className="admin-empty-state">
                    Os dados de clima serão exibidos assim que a integração com a estação
                    meteorológica for concluída.
                  </p>
                </div>
              </section>
            </div>
            <div className="admin-grid admin-grid--two">
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Próximos Eventos</h2>
                  <span>Planejamento para os próximos dias</span>
                </header>
                <div className="admin-card__content">
                  <ul className="admin-event-list">
                    {data.upcomingEvents.map((event) => (
                      <li key={event.id}>
                        <div>
                          <strong>{event.title}</strong>
                          <span>{event.description}</span>
                        </div>
                        <span className="admin-event-list__date">{event.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Atividade Recente</h2>
                  <span>Interações nas últimas 24h</span>
                </header>
                <div className="admin-card__content">
                  <ul className="admin-activity-list">
                    {data.recentActivity.map((item) => (
                      <li key={item.id}>
                        <span className="admin-activity-list__time">{item.time}</span>
                        <p>{item.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        ),
      }
    case 'agendamentos':
      return {
        title: 'Agendamentos',
        description: 'Gerencie reservas de trilhas e controle os status em tempo real',
        actions: (
          <>
            <button type="button" className="admin-secondary-button">Exportar CSV</button>
            <button type="button" className="admin-primary-button" onClick={onOpenBookingModal}>
              Novo Agendamento
            </button>
          </>
        ),
        content: (
          <div className="admin-section">
            <div className="admin-filters">
              <label>
                Trilha
                <select defaultValue="todas">
                  <option value="todas">Todas</option>
                </select>
              </label>
              <label>
                Status
                <select defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="pendente">Pendentes</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </label>
              <label>
                Período
                <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </label>
            </div>
            {bookingActionFeedback ? (
              <div
                className={`admin-alert admin-alert--${
                  bookingActionFeedback.tone === 'success' ? 'success' : 'error'
                }`}
              >
                {bookingActionFeedback.message}
              </div>
            ) : null}
            <AdminTable
              columns={bookingColumns}
              rows={data.bookingRows}
              onAction={onBookingTableAction}
              emptyMessage={
                data.isLive
                  ? 'Nenhum agendamento encontrado para o período selecionado.'
                  : data.error ?? 'Agendamentos indisponíveis.'
              }
            />
          </div>
        ),
      }
    case 'participantes':
      return {
        title: 'Participantes',
        description: 'Lista de visitantes com status e check-in',
        actions: (
          <button type="button" className="admin-primary-button">
            Importar Participantes
          </button>
        ),
        content: (
          <div className="admin-section">
            <div className="admin-filters">
              <label>
                Trilha
                <select defaultValue="todas">
                  <option value="todas">Todas</option>
                </select>
              </label>
              <label>
                Data
                <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </label>
              <label>
                Status
                <select defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                </select>
              </label>
            </div>
            <AdminTable
              columns={participantColumns}
              rows={data.participantRows}
              onAction={onParticipantTableAction}
              emptyMessage={
                data.isLive
                  ? 'Nenhum participante encontrado.'
                  : data.error ?? 'Participantes indisponíveis.'
              }
            />
          </div>
        ),
      }
    case 'eventos':
      return {
        title: 'Eventos do Parque',
        description: 'Gerencie e promova eventos e atividades especiais',
        actions: (
          <button type="button" className="admin-primary-button" onClick={onOpenEventModal}>
            Novo Evento
          </button>
        ),
        content: (
          <div className="admin-grid admin-grid--three">
            {data.eventCards.map((event) => (
              <article key={event.id} className="admin-event-card">
                <header>
                  <span className={`admin-tag admin-tag--${event.tagTone}`}>{event.tag}</span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </header>
                <dl>
                  <div>
                    <dt>Data</dt>
                    <dd>{event.date}</dd>
                  </div>
                  <div>
                    <dt>Capacidade</dt>
                    <dd>{event.capacity}</dd>
                  </div>
                </dl>
                <div className="admin-event-card__actions">
                  <button type="button" className="admin-secondary-button" disabled>
                    Editar
                  </button>
                  <button type="button" className="admin-secondary-button" disabled>
                    Publicar
                  </button>
                  <button type="button" className="admin-secondary-button" disabled>
                    Promover
                  </button>
                </div>
              </article>
            ))}
            {data.eventCards.length === 0 ? (
              <div className="admin-empty-card">
                <p>Nenhum evento cadastrado até o momento.</p>
              </div>
            ) : null}
          </div>
        ),
      }
    case 'calendario':
      return {
        title: 'Calendário',
        description: 'Visualize agendamentos e eventos em um calendário unificado',
        actions: (
          <>
            <button type="button" className="admin-secondary-button">Agendamentos</button>
            <button type="button" className="admin-secondary-button">Eventos</button>
            <button type="button" className="admin-primary-button">Nova Entrada</button>
          </>
        ),
        content: (
          <div className="admin-calendar">
            <header className="admin-calendar__header">
              <div>
                <h2>{data.calendar.title}</h2>
                <span>Agenda integrada do parque</span>
              </div>
              <div className="admin-calendar__controls">
                <button type="button" className="admin-secondary-button">Mês Anterior</button>
                <button type="button" className="admin-secondary-button">Próximo Mês</button>
              </div>
            </header>
            <div className="admin-calendar__grid">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="admin-calendar__weekday">
                  {day}
                </div>
              ))}
              {data.calendar.days.map((day) => (
                <div key={day.date} className={`admin-calendar__day${day.events.length > 0 ? ' has-events' : ''}`}>
                  <span className="admin-calendar__date">{day.date}</span>
                  <ul>
                    {day.events.map((event) => (
                      <li key={event}>{event}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <footer className="admin-calendar__legend">
              <span>
                <span className="admin-calendar__dot admin-calendar__dot--booking" /> Agendamentos
              </span>
              <span>
                <span className="admin-calendar__dot admin-calendar__dot--event" /> Eventos
              </span>
            </footer>
          </div>
        ),
      }
    case 'relatorios':
      return {
        title: 'Relatórios',
        description: 'Acompanhe indicadores e gere exportações para o time gestor',
        actions: (
          <>
            <button type="button" className="admin-secondary-button">Exportar CSV</button>
            <button type="button" className="admin-secondary-button">Exportar PDF</button>
          </>
        ),
        content: (
          <div className="admin-reports">
            <div className="admin-grid admin-grid--metrics">
              {data.report.metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </div>
            <div className="admin-grid admin-grid--two">
              <ChartCard title="Agendamentos por Período">
                <LineChart data={data.report.lineChart} />
              </ChartCard>
              <ChartCard title="Distribuição por Status">
                <PieChart data={data.report.pieChart} />
              </ChartCard>
            </div>
            <ChartCard title="Agendamentos por Trilha">
              <BarChart data={data.report.barChart} />
            </ChartCard>
          </div>
        ),
      }
    case 'configuracoes':
      return {
        title: 'Configurações',
        description: 'Personalize comunicações automáticas e regras do parque',
        content: (
          <div className="admin-settings">
            <section className="admin-card">
              <header className="admin-card__header">
                <h2>Templates de Mensagens</h2>
                <span>Configure mensagens enviadas por email e WhatsApp</span>
              </header>
              <div className="admin-card__content admin-settings__grid">
                <div>
                  <label>
                    Template de Confirmação
                    <textarea defaultValue={`Olá {nome},\nSeu agendamento foi confirmado!\nData: {data}\nTrilha: {trilha}\nGuia: {guia}`} />
                  </label>
                  <small>Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{trilha}'}, {'{guia}'}</small>
                </div>
                <div>
                  <label>
                    Template de Lembrete
                    <textarea defaultValue={`Olá {nome},\nEstamos te lembrando do passeio amanhã às {hora}.\nAté breve!`} />
                  </label>
                  <small>Configure o envio automático 24h antes do agendamento.</small>
                </div>
                <div>
                  <label>
                    Template de Cancelamento
                    <textarea defaultValue={`Olá {nome},\nSeu agendamento foi cancelado.\nQualquer dúvida estamos à disposição.`} />
                  </label>
                  <small>Utilize tags para informar motivos e políticas de reembolso.</small>
                </div>
              </div>
            </section>
          </div>
        ),
      }
    default:
      return {
        title: 'Dashboard',
        content: null,
      }
  }
}

function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [isLoadingOverview, setIsLoadingOverview] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [guidesState, setGuidesState] = useState<GuidesState>({
    items: [],
    trails: [],
    isLoading: false,
    isInitialized: false,
    error: null,
  })
  const [guideForm, setGuideForm] = useState<GuideFormState>(initialGuideFormState)
  const [editingGuideCpf, setEditingGuideCpf] = useState<string | null>(null)
  const [isSavingGuide, setIsSavingGuide] = useState(false)
  const [guideFeedback, setGuideFeedback] = useState<string | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteCpf, setInviteCpf] = useState('')
  const [inviteRole, setInviteRole] = useState<'A' | 'C' | 'G'>('C')
  const [inviteResult, setInviteResult] = useState<AdminInviteResponse | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)
  const [trailsState, setTrailsState] = useState<TrailsState>({
    items: [],
    guides: [],
    stats: null,
    isLoading: false,
    isInitialized: false,
    error: null,
  })
  const [trailForm, setTrailForm] = useState<TrailFormState>(initialTrailFormState)
  const [editingTrailId, setEditingTrailId] = useState<string | null>(null)
  const [isSavingTrail, setIsSavingTrail] = useState(false)
  const [trailFeedback, setTrailFeedback] = useState<string | null>(null)
  const [trailFormError, setTrailFormError] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingFormState)
  const [bookingFormError, setBookingFormError] = useState<string | null>(null)
  const [isSavingBooking, setIsSavingBooking] = useState(false)
  const [bookingActionFeedback, setBookingActionFeedback] = useState<
    { message: string; tone: 'success' | 'error' }
  | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null)
  const [bookingDetailError, setBookingDetailError] = useState<string | null>(null)
  const [isLoadingBookingDetail, setIsLoadingBookingDetail] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [participantDetail, setParticipantDetail] = useState<AdminParticipantDetail | null>(null)
  const [participantDetailError, setParticipantDetailError] = useState<string | null>(null)
  const [isLoadingParticipantDetail, setIsLoadingParticipantDetail] = useState(false)
  const [isUpdatingParticipant, setIsUpdatingParticipant] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventForm, setEventForm] = useState<EventFormState>(initialEventFormState)
  const [eventFormError, setEventFormError] = useState<string | null>(null)
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  const sortGuides = useCallback((items: AdminGuide[]) => {
    return items
      .slice()
      .sort((a: AdminGuide, b: AdminGuide) => {
        if (a.isFeatured && !b.isFeatured) {
          return -1
        }
        if (!a.isFeatured && b.isFeatured) {
          return 1
        }
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      })
  }, [])

  const sortTrails = useCallback((items: AdminTrail[]) => {
    return items
      .slice()
      .sort((a: AdminTrail, b: AdminTrail) => {
        if (a.highlight && !b.highlight) {
          return -1
        }
        if (!a.highlight && b.highlight) {
          return 1
        }
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      })
  }, [])

  const loadGuides = useCallback(async () => {
    setGuidesState((state) => ({ ...state, isLoading: true }))

    try {
      const payload = await fetchAdminGuides()
      setGuidesState({
        items: sortGuides(payload.guides),
        trails: payload.trails,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar os guias cadastrados.'
      setGuidesState((state) => ({
        ...state,
        isLoading: false,
        isInitialized: true,
        error: message,
      }))
    }
  }, [sortGuides])

  const loadTrails = useCallback(async () => {
    setTrailsState((state) => ({ ...state, isLoading: true }))

    try {
      const payload = await fetchAdminTrails()
      setTrailsState({
        items: sortTrails(payload.trails),
        guides: payload.guides,
        stats: payload.stats,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as trilhas cadastradas.'
      setTrailsState((state) => ({
        ...state,
        isLoading: false,
        isInitialized: true,
        error: message,
      }))
    }
  }, [sortTrails])

  useEffect(() => {
    if (activeSection === 'guias' && !guidesState.isInitialized) {
      loadGuides()
    }
  }, [activeSection, guidesState.isInitialized, loadGuides])

  useEffect(() => {
    if (activeSection === 'trilhas' && !trailsState.isInitialized) {
      loadTrails()
    }
  }, [activeSection, trailsState.isInitialized, loadTrails])

  const resetGuideForm = useCallback(() => {
    setGuideForm(initialGuideFormState)
    setEditingGuideCpf(null)
  }, [])

  const resetTrailForm = useCallback(() => {
    setTrailForm(initialTrailFormState)
    setEditingTrailId(null)
    setTrailFormError(null)
  }, [])

  const resetBookingForm = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    const firstTrailId = trailsState.items[0]?.id ?? ''
    setBookingForm({
      ...initialBookingFormState,
      trailId: firstTrailId,
      scheduledDate: today,
    })
    setBookingFormError(null)
  }, [trailsState.items])

  const resetEventForm = useCallback(() => {
    setEventForm(initialEventFormState)
    setEventFormError(null)
  }, [])

  const splitList = useCallback((value: string) => {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }, [])

  const handleTrailGuideSelectionChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
    setTrailForm((prev) => ({
      ...prev,
      guideCpfs: Array.from(new Set(selected)),
    }))
  }, [])

  const handleAddBookingParticipant = useCallback(() => {
    setBookingForm((prev) => ({
      ...prev,
      participants: [
        ...prev.participants,
        { id: createTempId(), fullName: '', cpf: '', email: '', phone: '' },
      ],
    }))
  }, [])

  const handleUpdateBookingParticipant = useCallback(
    (index: number, field: keyof Omit<BookingParticipantForm, 'id'>, value: string) => {
      setBookingForm((prev) => {
        if (!prev.participants[index]) {
          return prev
        }

        const next = prev.participants.slice()
        next[index] = { ...next[index], [field]: value }
        return { ...prev, participants: next }
      })
    },
    [],
  )

  const handleRemoveBookingParticipant = useCallback((index: number) => {
    setBookingForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, itemIndex) => itemIndex !== index),
    }))
  }, [])

  const handleBookingFormFieldChange = useCallback(
    (field: keyof Omit<BookingFormState, 'participants'>, value: string) => {
      setBookingForm((prev) => {
        if (field === 'trailId') {
          return {
            ...prev,
            trailId: value,
            sessionId: '',
            guideCpf: '',
          }
        }

        return {
          ...prev,
          [field]: value,
        }
      })
    },
    [],
  )

  const handleOpenBookingModal = useCallback(async () => {
    if (!trailsState.isInitialized) {
      await loadTrails()
    }
    resetBookingForm()
    setIsBookingModalOpen(true)
  }, [loadTrails, resetBookingForm, trailsState.isInitialized])

  const handleCloseBookingModal = useCallback(() => {
    setIsBookingModalOpen(false)
    resetBookingForm()
  }, [resetBookingForm])

  const handleOpenEventModal = useCallback(() => {
    resetEventForm()
    setIsEventModalOpen(true)
  }, [resetEventForm])

  const handleCloseEventModal = useCallback(() => {
    setIsEventModalOpen(false)
    resetEventForm()
  }, [resetEventForm])

  const handleCloseBookingDetail = useCallback(() => {
    setSelectedBookingId(null)
    setBookingDetail(null)
    setBookingDetailError(null)
  }, [])

  const handleCloseParticipantDetail = useCallback(() => {
    setSelectedParticipantId(null)
    setParticipantDetail(null)
    setParticipantDetailError(null)
  }, [])

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true)
    try {
      const data = await fetchAdminOverview()
      setOverview(data)
      setOverviewError(null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados em tempo real.'
      setOverview(null)
      setOverviewError(message)
    } finally {
      setIsLoadingOverview(false)
    }
  }, [])

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED') => {
      try {
        setBookingActionFeedback(null)
        await updateAdminBookingStatus(bookingId, { status })
        setBookingActionFeedback({
          message: `Status do agendamento atualizado para ${status.toLowerCase()}.`,
          tone: 'success',
        })
        await loadOverview()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Não foi possível atualizar o status do agendamento.'
        setBookingActionFeedback({ message, tone: 'error' })
      }
    },
    [loadOverview],
  )

  const handleBookingTableAction = useCallback(
    async (rowId: string, actionId: string) => {
      if (actionId === 'view') {
        setSelectedBookingId(rowId)
        setBookingDetail(null)
        setBookingDetailError(null)
        setIsLoadingBookingDetail(true)
        try {
          const detail = await fetchAdminBooking(rowId)
          setBookingDetail(detail)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Não foi possível carregar os detalhes do agendamento.'
          setBookingDetailError(message)
        } finally {
          setIsLoadingBookingDetail(false)
        }
        return
      }

      if (actionId === 'confirm') {
        updateBookingStatus(rowId, 'CONFIRMED')
        return
      }

      if (actionId === 'cancel') {
        updateBookingStatus(rowId, 'CANCELLED')
      }
    },
    [fetchAdminBooking, updateBookingStatus],
  )

  const handleParticipantTableAction = useCallback(
    async (rowId: string, actionId: string) => {
      if (actionId !== 'manage') {
        return
      }

      setSelectedParticipantId(rowId)
      setParticipantDetail(null)
      setParticipantDetailError(null)
      setIsLoadingParticipantDetail(true)

      try {
        const detail = await fetchAdminParticipant(rowId)
        setParticipantDetail(detail)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os detalhes do participante.'
        setParticipantDetailError(message)
      } finally {
        setIsLoadingParticipantDetail(false)
      }
    },
    [fetchAdminParticipant],
  )

  const handleToggleParticipantBan = useCallback(async () => {
    if (!participantDetail) {
      return
    }

    setIsUpdatingParticipant(true)
    try {
      const nextStatus = !participantDetail.isBanned
      await updateAdminParticipant(participantDetail.id, { isBanned: nextStatus })
      setParticipantDetail((prev) => (prev ? { ...prev, isBanned: nextStatus } : prev))
      await loadOverview()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível atualizar o participante.'
      setParticipantDetailError(message)
    } finally {
      setIsUpdatingParticipant(false)
    }
  }, [loadOverview, participantDetail, updateAdminParticipant])

  const handleBookingSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!bookingForm.trailId) {
        setBookingFormError('Selecione uma trilha para criar o agendamento.')
        return
      }

      const participantsCount = Number.parseInt(bookingForm.participantsCount, 10)
      if (!Number.isFinite(participantsCount) || participantsCount <= 0) {
        setBookingFormError('Informe a quantidade de participantes.')
        return
      }

      let scheduledDate = bookingForm.scheduledDate
      let scheduledTime = bookingForm.scheduledTime

      if (bookingForm.sessionId) {
        const session = trailsState.items
          .flatMap((trail) => trail.sessions)
          .find((item) => item.id === bookingForm.sessionId)

        if (!session) {
          setBookingFormError('Sessão selecionada não encontrada.')
          return
        }

        scheduledDate = session.startsAt.slice(0, 10)
        scheduledTime = session.startsAt.slice(11, 16)
      } else if (!scheduledDate) {
        setBookingFormError('Informe a data desejada para o agendamento.')
        return
      }

      const participants = bookingForm.participants
        .filter((participant) => participant.fullName.trim().length > 0)
        .map((participant) => ({
          fullName: participant.fullName.trim(),
          cpf: participant.cpf.trim() || undefined,
          email: participant.email.trim() || undefined,
          phone: participant.phone.trim() || undefined,
        }))

      setIsSavingBooking(true)
      setBookingFormError(null)

      try {
        await createAdminBooking({
          trailId: bookingForm.trailId,
          sessionId: bookingForm.sessionId || undefined,
          guideCpf: bookingForm.guideCpf ? sanitizeCpf(bookingForm.guideCpf) : undefined,
          contactName: bookingForm.contactName,
          contactEmail: bookingForm.contactEmail,
          contactPhone: bookingForm.contactPhone,
          scheduledDate,
          scheduledTime,
          participantsCount,
          notes: bookingForm.notes || undefined,
          participants,
          source: 'ADMIN',
        })

        setBookingActionFeedback({
          message: 'Agendamento registrado com sucesso.',
          tone: 'success',
        })
        setIsBookingModalOpen(false)
        resetBookingForm()
        await loadOverview()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível criar o agendamento.'
        setBookingFormError(message)
      } finally {
        setIsSavingBooking(false)
      }
    },
    [
      bookingForm.contactEmail,
      bookingForm.contactName,
      bookingForm.contactPhone,
      bookingForm.guideCpf,
      bookingForm.notes,
      bookingForm.participants,
      bookingForm.participantsCount,
      bookingForm.scheduledDate,
      bookingForm.scheduledTime,
      bookingForm.sessionId,
      bookingForm.trailId,
      loadOverview,
      resetBookingForm,
      trailsState.items,
    ],
  )

  const handleEventSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!eventForm.title.trim()) {
        setEventFormError('Informe o título do evento.')
        return
      }

      if (!eventForm.description.trim()) {
        setEventFormError('Descreva o evento para divulgação.')
        return
      }

      if (!eventForm.startsAtDate) {
        setEventFormError('Informe a data de início do evento.')
        return
      }

      const slug = (eventForm.slug || slugify(eventForm.title)).trim()
      const startsAtIso = new Date(`${eventForm.startsAtDate}T${eventForm.startsAtTime || '08:00'}:00`)

      if (Number.isNaN(startsAtIso.getTime())) {
        setEventFormError('Data ou horário inicial inválidos.')
        return
      }

      let endsAtIso: Date | null = null
      if (eventForm.endsAtDate) {
        endsAtIso = new Date(`${eventForm.endsAtDate}T${eventForm.endsAtTime || '10:00'}:00`)
        if (Number.isNaN(endsAtIso.getTime())) {
          setEventFormError('Data ou horário final inválidos.')
          return
        }
      }

      const capacityValue = eventForm.capacity.trim()
      let parsedCapacity: number | undefined
      if (capacityValue.length) {
        const numericCapacity = Number.parseInt(capacityValue, 10)
        if (!Number.isFinite(numericCapacity) || numericCapacity <= 0) {
          setEventFormError('Capacidade informada é inválida.')
          return
        }

        parsedCapacity = numericCapacity
      }

      setIsSavingEvent(true)
      setEventFormError(null)

      try {
        await createAdminEvent({
          title: eventForm.title.trim(),
          slug,
          description: eventForm.description.trim(),
          location: eventForm.location.trim() || undefined,
          startsAt: startsAtIso.toISOString(),
          endsAt: endsAtIso ? endsAtIso.toISOString() : undefined,
          capacity: parsedCapacity,
          status: eventForm.status,
          highlight: eventForm.highlight,
        })

        setIsEventModalOpen(false)
        resetEventForm()
        await loadOverview()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível cadastrar o evento.'
        setEventFormError(message)
      } finally {
        setIsSavingEvent(false)
      }
    },
    [
      eventForm.capacity,
      eventForm.description,
      eventForm.endsAtDate,
      eventForm.endsAtTime,
      eventForm.highlight,
      eventForm.location,
      eventForm.slug,
      eventForm.startsAtDate,
      eventForm.startsAtTime,
      eventForm.status,
      eventForm.title,
      loadOverview,
      resetEventForm,
    ],
  )

  const handleCreateBookingFromParticipant = useCallback(async () => {
    if (!participantDetail) {
      return
    }

    await handleOpenBookingModal()
    setBookingForm((prev) => ({
      ...prev,
      contactName: participantDetail.fullName,
      contactEmail: participantDetail.email ?? participantDetail.booking.contactEmail,
      contactPhone: participantDetail.phone ?? participantDetail.booking.contactPhone,
      participantsCount: String(Math.max(1, participantDetail.booking.participantsCount)),
      participants: [
        {
          id: createTempId(),
          fullName: participantDetail.fullName,
          cpf: participantDetail.cpf ?? '',
          email: participantDetail.email ?? '',
          phone: participantDetail.phone ?? '',
        },
        ...prev.participants,
      ],
    }))
    handleCloseParticipantDetail()
  }, [handleCloseParticipantDetail, handleOpenBookingModal, participantDetail])

  const selectedBookingTrail = useMemo(() => {
    return trailsState.items.find((trail) => trail.id === bookingForm.trailId) ?? null
  }, [bookingForm.trailId, trailsState.items])

  const availableSessions = useMemo(() => {
    return selectedBookingTrail?.sessions ?? []
  }, [selectedBookingTrail])

  const availableGuidesForTrail = useMemo(() => {
    if (!selectedBookingTrail) {
      return trailsState.guides
    }
    return selectedBookingTrail.guides.map((guide) => ({
      cpf: guide.cpf,
      name: guide.name,
    }))
  }, [selectedBookingTrail, trailsState.guides])

  const selectedBookingSession = useMemo(() => {
    return availableSessions.find((session) => session.id === bookingForm.sessionId) ?? null
  }, [availableSessions, bookingForm.sessionId])

  const handleOpenInviteModal = useCallback(() => {
    setInviteCpf('')
    setInviteRole('C')
    setInviteResult(null)
    setInviteError(null)
    setIsInviteModalOpen(true)
  }, [])

  const handleCloseInviteModal = useCallback(() => {
    setIsInviteModalOpen(false)
    setInviteCpf('')
    setInviteRole('C')
    setInviteResult(null)
    setInviteError(null)
  }, [])

  const handleGenerateInvite = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const normalizedCpf = sanitizeCpf(inviteCpf)

      if (normalizedCpf.length !== 11) {
        setInviteError('Informe um CPF válido com 11 dígitos.')
        return
      }

      setIsGeneratingInvite(true)
      setInviteError(null)
      setInviteResult(null)

      try {
        const result = await createAdminInvite({ cpf: normalizedCpf, tipo: inviteRole })
        setInviteResult(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível gerar o convite.'
        setInviteError(message)
        setInviteResult(null)
      } finally {
        setIsGeneratingInvite(false)
      }
    },
    [inviteCpf, inviteRole],
  )

  const inviteExpiryLabel = useMemo(() => {
    if (!inviteResult) {
      return null
    }

    const parsed = new Date(inviteResult.validoAte)
    if (Number.isNaN(parsed.getTime())) {
      return inviteResult.validoAte
    }

    return parsed.toLocaleString('pt-BR')
  }, [inviteResult])

  const handleStartNewGuide = useCallback(() => {
    resetGuideForm()
    setGuideFeedback(null)
    setGuidesState((state) => ({ ...state, error: null }))
  }, [resetGuideForm])

  const handleStartNewTrail = useCallback(() => {
    resetTrailForm()
    setTrailFeedback(null)
    setTrailFormError(null)
    setTrailsState((state) => ({ ...state, error: null }))
  }, [resetTrailForm])

  const handleEditTrail = useCallback((trail: AdminTrail) => {
    setTrailForm({
      name: trail.name,
      slug: trail.slug,
      description: trail.description,
      summary: trail.summary ?? '',
      durationMinutes: String(trail.durationMinutes),
      difficulty: trail.difficulty,
      maxGroupSize: String(trail.maxGroupSize),
      badgeLabel: trail.badgeLabel ?? '',
      imageUrl: trail.imageUrl ?? '',
      status: trail.status,
      basePrice: trail.basePrice !== null ? String(trail.basePrice) : '',
      highlight: trail.highlight,
      meetingPoint: trail.meetingPoint ?? '',
      guideCpfs: trail.guides.map((assignment) => assignment.cpf),
    })
    setEditingTrailId(trail.id)
    setTrailFeedback(null)
    setTrailFormError(null)
    setTrailsState((state) => ({ ...state, error: null }))
  }, [])

  const handleTrailSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const trimmedName = trailForm.name.trim()
      const trimmedSlug = trailForm.slug.trim()
      const trimmedDescription = trailForm.description.trim()

      if (!trimmedName) {
        setTrailFormError('Informe o nome da trilha.')
        return
      }

      if (!trimmedSlug) {
        setTrailFormError('Informe o identificador (slug) da trilha.')
        return
      }

      if (!trimmedDescription || trimmedDescription.length < 20) {
        setTrailFormError('Descreva a trilha com pelo menos 20 caracteres.')
        return
      }

      const parsedDuration = Number.parseInt(trailForm.durationMinutes, 10)
      if (!Number.isFinite(parsedDuration) || parsedDuration < 10) {
        setTrailFormError('Informe a duração mínima em minutos (a partir de 10).')
        return
      }

      const parsedCapacity = Number.parseInt(trailForm.maxGroupSize, 10)
      if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
        setTrailFormError('Informe a capacidade máxima de participantes (mínimo 1).')
        return
      }

      const basePriceInput = trailForm.basePrice.trim().replace(',', '.')
      let basePriceValue: number | null = null
      if (basePriceInput.length > 0) {
        const parsedBasePrice = Number.parseFloat(basePriceInput)
        if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
          setTrailFormError('Informe um valor válido para o preço base ou deixe em branco.')
          return
        }
        basePriceValue = parsedBasePrice
      }

      const summary = trailForm.summary.trim()
      const badgeLabel = trailForm.badgeLabel.trim()
      const imageUrl = trailForm.imageUrl.trim()
      const meetingPoint = trailForm.meetingPoint.trim()
      const uniqueGuideCpfs = Array.from(new Set(trailForm.guideCpfs))

      const createPayload: CreateAdminTrailPayload = {
        name: trimmedName,
        slug: trimmedSlug,
        description: trimmedDescription,
        summary: summary ? summary : null,
        durationMinutes: parsedDuration,
        difficulty: trailForm.difficulty,
        maxGroupSize: parsedCapacity,
        badgeLabel: badgeLabel ? badgeLabel : null,
        imageUrl: imageUrl ? imageUrl : null,
        status: trailForm.status,
        basePrice: basePriceValue,
        highlight: trailForm.highlight,
        meetingPoint: meetingPoint ? meetingPoint : null,
        guideCpfs: uniqueGuideCpfs,
      }

      const updatePayload: UpdateAdminTrailPayload = {
        ...createPayload,
        status: trailForm.status,
        highlight: trailForm.highlight,
      }

      setIsSavingTrail(true)
      setTrailFeedback(null)
      setTrailFormError(null)

      try {
        if (editingTrailId) {
          await updateAdminTrail(editingTrailId, updatePayload)
        } else {
          await createAdminTrail(createPayload)
        }

        await loadTrails()
        setTrailFeedback(
          editingTrailId ? 'Trilha atualizada com sucesso.' : 'Trilha cadastrada com sucesso.',
        )
        resetTrailForm()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível salvar a trilha.'
        setTrailFormError(message)
      } finally {
        setIsSavingTrail(false)
      }
    },
    [
      trailForm.name,
      trailForm.slug,
      trailForm.description,
      trailForm.summary,
      trailForm.durationMinutes,
      trailForm.difficulty,
      trailForm.maxGroupSize,
      trailForm.badgeLabel,
      trailForm.imageUrl,
      trailForm.status,
      trailForm.basePrice,
      trailForm.highlight,
      trailForm.meetingPoint,
      trailForm.guideCpfs,
      editingTrailId,
      loadTrails,
      resetTrailForm,
    ],
  )

  const handleDeleteTrail = useCallback(
    async (trail: AdminTrail) => {
      const confirmed = window.confirm(`Deseja realmente remover a trilha ${trail.name}?`)
      if (!confirmed) {
        return
      }

      setTrailsState((state) => ({ ...state, isLoading: true, error: null }))
      setTrailFormError(null)

      try {
        await deleteAdminTrail(trail.id)
        if (editingTrailId === trail.id) {
          resetTrailForm()
        }
        await loadTrails()
        setTrailFeedback('Trilha removida com sucesso.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível remover a trilha.'
        setTrailsState((state) => ({ ...state, isLoading: false, error: message }))
        setTrailFormError(message)
      }
    },
    [editingTrailId, loadTrails, resetTrailForm],
  )

  const handleTrailSelectionChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
    setGuideForm((prev) => {
      const uniqueSelected = Array.from(new Set(selected))
      const shouldClearFeatured =
        prev.featuredTrailId.length > 0 && !uniqueSelected.includes(prev.featuredTrailId)
      return {
        ...prev,
        trailIds: uniqueSelected,
        featuredTrailId: shouldClearFeatured ? '' : prev.featuredTrailId,
      }
    })
  }, [])

  const handleEditGuide = useCallback(
    (guide: AdminGuide) => {
      setGuideForm({
        cpf: guide.cpf,
        name: guide.name,
        slug: guide.slug,
        speciality: guide.speciality ?? '',
        summary: guide.summary ?? '',
        biography: guide.biography ?? '',
        experienceYears: String(guide.experienceYears ?? 0),
        languages: guide.languages.join(', '),
        certifications: guide.certifications.join(', '),
        photoUrl: guide.photoUrl ?? '',
        isFeatured: guide.isFeatured,
        isActive: guide.isActive,
        featuredTrailId: guide.featuredTrailId ?? '',
        trailIds: guide.trails.map((trail) => trail.id),
      })
      setEditingGuideCpf(guide.cpf)
      setGuideFeedback(null)
      setGuidesState((state) => ({ ...state, error: null }))
    },
    [],
  )

  const handleGuideSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const sanitizedCpf = sanitizeCpf(guideForm.cpf)
      const trimmedName = guideForm.name.trim()
      const trimmedSlug = guideForm.slug.trim()

      if (sanitizedCpf.length !== 11) {
        setGuidesState((state) => ({ ...state, error: 'Informe um CPF válido com 11 dígitos.' }))
        return
      }

      if (!trimmedName) {
        setGuidesState((state) => ({ ...state, error: 'Informe o nome do guia.' }))
        return
      }

      if (!trimmedSlug) {
        setGuidesState((state) => ({ ...state, error: 'Informe o identificador (slug) do guia.' }))
        return
      }

      const parsedExperience = Number.parseInt(guideForm.experienceYears, 10)
      const experienceYears = Number.isFinite(parsedExperience) && parsedExperience >= 0 ? parsedExperience : 0

      const featuredTrailId = guideForm.featuredTrailId.trim()
      const selectedTrailIds = new Set<string>(guideForm.trailIds)

      if (featuredTrailId) {
        selectedTrailIds.add(featuredTrailId)
      }

      const payload: AdminGuidePayload = {
        cpf: sanitizedCpf,
        name: trimmedName,
        slug: trimmedSlug,
        speciality: guideForm.speciality.trim() || null,
        summary: guideForm.summary.trim() || null,
        biography: guideForm.biography.trim() || null,
        experienceYears,
        languages: splitList(guideForm.languages),
        certifications: splitList(guideForm.certifications),
        photoUrl: guideForm.photoUrl.trim() || null,
        isFeatured: guideForm.isFeatured,
        isActive: guideForm.isActive,
        featuredTrailId: featuredTrailId || null,
        trailIds: Array.from(selectedTrailIds),
      }

      setIsSavingGuide(true)
      setGuideFeedback(null)
      setGuidesState((state) => ({ ...state, error: null }))

      try {
        const savedGuide = editingGuideCpf
          ? await updateAdminGuide(editingGuideCpf, payload)
          : await createAdminGuide(payload)

        setGuidesState((state) => ({
          ...state,
          items: sortGuides(
            editingGuideCpf
              ? state.items.map((item) => (item.cpf === savedGuide.cpf ? savedGuide : item))
              : [...state.items, savedGuide],
          ),
          error: null,
        }))

        setGuideFeedback(
          editingGuideCpf ? 'Guia atualizado com sucesso.' : 'Guia cadastrado com sucesso.',
        )
        resetGuideForm()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível salvar o guia.'
        setGuidesState((state) => ({ ...state, error: message }))
      } finally {
        setIsSavingGuide(false)
      }
    },
    [
      guideForm.cpf,
      guideForm.biography,
      guideForm.certifications,
      guideForm.experienceYears,
      guideForm.featuredTrailId,
      guideForm.isActive,
      guideForm.isFeatured,
      guideForm.languages,
      guideForm.name,
      guideForm.photoUrl,
      guideForm.slug,
      guideForm.speciality,
      guideForm.summary,
      guideForm.trailIds,
      splitList,
      editingGuideCpf,
      sortGuides,
      resetGuideForm,
    ],
  )

  const handleDeleteGuide = useCallback(
    async (guide: AdminGuide) => {
      const confirmed = window.confirm(`Deseja realmente remover o guia ${guide.name}?`)
      if (!confirmed) {
        return
      }

      setGuidesState((state) => ({ ...state, isLoading: true, error: null }))

      try {
        await deleteAdminGuide(guide.cpf)
        setGuidesState((state) => ({
          ...state,
          items: state.items.filter((item) => item.cpf !== guide.cpf),
          isLoading: false,
          error: null,
        }))

        if (editingGuideCpf === guide.cpf) {
          resetGuideForm()
        }

        setGuideFeedback('Guia removido com sucesso.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Não foi possível remover o guia.'
        setGuidesState((state) => ({ ...state, isLoading: false, error: message }))
      }
    },
    [editingGuideCpf, resetGuideForm],
  )

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  const adminData = useMemo<AdminPageData>(() => {
    const bookings = overview
      ? overview.bookings.map((booking) => ({
          id: booking.id,
          cells: {
            protocol: booking.protocol,
            name: booking.contactName,
            trail: booking.trailName,
            date: booking.dateLabel,
            time: booking.timeLabel,
            participants: String(booking.participantsCount),
            guide: booking.guideName ?? '—',
          },
          status: booking.statusTone,
          actions: tableActions,
        }))
      : []

    const participants = overview
      ? overview.participants.map((participant) => ({
          id: participant.id,
          cells: {
            name: participant.name,
            contact: participant.contact,
            trail: participant.trailName,
            datetime: participant.datetimeLabel,
            status: participant.statusTone.label,
          },
          status: participant.statusTone,
          actions: [
            {
              id: 'manage',
              label: 'Gerenciar participante',
              icon: createIcon(
                <>
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    fill="currentColor"
                    opacity="0.82"
                  />
                  <path
                    d="M4 19c0-3 4-4.5 8-4.5s8 1.5 8 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>,
              ),
            },
          ],
        }))
      : []

    const todaysSessions = overview
      ? overview.todaysSessions.map((session) => ({
          id: session.id,
          name: session.trailName,
          schedule: session.scheduleLabel,
          occupancy: session.occupancy,
          capacity: session.capacityLabel,
        }))
      : []

    const upcoming = overview
      ? overview.upcomingEvents.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.dateLabel,
        }))
      : []

    const activities = overview
      ? overview.recentActivity.map((item) => ({
          id: item.id,
          time: item.label,
          text: item.message,
        }))
      : []

    const eventCards = overview
      ? overview.eventCards.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          tag: event.tag ?? event.status ?? 'Atualização',
          tagTone: event.tagTone ?? 'info',
          date: event.dateLabel,
          capacity: event.capacityLabel ?? '—',
        }))
      : []

    const trails = overview
      ? overview.trailCards.map((trail) => {
          const difficultyKey = trail.difficulty as TrailDifficulty
          return {
            id: trail.id,
            name: trail.name,
            difficulty: TRAIL_DIFFICULTY_LABELS[difficultyKey] ?? trail.difficulty,
            duration: formatTrailDuration(trail.durationMinutes),
            capacity: trail.capacityLabel ?? '—',
            status: trail.status,
            description: trail.description,
          }
        })
      : []

    const calendar = overview
      ? {
          title: `${overview.calendar.month} ${overview.calendar.year}`,
          days: overview.calendar.days.map((day, index) => ({
            id: `${day.date}-${index}`,
            date: day.label,
            events: day.events,
          })),
        }
      : {
          title: 'Calendário indisponível',
          days: [],
        }

    const report = overview
      ? {
          metrics: overview.report.reportMetrics,
          lineChart: overview.report.lineChartData,
          pieChart: overview.report.pieChartData,
          barChart: overview.report.barChartData,
        }
      : {
          metrics: [],
          lineChart: [],
          pieChart: [],
          barChart: [],
        }

    return {
      metrics: overview?.metrics ?? [],
      bookingRows: bookings,
      participantRows: participants,
      todaysTrails: todaysSessions,
      upcomingEvents: upcoming,
      recentActivity: activities,
      eventCards,
      trailCards: trails,
      calendar,
      report,
      isLive: Boolean(overview),
      error: overview
        ? null
        : isLoadingOverview
        ? 'Carregando dados em tempo real...'
        : overviewError ?? 'Dados ao vivo indisponíveis no momento.',
    }
  }, [
    isLoadingOverview,
    overview,
    overviewError,
  ])

  const trailsSection: SectionConfig = {
    title: 'Trilhas',
    description: 'Acompanhe status e capacidade das trilhas disponíveis',
    actions: (
      <button
        type="button"
        className="admin-primary-button"
        onClick={handleStartNewTrail}
        disabled={isSavingTrail}
      >
        Nova Trilha
      </button>
    ),
    content: (
      <div className="admin-trails">
        <section className="admin-card admin-trails__form">
          <header className="admin-card__header">
            <h2>{editingTrailId ? 'Editar trilha' : 'Cadastrar trilha'}</h2>
            <span>
              {editingTrailId
                ? 'Atualize informações operacionais, capacidade e guias atribuídos.'
                : 'Preencha os dados para criar uma nova trilha disponível para agendamento.'}
            </span>
          </header>
          <form className="admin-trails__form-fields" onSubmit={handleTrailSubmit}>
            <div className="admin-trails__grid">
              <label>
                Nome da trilha
                <input
                  type="text"
                  value={trailForm.name}
                  onChange={(event) => setTrailForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex.: Trilha das Dunas"
                  required
                />
              </label>
              <label>
                Identificador (slug)
                <input
                  type="text"
                  value={trailForm.slug}
                  onChange={(event) => setTrailForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="ex.: trilha-das-dunas"
                  required
                />
                <small>Utilizado em URLs e integrações com o portal.</small>
              </label>
              <label>
                Status
                <select
                  value={trailForm.status}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, status: event.target.value as TrailStatus }))
                  }
                >
                  <option value="ACTIVE">Ativa</option>
                  <option value="MAINTENANCE">Em manutenção</option>
                  <option value="INACTIVE">Indisponível</option>
                </select>
              </label>
              <label>
                Dificuldade
                <select
                  value={trailForm.difficulty}
                  onChange={(event) =>
                    setTrailForm((prev) => ({
                      ...prev,
                      difficulty: event.target.value as TrailDifficulty,
                    }))
                  }
                >
                  <option value="EASY">Leve</option>
                  <option value="MODERATE">Moderada</option>
                  <option value="HARD">Intensa</option>
                </select>
              </label>
              <label>
                Duração (minutos)
                <input
                  type="number"
                  min={10}
                  value={trailForm.durationMinutes}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Capacidade máxima
                <input
                  type="number"
                  min={1}
                  value={trailForm.maxGroupSize}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, maxGroupSize: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Preço base (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  value={trailForm.basePrice}
                  onChange={(event) => setTrailForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                  placeholder="Ex.: 85,00"
                />
                <small>Deixe em branco para manter o valor configurado no sistema.</small>
              </label>
              <label>
                Selo/Badge
                <input
                  type="text"
                  value={trailForm.badgeLabel}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, badgeLabel: event.target.value }))
                  }
                  placeholder="Ex.: Destaque"
                />
              </label>
              <label>
                Ponto de encontro
                <input
                  type="text"
                  value={trailForm.meetingPoint}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, meetingPoint: event.target.value }))
                  }
                  placeholder="Ex.: Centro de Visitantes"
                />
              </label>
              <label>
                Imagem (URL)
                <input
                  type="url"
                  value={trailForm.imageUrl}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </label>
              <label className="admin-trails__full">
                Resumo (opcional)
                <textarea
                  value={trailForm.summary}
                  onChange={(event) => setTrailForm((prev) => ({ ...prev, summary: event.target.value }))}
                  rows={3}
                  placeholder="Descrição breve utilizada em cards e destaques"
                />
              </label>
              <label className="admin-trails__full">
                Descrição detalhada
                <textarea
                  value={trailForm.description}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={4}
                  placeholder="Explique a experiência, cuidados e atrativos da trilha"
                  required
                />
              </label>
              <label className="admin-trails__full">
                Guias habilitados
                <select
                  multiple
                  value={trailForm.guideCpfs}
                  onChange={handleTrailGuideSelectionChange}
                  size={Math.min(Math.max(trailsState.guides.length, 3), 6)}
                >
                  {trailsState.guides.map((guide) => (
                    <option key={guide.cpf} value={guide.cpf}>
                      {guide.name}
                      {guide.speciality ? ` • ${guide.speciality}` : ''}
                    </option>
                  ))}
                </select>
                <small>Os guias selecionados poderão conduzir sessões desta trilha.</small>
              </label>
              <label className="admin-trails__checkbox">
                <input
                  type="checkbox"
                  checked={trailForm.highlight}
                  onChange={(event) =>
                    setTrailForm((prev) => ({ ...prev, highlight: event.target.checked }))
                  }
                />
                Destacar trilha no dashboard e no portal
              </label>
            </div>
            <div className="admin-trails__form-actions">
              {trailFormError ? (
                <div className="admin-alert admin-alert--error">{trailFormError}</div>
              ) : null}
              <div className="admin-trails__form-buttons">
                <button type="submit" className="admin-primary-button" disabled={isSavingTrail}>
                  {isSavingTrail
                    ? 'Salvando...'
                    : editingTrailId
                    ? 'Salvar alterações'
                    : 'Cadastrar trilha'}
                </button>
                {editingTrailId ? (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={handleStartNewTrail}
                    disabled={isSavingTrail}
                  >
                    Cancelar edição
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </section>
        <div className="admin-trails__side">
          <section className="admin-card admin-trails__stats">
            <header className="admin-card__header">
              <h2>Visão geral das trilhas</h2>
              <span>Capacidade média, destaques e distribuição atual</span>
            </header>
            <div className="admin-card__content">
              {trailsState.stats ? (
                <>
                  <div className="admin-trails__stats-grid">
                    <div className="admin-trails__stat">
                      <strong>Total</strong>
                      <span>{trailsState.stats.total}</span>
                    </div>
                    <div className="admin-trails__stat">
                      <strong>Destaques</strong>
                      <span>{trailsState.stats.highlights}</span>
                    </div>
                    <div className="admin-trails__stat">
                      <strong>Capacidade média</strong>
                      <span>{trailsState.stats.averageCapacity} pessoas</span>
                    </div>
                    <div className="admin-trails__stat">
                      <strong>Próximas sessões</strong>
                      <span>{trailsState.stats.upcomingSessions}</span>
                    </div>
                  </div>
                  <div className="admin-trails__stats-breakdown">
                    <div>
                      <h3>Status</h3>
                      <ul>
                        {(Object.entries(trailsState.stats.byStatus) as Array<[TrailStatus, number]>).map(
                          ([status, value]) => (
                            <li key={status}>
                              <span>{TRAIL_STATUS_LABELS[status]}</span>
                              <strong>{value}</strong>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div>
                      <h3>Dificuldade</h3>
                      <ul>
                        {(
                          Object.entries(trailsState.stats.byDifficulty) as Array<[
                            TrailDifficulty,
                            number,
                          ]>
                        ).map(([difficulty, value]) => (
                          <li key={difficulty}>
                            <span>{TRAIL_DIFFICULTY_LABELS[difficulty]}</span>
                            <strong>{value}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <p className="admin-placeholder">Carregando métricas das trilhas...</p>
              )}
            </div>
          </section>
          <section className="admin-card admin-trails__list">
            <header className="admin-card__header">
              <h2>Trilhas cadastradas</h2>
              <span>Confira status, próximos horários e guias habilitados</span>
            </header>
            <div className="admin-card__content">
              {trailsState.error ? (
                <div className="admin-alert admin-alert--error">{trailsState.error}</div>
              ) : null}
              {trailFeedback ? (
                <div className="admin-alert admin-alert--success">{trailFeedback}</div>
              ) : null}
              {trailsState.isLoading && trailsState.items.length === 0 ? (
                <p className="admin-placeholder">Carregando trilhas cadastradas...</p>
              ) : null}
              {trailsState.isLoading && trailsState.items.length > 0 ? (
                <p className="admin-placeholder">Atualizando lista de trilhas...</p>
              ) : null}
              {!trailsState.isLoading && trailsState.items.length === 0 ? (
                <p className="admin-placeholder">Nenhuma trilha cadastrada até o momento.</p>
              ) : null}
              {trailsState.items.length > 0 ? (
                <ul className="admin-trails__items">
                  {trailsState.items.map((trail) => {
                    const statusTone =
                      trail.status === 'ACTIVE'
                        ? 'success'
                        : trail.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'neutral'
                    const basePriceLabel =
                      trail.basePrice !== null ? currencyFormatter.format(trail.basePrice) : '—'
                    const nextSessionLabel = trail.nextSessionStartsAt
                      ? new Date(trail.nextSessionStartsAt).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : 'Sem agendamentos futuros'
                    const lastSessionLabel = trail.lastSessionStartsAt
                      ? new Date(trail.lastSessionStartsAt).toLocaleDateString('pt-BR')
                      : '—'

                    return (
                      <li key={trail.id} className="admin-trails__item">
                        <div className="admin-trails__item-header">
                          <div>
                            <h3>{trail.name}</h3>
                            <span className="admin-trails__item-slug">{trail.slug}</span>
                          </div>
                          <div className="admin-trails__item-status">
                            {trail.highlight ? (
                              <span className="admin-tag admin-tag--success">Destaque</span>
                            ) : null}
                            <span className={`admin-tag admin-tag--${statusTone}`}>
                              {TRAIL_STATUS_LABELS[trail.status]}
                            </span>
                          </div>
                        </div>
                        <div className="admin-trails__item-body">
                          <p>{trail.summary ?? trail.description}</p>
                          <div className="admin-trails__item-meta">
                            <span>
                              <strong>Dificuldade:</strong> {TRAIL_DIFFICULTY_LABELS[trail.difficulty]}
                            </span>
                            <span>
                              <strong>Duração:</strong> {formatTrailDuration(trail.durationMinutes)}
                            </span>
                            <span>
                              <strong>Capacidade:</strong> {trail.maxGroupSize} pessoas
                            </span>
                            <span>
                              <strong>Preço base:</strong> {basePriceLabel}
                            </span>
                          </div>
                          <div className="admin-trails__item-meta">
                            <span>
                              <strong>Próxima sessão:</strong> {nextSessionLabel}
                            </span>
                            <span>
                              <strong>Última sessão:</strong> {lastSessionLabel}
                            </span>
                            <span>
                              <strong>Agendamentos futuros:</strong> {trail.upcomingSessions}
                            </span>
                          </div>
                          <div className="admin-trails__item-guides">
                            <strong>Guias:</strong>
                            <span>
                              {trail.guides.length
                                ? trail.guides
                                    .map((guide) => `${guide.name}${guide.isActive ? '' : ' (inativo)'}`)
                                    .join(', ')
                                : 'Nenhum guia vinculado'}
                            </span>
                          </div>
                        </div>
                        <div className="admin-trails__item-actions">
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => handleEditTrail(trail)}
                            disabled={isSavingTrail}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="admin-secondary-button admin-secondary-button--danger"
                            onClick={() => handleDeleteTrail(trail)}
                            disabled={trailsState.isLoading}
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    ),
  }

  const guidesSection: SectionConfig = {
    title: 'Guias',
    description: 'Gerencie disponibilidade, trilhas qualificadas e destaque de guias do parque',
    actions: (
      <div className="admin-guides__actions">
        <button
          type="button"
          className="admin-secondary-button"
          onClick={handleOpenInviteModal}
          disabled={isGeneratingInvite}
        >
          Gerar convite
        </button>
        <button
          type="button"
          className="admin-primary-button"
          onClick={handleStartNewGuide}
          disabled={isSavingGuide}
        >
          Novo Guia
        </button>
      </div>
    ),
    content: (
      <div className="admin-guides">
        <section className="admin-card admin-guides__form">
          <header className="admin-card__header">
            <h2>{editingGuideCpf ? 'Editar guia' : 'Cadastrar guia'}</h2>
            <span>
              {editingGuideCpf
                ? 'Atualize as informações e a disponibilidade do guia selecionado.'
                : 'Preencha os dados para registrar um novo guia credenciado.'}
            </span>
          </header>
          <form className="admin-guides__form-fields" onSubmit={handleGuideSubmit}>
            <div className="admin-guides__grid">
              <label>
                CPF do guia
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={formatCpfForInput(guideForm.cpf)}
                  onChange={(event) =>
                    setGuideForm((prev) => ({ ...prev, cpf: sanitizeCpf(event.target.value) }))
                  }
                  disabled={Boolean(editingGuideCpf)}
                  required
                />
                <small>Utilizado como identificador único no sistema.</small>
              </label>
              <label>
                Nome do guia
                <input
                  type="text"
                  value={guideForm.name}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex.: Maria Santos"
                  required
                />
              </label>
              <label>
                Identificador (slug)
                <input
                  type="text"
                  value={guideForm.slug}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, slug: event.target.value }))}
                  placeholder="Ex.: maria-santos"
                  required
                />
                <small>Utilizado em URLs e integrações externas.</small>
              </label>
              <label>
                Especialidade
                <input
                  type="text"
                  value={guideForm.speciality}
                  onChange={(event) =>
                    setGuideForm((prev) => ({ ...prev, speciality: event.target.value }))
                  }
                  placeholder="Ex.: Educação ambiental"
                />
              </label>
              <label>
                Anos de experiência
                <input
                  type="number"
                  min={0}
                  value={guideForm.experienceYears}
                  onChange={(event) =>
                    setGuideForm((prev) => ({ ...prev, experienceYears: event.target.value }))
                  }
                />
              </label>
              <label className="admin-guides__full">
                Resumo
                <textarea
                  value={guideForm.summary}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, summary: event.target.value }))}
                  placeholder="Descrição breve apresentada nos cartões públicos"
                  rows={3}
                />
              </label>
              <label className="admin-guides__full">
                Biografia
                <textarea
                  value={guideForm.biography}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, biography: event.target.value }))}
                  placeholder="Conte a história e diferenciais do guia"
                  rows={4}
                />
              </label>
              <label>
                Idiomas (separados por vírgula)
                <input
                  type="text"
                  value={guideForm.languages}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, languages: event.target.value }))}
                  placeholder="Português, Inglês"
                />
              </label>
              <label>
                Certificações (separadas por vírgula)
                <input
                  type="text"
                  value={guideForm.certifications}
                  onChange={(event) =>
                    setGuideForm((prev) => ({ ...prev, certifications: event.target.value }))
                  }
                  placeholder="Primeiros socorros, Condução ambiental"
                />
              </label>
              <label>
                Foto (URL)
                <input
                  type="url"
                  value={guideForm.photoUrl}
                  onChange={(event) => setGuideForm((prev) => ({ ...prev, photoUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </label>
              <div className="admin-guides__toggles">
                <label className="admin-guides__checkbox">
                  <input
                    type="checkbox"
                    checked={guideForm.isFeatured}
                    onChange={(event) =>
                      setGuideForm((prev) => ({ ...prev, isFeatured: event.target.checked }))
                    }
                  />
                  <span>Destacar guia nas páginas públicas</span>
                </label>
                <label className="admin-guides__checkbox">
                  <input
                    type="checkbox"
                    checked={guideForm.isActive}
                    onChange={(event) =>
                      setGuideForm((prev) => ({ ...prev, isActive: event.target.checked }))
                    }
                  />
                  <span>Guia ativo para agendamentos</span>
                </label>
              </div>
              <label className="admin-guides__full">
                Trilhas habilitadas
                <select
                  multiple
                  value={guideForm.trailIds}
                  onChange={handleTrailSelectionChange}
                  size={Math.min(Math.max(guidesState.trails.length, 4), 8)}
                >
                  {guidesState.trails.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trilha destaque
                <select
                  value={guideForm.featuredTrailId}
                  onChange={(event) =>
                    setGuideForm((prev) => ({ ...prev, featuredTrailId: event.target.value }))
                  }
                  disabled={guidesState.trails.length === 0}
                >
                  <option value="">Nenhuma</option>
                  {guidesState.trails.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.name}
                    </option>
                  ))}
                </select>
                <small>Quando preenchido, o guia será exibido como destaque nessa trilha.</small>
              </label>
            </div>
            <div className="admin-guides__form-actions">
              {editingGuideCpf ? (
                <button type="button" className="admin-secondary-button" onClick={handleStartNewGuide}>
                  Cancelar edição
                </button>
              ) : null}
              <button type="submit" className="admin-primary-button" disabled={isSavingGuide}>
                {isSavingGuide
                  ? 'Salvando...'
                  : editingGuideCpf
                  ? 'Salvar alterações'
                  : 'Cadastrar guia'}
              </button>
            </div>
          </form>
        </section>
        <section className="admin-card admin-guides__list">
          <header className="admin-card__header">
            <h2>Guias cadastrados</h2>
            <span>Acompanhe especialistas habilitados e suas trilhas qualificadas.</span>
          </header>
          <div className="admin-card__content">
            {guidesState.error ? (
              <div className="admin-alert admin-alert--error">{guidesState.error}</div>
            ) : null}
            {guideFeedback ? (
              <div className="admin-alert admin-alert--success">{guideFeedback}</div>
            ) : null}
            {guidesState.isLoading && guidesState.items.length > 0 ? (
              <p className="admin-placeholder">Atualizando lista de guias...</p>
            ) : null}
            {guidesState.isLoading && guidesState.items.length === 0 ? (
              <p className="admin-placeholder">Carregando guias cadastrados...</p>
            ) : null}
            {!guidesState.isLoading && guidesState.items.length === 0 ? (
              <p className="admin-placeholder">Nenhum guia cadastrado até o momento.</p>
            ) : null}
            {guidesState.items.length > 0 ? (
              <ul className="admin-guides__items">
                {guidesState.items.map((guide) => (
                  <li key={guide.cpf} className="admin-guides__item">
                    <div className="admin-guides__item-header">
                      <div>
                        <h3>{guide.name}</h3>
                        <span className="admin-guides__item-id">CPF: {formatCpf(guide.cpf)}</span>
                        <span className="admin-guides__item-slug">Slug: {guide.slug}</span>
                      </div>
                      <div className="admin-guides__item-status">
                        {guide.isFeatured ? (
                          <span className="admin-tag admin-tag--success">Destaque</span>
                        ) : null}
                        {!guide.isActive ? (
                          <span className="admin-tag admin-tag--warning">Inativo</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="admin-guides__item-body">
                      {guide.speciality ? (
                        <p className="admin-guides__item-speciality">
                          <strong>Especialidade:</strong> {guide.speciality}
                        </p>
                      ) : null}
                      {guide.summary ? (
                        <p className="admin-guides__item-summary">{guide.summary}</p>
                      ) : null}
                      <div className="admin-guides__item-meta">
                        <span>
                          <strong>Idiomas:</strong>{' '}
                          {guide.languages.length ? guide.languages.join(', ') : '—'}
                        </span>
                        <span>
                          <strong>Experiência:</strong>{' '}
                          {`${guide.experienceYears} ano${guide.experienceYears === 1 ? '' : 's'}`}
                        </span>
                      </div>
                      <div className="admin-guides__item-trails">
                        <strong>Trilhas:</strong>
                        <span>
                          {guide.trails.length
                            ? guide.trails.map((trail) => trail.name).join(', ')
                            : 'Nenhuma trilha atribuída'}
                        </span>
                      </div>
                      {guide.featuredTrail ? (
                        <div className="admin-guides__item-featured">
                          <strong>Trilha destaque:</strong> {guide.featuredTrail.name}
                        </div>
                      ) : null}
                    </div>
                    <div className="admin-guides__item-actions">
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => handleEditGuide(guide)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-secondary-button admin-secondary-button--danger"
                        onClick={() => handleDeleteGuide(guide)}
                        disabled={guidesState.isLoading}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>
    ),
  }

  const section = useMemo(
    () =>
      buildSection({
        key: activeSection,
        data: adminData,
        trailsSection,
        guidesSection,
        bookingActionFeedback,
        onOpenBookingModal: handleOpenBookingModal,
        onBookingTableAction: handleBookingTableAction,
        onParticipantTableAction: handleParticipantTableAction,
        onOpenEventModal: handleOpenEventModal,
      }),
    [
      activeSection,
      adminData,
      trailsSection,
      guidesSection,
      bookingActionFeedback,
      handleOpenBookingModal,
      handleBookingTableAction,
      handleParticipantTableAction,
      handleOpenEventModal,
    ],
  )

  return (
    <AdminLayout
      sections={sidebarSections}
      activeSection={activeSection}
      onSelectSection={(id) => {
        if (isSectionKey(id)) {
          setActiveSection(id)
        }
      }}
      header={{ title: section.title, description: section.description, actions: section.actions }}
    >
      {section.content}
      {isBookingModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
          <div className="admin-modal__backdrop" aria-hidden="true" onClick={handleCloseBookingModal} />
          <div className="admin-modal__dialog admin-modal__dialog--wide" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseBookingModal}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="booking-modal-title">Novo agendamento</h2>
              <p>Cadastre uma reserva vinculada a uma trilha ou sessão existente.</p>
            </header>
            <form className="admin-modal__form" onSubmit={handleBookingSubmit}>
              <div className="admin-modal__body admin-modal__body--scroll">
                {bookingFormError ? <div className="admin-modal__error">{bookingFormError}</div> : null}
                <label>
                  Trilha
                  <select
                    value={bookingForm.trailId}
                    onChange={(event) => handleBookingFormFieldChange('trailId', event.target.value)}
                    required
                  >
                    <option value="">Selecione uma trilha</option>
                    {trailsState.items.map((trail) => (
                      <option key={trail.id} value={trail.id}>
                        {trail.name}
                      </option>
                    ))}
                  </select>
                  {trailsState.error ? (
                    <small className="admin-modal__hint">{trailsState.error}</small>
                  ) : null}
                </label>
                <label>
                  Sessão existente
                  <select
                    value={bookingForm.sessionId}
                    onChange={(event) => handleBookingFormFieldChange('sessionId', event.target.value)}
                    disabled={!selectedBookingTrail}
                  >
                    <option value="">Criar nova sessão manualmente</option>
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {`${formatDateLabel(session.startsAt)} • ${formatTimeLabel(session.startsAt)} (${session.capacity} vagas)`}
                      </option>
                    ))}
                  </select>
                  <small className="admin-modal__hint">
                    Ao selecionar uma sessão, o agendamento utilizará as vagas disponíveis automaticamente.
                  </small>
                </label>
                {selectedBookingSession ? (
                  <p className="admin-modal__hint">
                    Capacidade da sessão: {selectedBookingSession.capacity} vagas. Status atual: {selectedBookingSession.status.toLowerCase()}.
                  </p>
                ) : null}
                <label>
                  Guia responsável
                  <select
                    value={bookingForm.guideCpf}
                    onChange={(event) => handleBookingFormFieldChange('guideCpf', event.target.value)}
                  >
                    <option value="">Definir posteriormente</option>
                    {availableGuidesForTrail.map((guide) => (
                      <option key={guide.cpf} value={guide.cpf}>
                        {guide.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nome do responsável
                  <input
                    type="text"
                    value={bookingForm.contactName}
                    onChange={(event) => handleBookingFormFieldChange('contactName', event.target.value)}
                    required
                  />
                </label>
                <label>
                  E-mail de contato
                  <input
                    type="email"
                    value={bookingForm.contactEmail}
                    onChange={(event) => handleBookingFormFieldChange('contactEmail', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Telefone
                  <input
                    type="tel"
                    value={bookingForm.contactPhone}
                    onChange={(event) => handleBookingFormFieldChange('contactPhone', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Data desejada
                  <input
                    type="date"
                    value={bookingForm.scheduledDate}
                    onChange={(event) => handleBookingFormFieldChange('scheduledDate', event.target.value)}
                    disabled={Boolean(bookingForm.sessionId)}
                    required={!bookingForm.sessionId}
                  />
                </label>
                <label>
                  Horário previsto
                  <input
                    type="time"
                    value={bookingForm.scheduledTime}
                    onChange={(event) => handleBookingFormFieldChange('scheduledTime', event.target.value)}
                    disabled={Boolean(bookingForm.sessionId)}
                  />
                </label>
                <label>
                  Quantidade de participantes
                  <input
                    type="number"
                    min={1}
                    value={bookingForm.participantsCount}
                    onChange={(event) => handleBookingFormFieldChange('participantsCount', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Observações
                  <textarea
                    rows={3}
                    value={bookingForm.notes}
                    onChange={(event) => handleBookingFormFieldChange('notes', event.target.value)}
                    placeholder="Informações relevantes para a equipe operacional"
                  />
                </label>
                <div className="admin-modal__section">
                  <div className="admin-modal__section-header">
                    <h3>Acompanhantes</h3>
                    <button type="button" className="admin-secondary-button" onClick={handleAddBookingParticipant}>
                      Adicionar participante
                    </button>
                  </div>
                  {bookingForm.participants.length === 0 ? (
                    <p className="admin-empty-state">Nenhum acompanhante cadastrado.</p>
                  ) : (
                    bookingForm.participants.map((participant, index) => (
                      <div key={participant.id} className="admin-modal__inline-fields">
                        <label>
                          Nome completo
                          <input
                            type="text"
                            value={participant.fullName}
                            onChange={(event) =>
                              handleUpdateBookingParticipant(index, 'fullName', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          CPF
                          <input
                            type="text"
                            value={participant.cpf}
                            onChange={(event) =>
                              handleUpdateBookingParticipant(index, 'cpf', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          E-mail
                          <input
                            type="email"
                            value={participant.email}
                            onChange={(event) =>
                              handleUpdateBookingParticipant(index, 'email', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          Telefone
                          <input
                            type="tel"
                            value={participant.phone}
                            onChange={(event) =>
                              handleUpdateBookingParticipant(index, 'phone', event.target.value)
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="admin-secondary-button admin-secondary-button--danger"
                          onClick={() => handleRemoveBookingParticipant(index)}
                        >
                          Remover
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <footer className="admin-modal__actions">
                <button type="button" className="admin-secondary-button" onClick={handleCloseBookingModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-button" disabled={isSavingBooking}>
                  {isSavingBooking ? 'Registrando...' : 'Registrar agendamento'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
      {selectedBookingId ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="booking-detail-title">
          <div className="admin-modal__backdrop" aria-hidden="true" onClick={handleCloseBookingDetail} />
          <div className="admin-modal__dialog admin-modal__dialog--wide" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseBookingDetail}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="booking-detail-title">Detalhes do agendamento</h2>
              <p>Visualize informações de contato, status e participantes cadastrados.</p>
            </header>
            <div className="admin-modal__body admin-modal__body--scroll">
              {isLoadingBookingDetail ? (
                <p className="admin-empty-state">Carregando detalhes do agendamento...</p>
              ) : bookingDetail ? (
                <>
                  <div className="admin-detail-list">
                    <div>
                      <dt>Protocolo</dt>
                      <dd>{bookingDetail.protocol}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        <span className={`admin-status admin-status--${bookingDetail.statusTone.tone || 'info'}`}>
                          {bookingDetail.statusTone.label}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt>Trilha</dt>
                      <dd>{bookingDetail.trail.name}</dd>
                    </div>
                    <div>
                      <dt>Guia</dt>
                      <dd>{bookingDetail.guide?.name ?? 'A definir'}</dd>
                    </div>
                    <div>
                      <dt>Data agendada</dt>
                      <dd>
                        {formatDateLabel(bookingDetail.scheduledFor)} • {formatTimeLabel(bookingDetail.scheduledFor)}
                      </dd>
                    </div>
                    <div>
                      <dt>Contato</dt>
                      <dd>
                        {bookingDetail.contactName}
                        <br />
                        <small>{bookingDetail.contactEmail}</small>
                        <br />
                        <small>{bookingDetail.contactPhone}</small>
                      </dd>
                    </div>
                  </div>
                  {bookingDetail.notes ? (
                    <p className="admin-modal__hint">Observações: {bookingDetail.notes}</p>
                  ) : null}
                  <div className="admin-modal__section">
                    <h3>Participantes</h3>
                    <ul className="admin-modal__list">
                      {bookingDetail.participants.map((participant) => (
                        <li key={participant.id} className="admin-modal__list-item">
                          <strong>{participant.fullName}</strong>
                          <small>
                            {participant.email ? `${participant.email} • ` : ''}
                            {participant.phone ?? 'Sem telefone informado'}
                          </small>
                          {participant.isBanned ? (
                            <span className="admin-status admin-status--danger">Banido</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="admin-modal__error">
                  {bookingDetailError ?? 'Não foi possível carregar o agendamento selecionado.'}
                </div>
              )}
            </div>
            <footer className="admin-modal__actions">
              <button type="button" className="admin-secondary-button" onClick={handleCloseBookingDetail}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      ) : null}
      {selectedParticipantId ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="participant-detail-title">
          <div
            className="admin-modal__backdrop"
            aria-hidden="true"
            onClick={handleCloseParticipantDetail}
          />
          <div className="admin-modal__dialog" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseParticipantDetail}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="participant-detail-title">Participante</h2>
              <p>Gerencie o histórico e o status do visitante selecionado.</p>
            </header>
            <div className="admin-modal__body">
              {isLoadingParticipantDetail ? (
                <p className="admin-empty-state">Carregando informações do participante...</p>
              ) : participantDetail ? (
                <>
                  <div className="admin-detail-list">
                    <div>
                      <dt>Nome</dt>
                      <dd>{participantDetail.fullName}</dd>
                    </div>
                    <div>
                      <dt>CPF</dt>
                      <dd>{participantDetail.cpf ?? 'Não informado'}</dd>
                    </div>
                    <div>
                      <dt>Contato</dt>
                      <dd>
                        {participantDetail.email ?? 'Sem e-mail registrado'}
                        <br />
                        <small>{participantDetail.phone ?? 'Sem telefone registrado'}</small>
                      </dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        <span className={`admin-status admin-status--${participantDetail.isBanned ? 'danger' : participantDetail.booking.statusTone.tone}`}>
                          {participantDetail.isBanned ? 'Banido' : participantDetail.booking.statusTone.label}
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="admin-modal__section">
                    <h3>Agendamento atual</h3>
                    <div className="admin-detail-list">
                      <div>
                        <dt>Protocolo</dt>
                        <dd>{participantDetail.booking.protocol}</dd>
                      </div>
                      <div>
                        <dt>Trilha</dt>
                        <dd>{participantDetail.booking.trail.name}</dd>
                      </div>
                      <div>
                        <dt>Data</dt>
                        <dd>{participantDetail.booking.scheduledForLabel}</dd>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="admin-modal__error">
                  {participantDetailError ?? 'Não foi possível carregar o participante selecionado.'}
                </div>
              )}
            </div>
            <footer className="admin-modal__actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCloseParticipantDetail}
              >
                Fechar
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCreateBookingFromParticipant}
                disabled={!participantDetail}
              >
                Novo agendamento
              </button>
              <button
                type="button"
                className="admin-secondary-button admin-secondary-button--danger"
                onClick={handleToggleParticipantBan}
                disabled={!participantDetail || isUpdatingParticipant}
              >
                {participantDetail?.isBanned ? 'Reativar participante' : 'Banir participante'}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
      {isEventModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
          <div className="admin-modal__backdrop" aria-hidden="true" onClick={handleCloseEventModal} />
          <div className="admin-modal__dialog admin-modal__dialog--wide" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseEventModal}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="event-modal-title">Novo evento</h2>
              <p>Divulgue atividades especiais do parque diretamente no painel administrativo.</p>
            </header>
            <form className="admin-modal__form" onSubmit={handleEventSubmit}>
              <div className="admin-modal__body admin-modal__body--scroll">
                {eventFormError ? <div className="admin-modal__error">{eventFormError}</div> : null}
                <label>
                  Título
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Identificador (slug)
                  <input
                    type="text"
                    value={eventForm.slug}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, slug: event.target.value }))}
                    onBlur={() =>
                      setEventForm((prev) => ({
                        ...prev,
                        slug: prev.slug ? slugify(prev.slug) : slugify(prev.title),
                      }))
                    }
                    placeholder="ex.: festival-de-trilhas"
                  />
                </label>
                <label>
                  Descrição
                  <textarea
                    rows={4}
                    value={eventForm.description}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Local
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
                    placeholder="Centro de visitantes, anfiteatro..."
                  />
                </label>
                <label>
                  Data de início
                  <input
                    type="date"
                    value={eventForm.startsAtDate}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, startsAtDate: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Horário de início
                  <input
                    type="time"
                    value={eventForm.startsAtTime}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, startsAtTime: event.target.value }))}
                  />
                </label>
                <label>
                  Data de término
                  <input
                    type="date"
                    value={eventForm.endsAtDate}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, endsAtDate: event.target.value }))}
                  />
                </label>
                <label>
                  Horário de término
                  <input
                    type="time"
                    value={eventForm.endsAtTime}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, endsAtTime: event.target.value }))}
                  />
                </label>
                <label>
                  Capacidade máxima
                  <input
                    type="number"
                    min={1}
                    value={eventForm.capacity}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, capacity: event.target.value }))}
                    placeholder="Opcional"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={eventForm.status}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, status: event.target.value as EventFormState['status'] }))
                    }
                  >
                    <option value="DRAFT">Rascunho</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="CANCELLED">Cancelado</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </label>
                <label className="admin-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={eventForm.highlight}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, highlight: event.target.checked }))}
                  />
                  Destacar evento no dashboard
                </label>
              </div>
              <footer className="admin-modal__actions">
                <button type="button" className="admin-secondary-button" onClick={handleCloseEventModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-primary-button" disabled={isSavingEvent}>
                  {isSavingEvent ? 'Salvando...' : 'Salvar evento'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
      {isInviteModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
          <div className="admin-modal__backdrop" aria-hidden="true" onClick={handleCloseInviteModal} />
          <div className="admin-modal__dialog" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseInviteModal}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="invite-modal-title">Gerar convite de acesso</h2>
              <p>Envie um token para colaboradores, administradores ou guias ativarem o acesso.</p>
            </header>
            <form className="admin-modal__form" onSubmit={handleGenerateInvite}>
              <div className="admin-modal__body">
                {inviteError ? <div className="admin-modal__error">{inviteError}</div> : null}
                <label>
                  CPF do convidado
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={formatCpfForInput(inviteCpf)}
                    onChange={(event) => setInviteCpf(sanitizeCpf(event.target.value))}
                    disabled={isGeneratingInvite}
                    required
                  />
                </label>
                <label>
                  Tipo de acesso
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as 'A' | 'C' | 'G')}
                    disabled={isGeneratingInvite}
                  >
                    <option value="A">Administrador</option>
                    <option value="C">Colaborador</option>
                    <option value="G">Guia</option>
                  </select>
                  <small>Apenas administradores podem gerar convites.</small>
                </label>
                {inviteResult ? (
                  <div className="admin-modal__result">
                    <p>
                      Compartilhe o token com {INVITE_ROLE_LABELS[inviteResult.tipo].toLowerCase()} registrado no CPF{' '}
                      <strong>{formatCpf(inviteResult.cpf)}</strong>.
                    </p>
                    <div className="admin-modal__token">
                      <code>{inviteResult.token}</code>
                      {inviteExpiryLabel ? <span>Válido até {inviteExpiryLabel}</span> : null}
                    </div>
                  </div>
                ) : (
                  <p className="admin-modal__hint">Preencha os dados e gere um novo código de convite.</p>
                )}
              </div>
              <footer className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseInviteModal}
                  disabled={isGeneratingInvite}
                >
                  Fechar
                </button>
                <button type="submit" className="admin-primary-button" disabled={isGeneratingInvite}>
                  {isGeneratingInvite ? 'Gerando...' : 'Gerar convite'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}

export default AdminPage
