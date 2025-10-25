import type { StatusTone } from './types.js'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
})

export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

export function formatDateTimeLabel(date: Date): string {
  return `${formatDate(date)} • ${formatTime(date)}`
}

export function formatMonthLabel(date: Date): string {
  return monthFormatter.format(date)
}

export function calculateOccupancy(total: number, capacity: number | null | undefined): number {
  if (!capacity || capacity <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((total / capacity) * 100)))
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function createStatusTone(status: string): StatusTone {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'Confirmado', tone: 'success' }
    case 'PENDING':
      return { label: 'Pendente', tone: 'warning' }
    case 'CANCELLED':
      return { label: 'Cancelado', tone: 'danger' }
    case 'COMPLETED':
      return { label: 'Concluído', tone: 'info' }
    case 'RESCHEDULED':
      return { label: 'Remarcado', tone: 'info' }
    default:
      return { label: status, tone: 'neutral' }
  }
}
