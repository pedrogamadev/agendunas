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
  createAdminGuide,
  createAdminTrail,
  createAdminInvite,
  updateAdminGuide,
  updateAdminTrail,
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
  type TrailDifficulty,
  type TrailStatus,
} from '../api/admin'
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

type AdminPageData = {
  metrics: MetricCardProps[]
  bookingRows: AdminTableRow[]
  participantRows: AdminTableRow[]
  todaysTrails: typeof fallbackTodaysTrails
  upcomingEvents: typeof fallbackUpcomingEvents
  recentActivity: typeof fallbackRecentActivity
  eventCards: typeof fallbackEventCards
  trailCards: typeof fallbackTrailCards
  calendar: {
    title: string
    days: typeof fallbackCalendarDays
  }
  report: {
    metrics: MetricCardProps[]
    lineChart: typeof fallbackLineChartData
    pieChart: typeof fallbackPieChartData
    barChart: typeof fallbackBarChartData
  }
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

const sanitizeCpf = (value: string) => value.replace(/\D/g, '').slice(0, 11)

const formatCpf = (value: string) => {
  const digits = sanitizeCpf(value)
  if (digits.length !== 11) {
    return digits
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

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
    id: 'edit',
    label: 'Editar',
    icon: createIcon(
      <path d="m6 15.5 8.9-8.9 2.5 2.5-8.9 8.9H6Zm9.6-10.2 1.8-1.8 2.1 2.1-1.8 1.8Z" fill="currentColor" />,
    ),
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

const fallbackBookingRows: AdminTableRow[] = [
  {
    id: 'acd-2025-0001',
    cells: {
      protocol: 'ACD-2025-0001',
      name: 'Maria Silva',
      trail: 'Trilha Perobinha',
      date: '22/10/2025',
      time: '08:00',
      participants: '15',
      guide: 'Carlos Mendes',
    },
    status: { label: 'Confirmado', tone: 'success' },
    actions: tableActions,
  },
  {
    id: 'acd-2025-0002',
    cells: {
      protocol: 'ACD-2025-0002',
      name: 'João Oliveira',
      trail: 'Trilha do Acarajé',
      date: '22/10/2025',
      time: '09:30',
      participants: '20',
      guide: 'Ana Paula Santos',
    },
    status: { label: 'Pendente', tone: 'warning' },
    actions: tableActions,
  },
  {
    id: 'acd-2025-0003',
    cells: {
      protocol: 'ACD-2025-0003',
      name: 'Fernando Costa',
      trail: 'Trilha do Aroeira',
      date: '23/10/2025',
      time: '07:00',
      participants: '12',
      guide: 'Roberto Silva',
    },
    status: { label: 'Remarcado', tone: 'info' },
    actions: tableActions,
  },
  {
    id: 'acd-2025-0004',
    cells: {
      protocol: 'ACD-2025-0004',
      name: 'Luciana Alves',
      trail: 'Trilha Ubaú-doce',
      date: '23/10/2025',
      time: '10:30',
      participants: '18',
      guide: 'Ana Paula Santos',
    },
    status: { label: 'Cancelado', tone: 'danger' },
    actions: tableActions,
  },
]

const fallbackParticipantRows: AdminTableRow[] = [
  {
    id: 'participant-1',
    cells: {
      name: 'Maria Silva',
      contact: '(84) 9987-5542',
      trail: 'Trilha Perobinha',
      datetime: '22/10/2025 • 08:00',
      status: 'Confirmado',
    },
    status: { label: 'Check-in pendente', tone: 'warning' },
    actions: [
      {
        id: 'checkin',
        label: 'Confirmar check-in',
        icon: createIcon(
          <path d="m10.2 16.6-3.8-3.8 1.4-1.4 2.4 2.4 5.6-5.6 1.4 1.4Z" fill="currentColor" />,
        ),
        tone: 'primary',
      },
    ],
  },
  {
    id: 'participant-2',
    cells: {
      name: 'João Oliveira',
      contact: '(84) 9876-4431',
      trail: 'Trilha Perobinha',
      datetime: '22/10/2025 • 08:00',
      status: 'Confirmado',
    },
    status: { label: 'Check-in realizado', tone: 'success' },
    actions: [
      {
        id: 'badge',
        label: 'Ver detalhes',
        icon: createIcon(<path d="M12 6c4 0 7.5 2.6 9 6-1.5 3.4-5 6-9 6s-7.5-2.6-9-6c1.5-3.4 5-6 9-6Z" fill="currentColor" />),
      },
    ],
  },
  {
    id: 'participant-3',
    cells: {
      name: 'Fernanda Costa',
      contact: '(84) 9090-5521',
      trail: 'Trilha do Aroeira',
      datetime: '22/10/2025 • 09:00',
      status: 'Pendente',
    },
    status: { label: 'Aguardando pagamento', tone: 'info' },
    actions: [
      {
        id: 'reminder',
        label: 'Enviar lembrete',
        icon: createIcon(
          <path d="m6 12 6 6 6-6-1.4-1.4L12 15.2 7.4 10.6Z" fill="currentColor" />,
        ),
      },
    ],
  },
]

const fallbackDashboardMetrics: MetricCardProps[] = [
  {
    title: 'Agendamentos Hoje',
    value: '48',
    helper: 'Reservas confirmadas para o dia',
    trend: { value: '+12%', direction: 'up', label: 'vs. ontem' },
  },
  {
    title: 'Confirmados',
    value: '62',
    helper: '82% taxa de confirmação',
    trend: { value: '+5%', direction: 'up', label: 'últimos 7 dias' },
  },
  {
    title: 'Pendentes',
    value: '14',
    helper: 'Aguardando confirmação',
    trend: { value: '-8%', direction: 'down', label: 'na semana' },
  },
  {
    title: 'Cancelados',
    value: '6',
    helper: '2 cancelamentos nas últimas 24h',
    trend: { value: '-3%', direction: 'down', label: 'vs. mês anterior' },
  },
]

const fallbackTodaysTrails = [
  {
    id: 'trail-1',
    name: 'Trilha Perobinha',
    schedule: '08:00 • Guia: Carlos Mendes',
    occupancy: 72,
    capacity: '45 / 60 vagas',
  },
  {
    id: 'trail-2',
    name: 'Trilha Ubaú-doce',
    schedule: '10:30 • Guia: Ana Paula Santos',
    occupancy: 55,
    capacity: '33 / 60 vagas',
  },
  {
    id: 'trail-3',
    name: 'Trilha do Aroeira',
    schedule: '14:00 • Guia: Roberto Silva',
    occupancy: 91,
    capacity: '50 / 55 vagas',
  },
]

const fallbackUpcomingEvents = [
  {
    id: 'event-1',
    title: 'Mutirão de Educação Ambiental',
    date: '23 out • 09:00',
    description: 'Atividade educativa com trilha sonora de músicos locais.',
  },
  {
    id: 'event-2',
    title: 'Festival de Trilhas do Parque',
    date: '24 out • 16:00',
    description: 'Passeios guiados especiais com guias convidados.',
  },
  {
    id: 'event-3',
    title: 'Trilha para Foz do Sol',
    date: '25 out • 17:30',
    description: 'Expedição ao pôr do sol com observação de aves migratórias.',
  },
]

const fallbackRecentActivity = [
  { id: 'activity-1', time: '22/10/2025 • 14:35', text: 'Agendamento confirmado do cliente notificado' },
  { id: 'activity-2', time: '22/10/2025 • 13:20', text: 'Agendamento remarcado para 23/10' },
  { id: 'activity-3', time: '22/10/2025 • 09:10', text: 'Check-in realizado - Trilha Perobinha' },
  { id: 'activity-4', time: '21/10/2025 • 18:42', text: 'Novo evento publicado: Observação de Aves' },
]

const fallbackEventCards = [
  {
    id: 'event-card-1',
    title: 'Mutirão de Educação Ambiental',
    description: 'Atividade educativa com trilha musical e limpeza das trilhas.',
    tag: 'Publicado',
    tagTone: 'success',
    date: '23 out • 09:00',
    capacity: '30 vagas',
  },
  {
    id: 'event-card-2',
    title: 'Festival de Trilhas',
    description: 'Passeios guiados especiais com foco em fauna nativa.',
    tag: 'Destaque',
    tagTone: 'info',
    date: '24 out • 16:00',
    capacity: '50 vagas',
  },
  {
    id: 'event-card-3',
    title: 'Observação de Aves - Falcão',
    description: 'Expedição ao nascer do sol com guias especialistas.',
    tag: 'Rascunho',
    tagTone: 'warning',
    date: '26 out • 05:30',
    capacity: '15 vagas',
  },
]

const fallbackTrailCards = [
  {
    id: 'trail-card-1',
    name: 'Trilha Perobinha',
    difficulty: 'Moderada',
    duration: '2h30',
    capacity: '60 pessoas',
    status: 'Ativa',
    description: 'Percurso sombreado com observação de flora local.',
  },
  {
    id: 'trail-card-2',
    name: 'Trilha Ubaú-doce',
    difficulty: 'Intensa',
    duration: '3h',
    capacity: '45 pessoas',
    status: 'Ativa',
    description: 'Trilha com mirantes e visita a nascentes preservadas.',
  },
  {
    id: 'trail-card-3',
    name: 'Trilha do Aroeira',
    difficulty: 'Leve',
    duration: '1h45',
    capacity: '55 pessoas',
    status: 'Pausada',
    description: 'Caminho com interpretação ambiental para escolas.',
  },
]

const fallbackCalendarDays = [
  { date: '01', events: [] },
  { date: '02', events: [] },
  { date: '03', events: [] },
  { date: '04', events: ['Festival de Trilhas'] },
  { date: '05', events: [] },
  { date: '06', events: [] },
  { date: '07', events: ['Agendamento: Perobinha'] },
  { date: '08', events: [] },
  { date: '09', events: ['Agendamento: Ubaú-doce'] },
  { date: '10', events: [] },
  { date: '11', events: [] },
  { date: '12', events: [] },
  { date: '13', events: ['Evento: Observação de Aves'] },
  { date: '14', events: [] },
  { date: '15', events: ['Agendamento: Aroeira'] },
  { date: '16', events: [] },
  { date: '17', events: [] },
  { date: '18', events: [] },
  { date: '19', events: [] },
  { date: '20', events: [] },
  { date: '21', events: ['Evento: Educação Ambiental'] },
  { date: '22', events: ['Agendamento: Perobinha', 'Agendamento: Aroeira'] },
  { date: '23', events: ['Evento: Educação Ambiental'] },
  { date: '24', events: ['Festival de Trilhas'] },
  { date: '25', events: ['Trilha para Foz do Sol'] },
  { date: '26', events: [] },
  { date: '27', events: [] },
  { date: '28', events: ['Mutirão de Limpeza'] },
  { date: '29', events: [] },
  { date: '30', events: ['Agendamento: Aroeira'] },
  { date: '31', events: [] },
]

const fallbackReportMetrics: MetricCardProps[] = [
  {
    title: 'Total de Agendamentos',
    value: '684',
    helper: '+15% vs. mês anterior',
    trend: { value: '+15%', direction: 'up', label: 'mês' },
  },
  {
    title: 'Taxa de Confirmação',
    value: '82%',
    helper: '+5 pts em relação ao mês anterior',
    trend: { value: '+5 pts', direction: 'up', label: 'performance' },
  },
  {
    title: 'Taxa de Cancelamento',
    value: '6%',
    helper: '-3 pts em relação ao mês anterior',
    trend: { value: '-3 pts', direction: 'down', label: 'performance' },
  },
  {
    title: 'Eventos Publicados',
    value: '18',
    helper: '+2 novos eventos no mês',
    trend: { value: '+12%', direction: 'up', label: 'crescimento' },
  },
]

const fallbackLineChartData = [
  { label: 'Mai', value: 62 },
  { label: 'Jun', value: 75 },
  { label: 'Jul', value: 82 },
  { label: 'Ago', value: 78 },
  { label: 'Set', value: 88 },
  { label: 'Out', value: 96 },
]

const fallbackPieChartData = [
  { label: 'Confirmados', value: 58, tone: '#1aa361' },
  { label: 'Pendentes', value: 22, tone: '#f2c94c' },
  { label: 'Cancelados', value: 12, tone: '#eb5757' },
  { label: 'Remarcados', value: 8, tone: '#2d9cdb' },
]

const fallbackBarChartData = [
  { label: 'Perobinha', value: 32 },
  { label: 'Ubaú-doce', value: 28 },
  { label: 'Aroeira', value: 24 },
  { label: 'Foz do Sol', value: 18 },
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

const buildSection = (
  key: SectionKey,
  data: AdminPageData,
  trailsSection: SectionConfig,
  guidesSection: SectionConfig,
): SectionConfig => {
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
                  <span>Atualizado às 07:30</span>
                </header>
                <div className="admin-card__content">
                  <div className="admin-weather">
                    <div>
                      <span className="admin-weather__temp">28°C</span>
                      <span>Ensolarado</span>
                    </div>
                    <div className="admin-weather__details">
                      <span>Umidade: 62%</span>
                      <span>Ventos: 14 km/h</span>
                      <span>Índice UV: 6 (Alto)</span>
                    </div>
                  </div>
                  <div className="admin-alert-card">
                    <strong>Atenção às trilhas costeiras</strong>
                    <p>Rajadas de vento previstas para o fim da tarde. Monitore a capacidade.</p>
                  </div>
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
            <button type="button" className="admin-primary-button">Novo Agendamento</button>
          </>
        ),
        content: (
          <div className="admin-section">
            <div className="admin-filters">
              <label>
                Trilha
                <select defaultValue="todas">
                  <option value="todas">Todas</option>
                  <option value="perobinha">Trilha Perobinha</option>
                  <option value="ubaud">Trilha Ubaú-doce</option>
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
                <input type="date" defaultValue="2025-10-22" />
              </label>
            </div>
            <AdminTable columns={bookingColumns} rows={data.bookingRows} />
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
                  <option value="perobinha">Trilha Perobinha</option>
                  <option value="aroeira">Trilha do Aroeira</option>
                </select>
              </label>
              <label>
                Data
                <input type="date" defaultValue="2025-10-22" />
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
            <AdminTable columns={participantColumns} rows={data.participantRows} />
          </div>
        ),
      }
    case 'eventos':
      return {
        title: 'Eventos do Parque',
        description: 'Gerencie e promova eventos e atividades especiais',
        actions: (
          <button type="button" className="admin-primary-button">Novo Evento</button>
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
                  <button type="button" className="admin-secondary-button">Editar</button>
                  <button type="button" className="admin-secondary-button">Publicar</button>
                  <button type="button" className="admin-secondary-button">Promover</button>
                </div>
              </article>
            ))}
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
    let isMounted = true
    setIsLoadingOverview(true)

    fetchAdminOverview()
      .then((data) => {
        if (!isMounted) {
          return
        }
        setOverview(data)
        setOverviewError(null)
      })
      .catch((error) => {
        if (!isMounted) {
          return
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados em tempo real.'
        setOverview(null)
        setOverviewError(message)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingOverview(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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
      : fallbackBookingRows

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
          actions: [],
        }))
      : fallbackParticipantRows

    const todaysSessions = overview
      ? overview.todaysSessions.map((session) => ({
          id: session.id,
          name: session.trailName,
          schedule: session.scheduleLabel,
          occupancy: session.occupancy,
          capacity: session.capacityLabel,
        }))
      : fallbackTodaysTrails

    const upcoming = overview
      ? overview.upcomingEvents.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.dateLabel,
        }))
      : fallbackUpcomingEvents

    const activities = overview
      ? overview.recentActivity.map((item) => ({
          id: item.id,
          time: item.label,
          text: item.message,
        }))
      : fallbackRecentActivity

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
      : fallbackEventCards

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
      : fallbackTrailCards

    const calendar = overview
      ? {
          title: `${overview.calendar.month} ${overview.calendar.year}`,
          days: overview.calendar.days.map((day) => ({
            date: day.label,
            events: day.events,
          })),
        }
      : {
          title: 'Outubro 2025',
          days: fallbackCalendarDays,
        }

    const report = overview
      ? {
          metrics: overview.report.reportMetrics,
          lineChart: overview.report.lineChartData,
          pieChart: overview.report.pieChartData,
          barChart: overview.report.barChartData,
        }
      : {
          metrics: fallbackReportMetrics,
          lineChart: fallbackLineChartData,
          pieChart: fallbackPieChartData,
          barChart: fallbackBarChartData,
        }

    return {
      metrics: overview?.metrics ?? fallbackDashboardMetrics,
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
                  placeholder="00000000000"
                  value={guideForm.cpf}
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
    () => buildSection(activeSection, adminData, trailsSection, guidesSection),
    [activeSection, adminData, trailsSection, guidesSection],
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
                    placeholder="00000000000"
                    value={inviteCpf}
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
