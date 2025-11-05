import type { ChangeEvent } from 'react'
import { TrailCard } from '../../components/trails/TrailCard'
import type { Trail } from '../../types/trail'

type TrailsStatsOverview = {
  total: number
  active: number
  highlights: number
  activeHighlights: number
  averageCapacity: string
  upcomingSessions: number
}

type TrailsPageProps = {
  trails: Trail[]
  searchTerm: string
  onSearchChange: (value: string) => void
  stats: TrailsStatsOverview
  error?: string | null
  feedback?: string | null
  isInitialLoading?: boolean
  isRefreshing?: boolean
  onEditTrail?: (trail: Trail) => void
  onDeleteTrail?: (trail: Trail) => void
  disableEdit?: boolean
  disableDelete?: boolean
}

export function TrailsPage({
  trails,
  searchTerm,
  onSearchChange,
  stats,
  error,
  feedback,
  isInitialLoading = false,
  isRefreshing = false,
  onEditTrail,
  onDeleteTrail,
  disableEdit,
  disableDelete,
}: TrailsPageProps) {
  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  const showEmptyState = !isInitialLoading && trails.length === 0

  return (
    <div className="admin-trails">
      <section className="admin-trails__hero">
        <div className="admin-trails__hero-text">
          <span className="admin-trails__hero-kicker">Portfólio de experiências</span>
          <h2>Controle as trilhas disponíveis para agendamento</h2>
          <p>Atualize destaques, disponibilidade e equipes responsáveis por cada trilha.</p>
        </div>
        <dl className="admin-trails__hero-stats">
          <div>
            <dt>Total de trilhas</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>Ativas</dt>
            <dd>{stats.active}</dd>
          </div>
          <div>
            <dt>Destaques</dt>
            <dd>{stats.highlights}</dd>
          </div>
          <div>
            <dt>Visíveis na home</dt>
            <dd>{stats.activeHighlights}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-trails__controls">
        <div className="admin-trails__search">
          <label htmlFor="admin-trails-search" className="admin-trails__search-label">
            Buscar trilha por nome
          </label>
          <div className="admin-trails__search-input">
            <input
              id="admin-trails-search"
              type="search"
              placeholder="Buscar trilha por nome"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
        <div className="admin-trails__summary">
          <span>
            <strong>Capacidade média:</strong> {stats.averageCapacity}
          </span>
          <span>
            <strong>Próximas sessões:</strong> {stats.upcomingSessions}
          </span>
        </div>
      </section>

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}
      {feedback ? <div className="admin-alert admin-alert--success">{feedback}</div> : null}

      {isInitialLoading ? <p className="admin-placeholder">Carregando trilhas cadastradas...</p> : null}
      {isRefreshing ? <p className="admin-placeholder">Atualizando lista de trilhas...</p> : null}

      {showEmptyState ? (
        <div className="admin-trails__empty">
          <h3>Nenhuma trilha encontrada</h3>
          <p>Verifique o termo buscado ou cadastre uma nova trilha.</p>
        </div>
      ) : null}

      {trails.length > 0 ? (
        <ul className="admin-trails__cards">
          {trails.map((trail) => (
            <li key={trail.id} className="admin-trails__card-item">
              <TrailCard
                trail={trail}
                onEdit={onEditTrail}
                onDelete={onDeleteTrail}
                disableEdit={disableEdit}
                disableDelete={disableDelete}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
