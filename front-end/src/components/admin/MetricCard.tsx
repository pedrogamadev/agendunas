import type { ReactNode } from 'react'

type MetricCardProps = {
  title: string
  value: string
  helper?: string
  trend?: {
    value: string
    direction: 'up' | 'down'
    label?: string
  }
  icon?: ReactNode
}

function MetricCard({ title, value, helper, trend, icon }: MetricCardProps) {
  const resolvedIcon =
    icon ?? (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      </svg>
    )

  return (
    <article className="admin-metric-card">
      <header>
        <span className="admin-metric-card__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
        <span className="admin-metric-card__title">{title}</span>
      </header>
      <div className="admin-metric-card__value">{value}</div>
      {helper ? <p className="admin-metric-card__helper">{helper}</p> : null}
      {trend ? (
        <div className={`admin-metric-card__trend is-${trend.direction}`}>
          <span className="admin-metric-card__trend-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              {trend.direction === 'up' ? (
                <path d="M2 10.5 8 4.5l6 6-1.1 1.1L8 6.7 3.1 11.6Z" fill="currentColor" />
              ) : (
                <path d="M2 5.5 3.1 4.4 8 9.3l4.9-4.9L14 5.5l-6 6Z" fill="currentColor" />
              )}
            </svg>
          </span>
          <span className="admin-metric-card__trend-value">{trend.value}</span>
          {trend.label ? <span className="admin-metric-card__trend-label">{trend.label}</span> : null}
        </div>
      ) : null}
    </article>
  )
}

export type { MetricCardProps }
export default MetricCard
