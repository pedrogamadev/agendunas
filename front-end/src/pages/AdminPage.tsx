import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import AdminLayout, { type AdminSection } from '../components/admin/AdminLayout'
import MetricCard, { type MetricCardProps } from '../components/admin/MetricCard'
import AdminSessionWizard, {
  type SessionWizardFormState,
  type SessionWizardStep,
  INITIAL_SESSION_WIZARD_FORM,
  SESSION_WIZARD_STEPS,
} from '../components/admin/AdminSessionWizard'
import {
  fetchAdminOverview,
  fetchAdminGuides,
  fetchAdminTrails,
  fetchAdminTrailSessions,
  fetchAdminParticipant,
  fetchAdminTrailSessionParticipants,
  createAdminGuide,
  createAdminTrail,
  createAdminInvite,
  createAdminEvent,
  updateAdminGuide,
  updateAdminTrail,
  updateAdminParticipant,
  deleteAdminGuide,
  deleteAdminTrail,
  type AdminOverview,
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
  type AdminTrailSession,
  type TrailDifficulty,
  type TrailSessionStatus,
  type TrailStatus,
} from '../api/admin'
import { formatCpf, formatCpfForInput, sanitizeCpf } from '../utils/cpf'
import './AdminPage.css'

const sessionWizardStepLabels: Record<SessionWizardStep, string> = {
  trail: 'Trilha',
  date: 'Data',
  time: 'Horário',
  guide: 'Guia',
  phone: 'Telefone',
  capacity: 'Vagas',
}

const sessionWizardStepDescriptions: Record<SessionWizardStep, string> = {
  trail: 'Selecione a trilha que receberá a nova turma.',
  date: 'Informe o dia para publicação da sessão.',
  time: 'Defina o horário de encontro do grupo.',
  guide: 'Associe o guia responsável pela condução.',
  phone: 'Confirme o telefone direto do guia escolhido.',
  capacity: 'Estabeleça o limite de participantes.',
}

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

const SESSION_STATUS_LABELS: Record<
  TrailSessionStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> = {
  SCHEDULED: { label: 'Agendada', tone: 'success' },
  COMPLETED: { label: 'Concluída', tone: 'info' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
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

type MessageTemplateId = 'confirmation' | 'reminder' | 'cancellation'

const DEFAULT_MESSAGE_TEMPLATES: Record<MessageTemplateId, string> = {
  confirmation:
    'Olá {nome}!\nSeu agendamento está confirmado para {data} às {hora}.\nTrilha: {trilha}\nProtocolo: {protocolo}.',
  reminder:
    'Olá {nome}!\nEstamos animados para a sua visita em {data}, às {hora}.\nTrilha: {trilha}. Qualquer dúvida fale com a gente!',
  cancellation:
    'Olá {nome}.\nInformamos que o agendamento (protocolo {protocolo}) para {data} às {hora}, na trilha {trilha}, foi cancelado.\nSe precisar, entre em contato conosco.',
}

const MESSAGE_TEMPLATE_METADATA: Array<{
  id: MessageTemplateId
  label: string
  description: string
}> = [
  {
    id: 'confirmation',
    label: 'Template de Confirmação',
    description: 'Utilizado para confirmar data, horário e trilha com o visitante.',
  },
  {
    id: 'reminder',
    label: 'Template de Lembrete',
    description: 'Mensagem para relembrar os detalhes do passeio antes da visita.',
  },
  {
    id: 'cancellation',
    label: 'Template de Cancelamento',
    description: 'Mensagem para comunicar cancelamentos e próximos passos.',
  },
]

type WhatsappDialogState = {
  participantId: string
  participantName: string
  phone: string
  templateId: MessageTemplateId
  message: string
  variables: Record<string, string>
}

const applyMessageVariables = (template: string, variables: Record<string, string>) => {
  return Object.entries(variables).reduce((text, [key, value]) => {
    const pattern = new RegExp(`\\{${key}\\}`, 'gi')
    return text.replace(pattern, value)
  }, template)
}

const sanitizePhoneNumber = (value: string) => value.replace(/\D/g, '')

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
    label: 'Criar turma',
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
  sessionWizardFeedback: { message: string; tone: 'success' | 'error' } | null
  onOpenSessionWizard: () => void
  onParticipantTableAction: (rowId: string, actionId: string) => void
  onOpenEventModal: () => void
  trailOptions: AdminTrail[]
  isLoadingTrails: boolean
  trailError: string | null
  sessionsState: {
    trailId: string
    sessions: AdminTrailSession[]
    isLoading: boolean
    error: string | null
    expandedSessionId: string | null
    isInitialized: boolean
  }
  sessionParticipantsError: string | null
  onSelectSessionsTrail: (event: ChangeEvent<HTMLSelectElement>) => void
  onRefreshSessions: () => void
  onToggleSessionParticipants: (sessionId: string) => void
  messageTemplates: Record<MessageTemplateId, string>
  onUpdateMessageTemplate: (
    updater: (previous: Record<MessageTemplateId, string>) => Record<MessageTemplateId, string>,
  ) => void
}

const buildSection = ({
  key,
  data,
  trailsSection,
  guidesSection,
  sessionWizardFeedback,
  onOpenSessionWizard,
  onParticipantTableAction,
  onOpenEventModal,
  trailOptions,
  isLoadingTrails,
  trailError,
  sessionsState,
  sessionParticipantsError,
  onSelectSessionsTrail,
  onRefreshSessions,
  onToggleSessionParticipants,
  messageTemplates,
  onUpdateMessageTemplate,
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
        title: 'Criar turma',
        description: 'Publique novas turmas e monitore a disponibilidade em tempo real',
        actions: (
          <button type="button" className="admin-primary-button" onClick={onOpenSessionWizard}>
            Iniciar fluxo de criação
          </button>
        ),
        content: (
          <div className="admin-session-control">
            {sessionWizardFeedback ? (
              <div
                className={`admin-alert admin-alert--${
                  sessionWizardFeedback.tone === 'success' ? 'success' : 'error'
                }`}
              >
                {sessionWizardFeedback.message}
              </div>
            ) : null}
            <section className="admin-card admin-session-control__hero">
              <header className="admin-card__header">
                <h2>Fluxo guiado de criação</h2>
                <span>
                  Avance pelas etapas para configurar trilha, data, horário, guia, telefone e vagas antes de publicar.
                </span>
              </header>
              <div className="admin-session-control__steps">
                {SESSION_WIZARD_STEPS.map((wizardStep, index) => (
                  <div key={wizardStep} className="admin-session-control__step">
                    <span className="admin-session-control__step-index">{index + 1}</span>
                    <div className="admin-session-control__step-body">
                      <strong>{sessionWizardStepLabels[wizardStep]}</strong>
                      <span>{sessionWizardStepDescriptions[wizardStep]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="admin-primary-button" onClick={onOpenSessionWizard}>
                Abrir wizard de turma
              </button>
            </section>
            <div className="admin-grid admin-grid--two admin-session-control__grid">
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Turmas do dia</h2>
                  <span>Ocupação das próximas saídas publicadas</span>
                </header>
                <div className="admin-card__content">
                  {data.todaysTrails.length > 0 ? (
                    <ul className="admin-session-control__list">
                      {data.todaysTrails.map((trail) => (
                        <li key={trail.id}>
                          <div className="admin-session-control__list-header">
                            <strong>{trail.name}</strong>
                            <span>{trail.schedule}</span>
                          </div>
                          <div className="admin-session-control__list-meta">
                            <span>{trail.capacity}</span>
                            <span>{trail.occupancy}%</span>
                          </div>
                          <div className="admin-session-control__progress" aria-hidden="true">
                            <div
                              className="admin-session-control__progress-bar"
                              style={{ width: `${Math.min(100, Math.max(0, trail.occupancy))}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-session-control__placeholder">
                      Ainda não há turmas programadas para hoje.
                    </p>
                  )}
                </div>
              </section>
              <section className="admin-card">
                <header className="admin-card__header">
                  <h2>Resumo das trilhas</h2>
                  <span>Destaques de disponibilidade e status geral</span>
                </header>
                <div className="admin-card__content admin-session-control__summary">
                  {data.trailCards.length > 0 ? (
                    <ul>
                      {data.trailCards.slice(0, 4).map((trail) => (
                        <li key={trail.id}>
                          <div className="admin-session-control__summary-header">
                            <strong>{trail.name}</strong>
                            <span>{trail.status}</span>
                          </div>
                          <p>{trail.description}</p>
                          <div className="admin-session-control__summary-meta">
                            <span>{trail.difficulty}</span>
                            <span>{trail.duration}</span>
                            <span>{trail.capacity}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-session-control__placeholder">
                      Cadastre trilhas para acompanhar um panorama de disponibilidade.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        ),
      }
    case 'participantes':
      return {
        title: 'Turmas e Participantes',
        description: 'Visualize as sessões publicadas e os participantes de cada turma',
        actions: (
          <>
            <button type="button" className="admin-secondary-button" disabled>
              Importar Participantes
            </button>
            <button
              type="button"
              className="admin-primary-button"
              onClick={onRefreshSessions}
              disabled={sessionsState.isLoading}
            >
              Atualizar turmas
            </button>
          </>
        ),
        content: (
          <div className="admin-section">
            <div className="admin-filters">
              <label>
                Trilha
                <select
                  value={sessionsState.trailId || 'all'}
                  onChange={onSelectSessionsTrail}
                  disabled={isLoadingTrails || trailOptions.length === 0}
                >
                  <option value="all">Todas as trilhas</option>
                  {trailOptions.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {trailError && trailOptions.length === 0 ? (
              <div className="admin-alert admin-alert--error">{trailError}</div>
            ) : null}
            {sessionsState.error ? (
              <div className="admin-alert admin-alert--error">{sessionsState.error}</div>
            ) : null}
            {sessionsState.isLoading ? (
              <p className="admin-placeholder">Carregando turmas publicadas...</p>
            ) : null}
            {!sessionsState.isLoading && sessionsState.sessions.length === 0 ? (
              <p className="admin-placeholder">
                {sessionsState.trailId === 'all'
                  ? 'Nenhuma turma encontrada nas trilhas cadastradas.'
                  : 'Nenhuma turma encontrada para a trilha selecionada.'}
              </p>
            ) : null}
            <div className="admin-session-list">
              {[...sessionsState.sessions]
                .sort(
                  (a, b) =>
                    new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
                )
                .map((session) => {
                const statusTone =
                  SESSION_STATUS_LABELS[session.status] ?? {
                    label: session.status,
                    tone: 'info',
                  }
                const isExpanded = sessionsState.expandedSessionId === session.id
                const guideName = session.primaryGuide?.name ?? 'A definir'

                return (
                  <article key={session.id} className="admin-session-card">
                    <header className="admin-session-card__header">
                      <div>
                        <h3>{session.trailName ?? 'Turma'}</h3>
                        <span className="admin-session-card__identifier">ID: {session.id}</span>
                      </div>
                      <span className={`admin-tag admin-tag--${statusTone.tone}`}>
                        {statusTone.label}
                      </span>
                    </header>
                    <dl className="admin-session-card__details">
                      <div>
                        <dt>Início</dt>
                        <dd>
                          {formatDateLabel(session.startsAt)} • {formatTimeLabel(session.startsAt)}
                        </dd>
                      </div>
                      <div>
                        <dt>Guia responsável</dt>
                        <dd>{guideName}</dd>
                      </div>
                      <div>
                        <dt>Vagas</dt>
                        <dd>
                          {session.totalParticipants} / {session.capacity} ocupadas •{' '}
                          {session.availableSpots} disponíveis
                        </dd>
                      </div>
                    </dl>
                    {session.meetingPoint ? (
                      <p className="admin-session-card__meeting-point">
                        <strong>Ponto de encontro:</strong> {session.meetingPoint}
                      </p>
                    ) : null}
                    <div className="admin-session-card__progress">
                      <div className="admin-progress">
                        <div
                          className="admin-progress__bar"
                          style={{ width: `${session.occupancyPercentage}%` }}
                        />
                      </div>
                      <span>{session.occupancyPercentage}% de ocupação</span>
                    </div>
                    <div className="admin-session-card__actions">
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => onToggleSessionParticipants(session.id)}
                      >
                        {isExpanded ? 'Ocultar participantes' : 'Ver participantes'}
                      </button>
                      {session.notes ? (
                        <span className="admin-session-card__notes">
                          Observações: {session.notes}
                        </span>
                      ) : null}
                    </div>
                    {isExpanded ? (
                      <div className="admin-session-card__participants">
                        {sessionParticipantsError ? (
                          <div className="admin-alert admin-alert--error">
                            {sessionParticipantsError}
                          </div>
                        ) : null}
                        {session.participants.length === 0 ? (
                          <p className="admin-placeholder">
                            Nenhum participante inscrito nesta turma.
                          </p>
                        ) : (
                          <table className="admin-session-card__table">
                            <thead>
                              <tr>
                                <th>Nome</th>
                                <th>Contato</th>
                                <th>Reserva</th>
                                <th aria-label="Ações" />
                              </tr>
                            </thead>
                            <tbody>
                              {session.participants.map((participant) => (
                                <tr key={participant.id}>
                                  <td>
                                    <div className="admin-session-card__participant-name">
                                      <strong>{participant.fullName}</strong>
                                      {participant.isBanned ? (
                                        <span className="admin-tag admin-tag--danger">Banido</span>
                                      ) : null}
                                    </div>
                                    <small>{formatDateLabel(participant.createdAt)}</small>
                                  </td>
                                  <td>
                                    <span>
                                      {participant.contactPhone ?? participant.contactEmail ?? '—'}
                                    </span>
                                    <small>{participant.scheduledForLabel}</small>
                                  </td>
                                  <td>
                                    <span
                                      className={`admin-tag admin-tag--${participant.bookingStatusTone.tone}`}
                                    >
                                      {participant.bookingStatusTone.label}
                                    </span>
                                    <small>Protocolo {participant.bookingProtocol}</small>
                                  </td>
                                  <td className="admin-session-card__actions-cell">
                                    <div className="admin-session-card__actions">
                                      <button
                                        type="button"
                                        className="admin-secondary-button admin-secondary-button--whatsapp"
                                        onClick={() => onParticipantTableAction(participant.id, 'whatsapp')}
                                      >
                                        <span className="admin-session-card__action-icon" aria-hidden="true">
                                          <svg viewBox="0 0 24 24">
                                            <path
                                              d="M20.52 3.48A11.92 11.92 0 0 0 12 .5 11.5 11.5 0 0 0 .5 11.78a11.22 11.22 0 0 0 1.18 5L.5 23.5l6.9-1.74A11.93 11.93 0 0 0 12 23.5h.05A11.45 11.45 0 0 0 23.5 12a11.9 11.9 0 0 0-2.98-8.52ZM12 21.4a9.83 9.83 0 0 1-5-.86l-.35-.17-4.08 1 1.09-3.92-.2-.4a9.67 9.67 0 0 1-1.22-4.73A9.9 9.9 0 0 1 12 2.61 10 10 0 0 1 21.39 12 9.87 9.87 0 0 1 12 21.4Zm5.27-7.33c-.29-.14-1.7-.84-1.96-.93s-.45-.14-.64.14-.73.93-.89 1.12-.33.21-.62.07a8.03 8.03 0 0 1-4.19-3.65c-.32-.55.32-.51.91-1.69a.56.56 0 0 0-.03-.53c-.07-.14-.64-1.54-.88-2.11s-.47-.47-.64-.48h-.54a1 1 0 0 0-.7.32 2.94 2.94 0 0 0-.93 2.18 5.1 5.1 0 0 0 1.05 2.7 11.66 11.66 0 0 0 4.46 4 15.27 15.27 0 0 0 1.52.56 3.63 3.63 0 0 0 1.66.1 2.74 2.74 0 0 0 1.8-1.27 2.21 2.21 0 0 0 .15-1.27c-.07-.12-.26-.19-.54-.33Z"
                                              fill="currentColor"
                                            />
                                          </svg>
                                        </span>
                                        <span className="admin-session-card__action-label">WhatsApp</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="admin-secondary-button"
                                        onClick={() => onParticipantTableAction(participant.id, 'manage')}
                                      >
                                        Detalhes
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
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
                {MESSAGE_TEMPLATE_METADATA.map((template) => (
                  <div key={template.id} className="admin-settings__field">
                    <label>
                      {template.label}
                      <textarea
                        value={messageTemplates[template.id]}
                        onChange={(event) =>
                          onUpdateMessageTemplate((prev) => ({
                            ...prev,
                            [template.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <small>{template.description}</small>
                    <small className="admin-settings__hint">
                      Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{hora}'}, {'{trilha}'}, {'{protocolo}'}, {'{responsavel}'}
                    </small>
                  </div>
                ))}
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
  const [isSessionWizardOpen, setIsSessionWizardOpen] = useState(false)
  const [sessionWizardStep, setSessionWizardStep] = useState<SessionWizardStep>(SESSION_WIZARD_STEPS[0])
  const [sessionWizardForm, setSessionWizardForm] = useState<SessionWizardFormState>(INITIAL_SESSION_WIZARD_FORM)
  const [sessionWizardFeedback, setSessionWizardFeedback] = useState<
    { message: string; tone: 'success' | 'error' }
  | null>(null)
  const [messageTemplates, setMessageTemplates] = useState<Record<MessageTemplateId, string>>(() => ({
    ...DEFAULT_MESSAGE_TEMPLATES,
  }))
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [participantDetail, setParticipantDetail] = useState<AdminParticipantDetail | null>(null)
  const [participantDetailError, setParticipantDetailError] = useState<string | null>(null)
  const [isLoadingParticipantDetail, setIsLoadingParticipantDetail] = useState(false)
  const [isUpdatingParticipant, setIsUpdatingParticipant] = useState(false)
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false)
  const [whatsappDialog, setWhatsappDialog] = useState<WhatsappDialogState | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventForm, setEventForm] = useState<EventFormState>(initialEventFormState)
  const [eventFormError, setEventFormError] = useState<string | null>(null)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [sessionExplorer, setSessionExplorer] = useState<{
    trailId: string
    sessions: AdminTrailSession[]
    isLoading: boolean
    error: string | null
    expandedSessionId: string | null
    isInitialized: boolean
  }>({
    trailId: 'all',
    sessions: [],
    isLoading: false,
    error: null,
    expandedSessionId: null,
    isInitialized: false,
  })
  const [sessionParticipantsError, setSessionParticipantsError] = useState<string | null>(null)

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

  const loadTrailSessions = useCallback(
    async (trailId: string) => {
      if (!trailId) {
        setSessionExplorer((state) => ({
          ...state,
          trailId: '',
          sessions: [],
          isLoading: false,
          error: null,
          expandedSessionId: null,
          isInitialized: true,
        }))
        setSessionParticipantsError(null)
        return
      }

      setSessionParticipantsError(null)
      setSessionExplorer((state) => ({
        ...state,
        trailId,
        isLoading: true,
        error: null,
        sessions: state.trailId === trailId ? state.sessions : [],
        expandedSessionId: null,
      }))

      try {
        if (trailId === 'all') {
          if (trailsState.items.length === 0) {
            setSessionExplorer({
              trailId,
              sessions: [],
              isLoading: false,
              error: null,
              expandedSessionId: null,
              isInitialized: true,
            })
            return
          }

          const results = await Promise.allSettled(
            trailsState.items.map((trail) =>
              fetchAdminTrailSessions(trail.id).then((sessions) =>
                sessions.map((session) => ({
                  ...session,
                  trailName: session.trailName ?? trail.name,
                })),
              ),
            ),
          )

          const sessions: AdminTrailSession[] = []
          const failedTrails: string[] = []

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              sessions.push(...result.value)
            } else {
              failedTrails.push(trailsState.items[index]?.name ?? 'trilha')
            }
          })

          sessions.sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          )

          setSessionExplorer({
            trailId,
            sessions,
            isLoading: false,
            error:
              failedTrails.length > 0
                ? `Não foi possível carregar as sessões das seguintes trilhas: ${failedTrails.join(
                    ', ',
                  )}.`
                : null,
            expandedSessionId: null,
            isInitialized: true,
          })
          return
        }

        const payload = await fetchAdminTrailSessions(trailId)
        const sessions = payload
          .slice()
          .sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          )

        setSessionExplorer({
          trailId,
          sessions,
          isLoading: false,
          error: null,
          expandedSessionId: null,
          isInitialized: true,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : trailId === 'all'
            ? 'Não foi possível carregar as sessões das trilhas selecionadas.'
            : 'Não foi possível carregar as sessões da trilha selecionada.'
        setSessionExplorer({
          trailId,
          sessions: [],
          isLoading: false,
          error: message,
          expandedSessionId: null,
          isInitialized: true,
        })
      }
    },
    [trailsState.items],
  )

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

  useEffect(() => {
    if (activeSection === 'participantes' && !trailsState.isInitialized) {
      loadTrails()
    }
  }, [activeSection, trailsState.isInitialized, loadTrails])

  useEffect(() => {
    if (
      activeSection === 'participantes' &&
      trailsState.isInitialized &&
      !sessionExplorer.isInitialized &&
      !sessionExplorer.isLoading
    ) {
      const nextTrailId =
        sessionExplorer.trailId || (trailsState.items.length > 0 ? 'all' : '')

      if (nextTrailId) {
        void loadTrailSessions(nextTrailId)
      } else {
        setSessionExplorer((state) => ({ ...state, isInitialized: true }))
      }
    }
  }, [
    activeSection,
    trailsState.isInitialized,
    trailsState.items,
    sessionExplorer.trailId,
    sessionExplorer.isLoading,
    sessionExplorer.isInitialized,
    loadTrailSessions,
    setSessionExplorer,
  ])

  const resetGuideForm = useCallback(() => {
    setGuideForm(initialGuideFormState)
    setEditingGuideCpf(null)
  }, [])

  const resetTrailForm = useCallback(() => {
    setTrailForm(initialTrailFormState)
    setEditingTrailId(null)
    setTrailFormError(null)
  }, [])

  const resetSessionWizard = useCallback(() => {
    setSessionWizardForm(INITIAL_SESSION_WIZARD_FORM)
    setSessionWizardStep(SESSION_WIZARD_STEPS[0])
  }, [])

  const handleOpenSessionWizard = useCallback(() => {
    resetSessionWizard()
    setSessionWizardFeedback(null)
    setIsSessionWizardOpen(true)
  }, [resetSessionWizard])

  const handleSessionWizardStepChange = useCallback((nextStep: SessionWizardStep) => {
    setSessionWizardStep(nextStep)
  }, [])

  const handleSessionWizardFormChange = useCallback(
    (updates: Partial<SessionWizardFormState>) => {
      setSessionWizardForm((prev) => ({ ...prev, ...updates }))
    },
    [],
  )

  const handleSessionWizardComplete = useCallback(
    async (session: AdminTrailSession) => {
      setSessionWizardFeedback({
        message: `Turma criada para ${session.trailName ?? 'a trilha selecionada'} em ${formatDateLabel(
          session.startsAt,
        )} às ${formatTimeLabel(session.startsAt)}.`,
        tone: 'success',
      })
      setIsSessionWizardOpen(false)
      resetSessionWizard()
      const refreshPromises: Array<Promise<void>> = [loadOverview(), loadTrails()]
      if (
        sessionExplorer.trailId === 'all' ||
        sessionExplorer.trailId === '' ||
        sessionExplorer.trailId === session.trailId
      ) {
        const targetTrailId = sessionExplorer.trailId === '' ? 'all' : sessionExplorer.trailId
        refreshPromises.push(loadTrailSessions(targetTrailId))
      }
      await Promise.all(refreshPromises)
    },
    [
      formatDateLabel,
      formatTimeLabel,
      loadOverview,
      loadTrailSessions,
      loadTrails,
      resetSessionWizard,
      sessionExplorer.trailId,
    ],
  )

  const handleSessionWizardCancel = useCallback(() => {
    setIsSessionWizardOpen(false)
    resetSessionWizard()
  }, [resetSessionWizard])

  const handleCloseParticipantDetail = useCallback(() => {
    setSelectedParticipantId(null)
    setParticipantDetail(null)
    setParticipantDetailError(null)
  }, [])

  const handleStartWizardFromParticipant = useCallback(() => {
    if (!participantDetail) {
      return
    }

    const scheduledDate = participantDetail.booking.scheduledFor.slice(0, 10)
    const scheduledTime = participantDetail.booking.scheduledFor.slice(11, 16)

    setSessionWizardForm({
      ...INITIAL_SESSION_WIZARD_FORM,
      trailId: participantDetail.booking.trail.id,
      scheduledDate,
      scheduledTime,
      guideCpf: participantDetail.booking.guide?.cpf ?? '',
      guidePhone: participantDetail.phone ?? participantDetail.booking.contactPhone ?? '',
    })
    setSessionWizardStep(SESSION_WIZARD_STEPS[0])
    setSessionWizardFeedback(null)
    setIsSessionWizardOpen(true)
    handleCloseParticipantDetail()
  }, [handleCloseParticipantDetail, participantDetail])

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

  const handleOpenEventModal = useCallback(() => {
    resetEventForm()
    setIsEventModalOpen(true)
  }, [resetEventForm])

  const handleCloseEventModal = useCallback(() => {
    setIsEventModalOpen(false)
    resetEventForm()
  }, [resetEventForm])

  const handleParticipantTableAction = useCallback(
    async (rowId: string, actionId: string) => {
      if (actionId === 'whatsapp') {
        const session = sessionExplorer.sessions.find((item) =>
          item.participants.some((participant) => participant.id === rowId),
        )
        const participant = session?.participants.find((item) => item.id === rowId)

        if (!participant) {
          setWhatsappDialog(null)
          setIsWhatsappModalOpen(false)
          return
        }

        const scheduledDate = formatDateLabel(session?.startsAt ?? participant.scheduledFor)
        const scheduledTime = formatTimeLabel(session?.startsAt ?? participant.scheduledFor)
        const variables = {
          nome: participant.fullName || participant.contactName,
          data: scheduledDate,
          hora: scheduledTime,
          trilha: session?.trailName ?? 'Trilha agendada',
          protocolo: participant.bookingProtocol,
          responsavel: participant.contactName,
        }

        let templateId: MessageTemplateId = 'reminder'

        if (participant.bookingStatus === 'CONFIRMED') {
          templateId = 'confirmation'
        } else if (participant.bookingStatus === 'CANCELLED') {
          templateId = 'cancellation'
        }

        const template = messageTemplates[templateId] ?? DEFAULT_MESSAGE_TEMPLATES[templateId]

        setWhatsappDialog({
          participantId: participant.id,
          participantName: participant.fullName,
          phone: participant.phone ?? participant.contactPhone ?? '',
          templateId,
          message: applyMessageVariables(template, variables),
          variables,
        })
        setIsWhatsappModalOpen(true)
        return
      }

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
    [fetchAdminParticipant, messageTemplates, sessionExplorer.sessions],
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

  const handleSessionsTrailSelect = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextTrailId = event.target.value
      if (!nextTrailId) {
        setSessionExplorer({
          trailId: '',
          sessions: [],
          isLoading: false,
          error: null,
          expandedSessionId: null,
          isInitialized: true,
        })
        setSessionParticipantsError(null)
        return
      }

      void loadTrailSessions(nextTrailId)
    },
    [loadTrailSessions],
  )

  const handleRefreshTrailSessions = useCallback(() => {
    const targetTrailId =
      sessionExplorer.trailId || (trailsState.items.length > 0 ? 'all' : '')

    if (targetTrailId) {
      void loadTrailSessions(targetTrailId)
    }
  }, [sessionExplorer.trailId, loadTrailSessions, trailsState.items.length])

  const handleToggleSessionParticipants = useCallback(
    async (sessionId: string) => {
      const isCurrentlyExpanded = sessionExplorer.expandedSessionId === sessionId
      setSessionExplorer((state) => ({
        ...state,
        expandedSessionId: isCurrentlyExpanded ? null : sessionId,
      }))

      if (isCurrentlyExpanded) {
        return
      }

      setSessionParticipantsError(null)

      try {
        const participants = await fetchAdminTrailSessionParticipants(sessionId)
        setSessionExplorer((state) => ({
          ...state,
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, participants } : session,
          ),
        }))
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os participantes da sessão.'
        setSessionParticipantsError(message)
      }
    },
    [sessionExplorer.expandedSessionId],
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

  const messageTemplateOptions = useMemo(() => {
    return MESSAGE_TEMPLATE_METADATA.map((metadata) => ({
      id: metadata.id,
      label: metadata.label,
    }))
  }, [])
  const handleOpenInviteModal = useCallback(() => {
    setInviteCpf('')
    setInviteRole('C')
    setInviteResult(null)
    setInviteError(null)
    setIsInviteModalOpen(true)
  }, [])

  const handleCloseWhatsappModal = useCallback(() => {
    setIsWhatsappModalOpen(false)
    setWhatsappDialog(null)
  }, [])

  const handleWhatsappPhoneChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setWhatsappDialog((prev) => (prev ? { ...prev, phone: nextValue } : prev))
  }, [])

  const handleWhatsappTemplateChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const templateId = event.target.value as MessageTemplateId
      setWhatsappDialog((prev) => {
        if (!prev) {
          return prev
        }

        const template = messageTemplates[templateId] ?? DEFAULT_MESSAGE_TEMPLATES[templateId]
        return {
          ...prev,
          templateId,
          message: applyMessageVariables(template, prev.variables),
        }
      })
    },
    [messageTemplates],
  )

  const handleWhatsappMessageChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value
    setWhatsappDialog((prev) => (prev ? { ...prev, message: nextValue } : prev))
  }, [])

  const handleOpenWhatsappLink = useCallback(() => {
    if (!whatsappDialog) {
      return
    }

    const phone = sanitizePhoneNumber(whatsappDialog.phone)
    const text = whatsappDialog.message.trim()

    if (!phone || !text) {
      return
    }

    const link = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }, [whatsappDialog])

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
        sessionWizardFeedback,
        onOpenSessionWizard: handleOpenSessionWizard,
        onParticipantTableAction: handleParticipantTableAction,
        onOpenEventModal: handleOpenEventModal,
        trailOptions: trailsState.items,
        isLoadingTrails: trailsState.isLoading,
        trailError: trailsState.error,
        sessionsState: sessionExplorer,
        sessionParticipantsError,
        onSelectSessionsTrail: handleSessionsTrailSelect,
        onRefreshSessions: handleRefreshTrailSessions,
        onToggleSessionParticipants: handleToggleSessionParticipants,
        messageTemplates,
        onUpdateMessageTemplate: setMessageTemplates,
      }),
    [
      activeSection,
      adminData,
      trailsSection,
      guidesSection,
      sessionWizardFeedback,
      handleOpenSessionWizard,
      handleParticipantTableAction,
      handleOpenEventModal,
      trailsState.items,
      trailsState.isLoading,
      trailsState.error,
      sessionExplorer,
      sessionParticipantsError,
      handleSessionsTrailSelect,
      handleRefreshTrailSessions,
      handleToggleSessionParticipants,
      messageTemplates,
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
      <AdminSessionWizard
        isOpen={isSessionWizardOpen}
        step={sessionWizardStep}
        form={sessionWizardForm}
        onStepChange={handleSessionWizardStepChange}
        onFormChange={handleSessionWizardFormChange}
        onCancel={handleSessionWizardCancel}
        onComplete={handleSessionWizardComplete}
      />
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
                onClick={handleStartWizardFromParticipant}
                disabled={!participantDetail}
              >
                Criar turma
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
      {isWhatsappModalOpen && whatsappDialog ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="whatsapp-modal-title">
          <div className="admin-modal__backdrop" aria-hidden="true" onClick={handleCloseWhatsappModal} />
          <div className="admin-modal__dialog" role="document">
            <button
              type="button"
              className="admin-modal__close"
              onClick={handleCloseWhatsappModal}
              aria-label="Fechar"
            >
              ×
            </button>
            <header className="admin-modal__header">
              <h2 id="whatsapp-modal-title">Enviar mensagem no WhatsApp</h2>
              <p>Use os templates configurados para enviar comunicações rápidas aos participantes.</p>
            </header>
            <div className="admin-modal__body">
              <p className="admin-modal__hint">
                Mensagem preparada para {whatsappDialog.participantName || 'o participante selecionado'}.
              </p>
              <label>
                Número do participante
                <input
                  type="tel"
                  value={whatsappDialog.phone}
                  onChange={handleWhatsappPhoneChange}
                  placeholder="Ex.: 5584999999999"
                />
                <small>Utilize DDI + DDD para garantir o disparo correto via wa.me.</small>
              </label>
              <label>
                Modelo de mensagem
                <select value={whatsappDialog.templateId} onChange={handleWhatsappTemplateChange}>
                  {messageTemplateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mensagem
                <textarea rows={6} value={whatsappDialog.message} onChange={handleWhatsappMessageChange} />
                <small>
                  Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{hora}'}, {'{trilha}'}, {'{protocolo}'}, {'{responsavel}'}
                </small>
              </label>
              <div className="admin-modal__variables">
                {Object.entries(whatsappDialog.variables).map(([key, value]) => (
                  <span key={key}>
                    <strong>{`{${key}}`}</strong>: {value || '—'}
                  </span>
                ))}
              </div>
            </div>
            <footer className="admin-modal__actions">
              <button type="button" className="admin-secondary-button" onClick={handleCloseWhatsappModal}>
                Cancelar
              </button>
              <button
                type="button"
                className="admin-primary-button"
                onClick={handleOpenWhatsappLink}
                disabled={
                  !sanitizePhoneNumber(whatsappDialog.phone) || !whatsappDialog.message.trim().length
                }
              >
                Abrir WhatsApp
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
