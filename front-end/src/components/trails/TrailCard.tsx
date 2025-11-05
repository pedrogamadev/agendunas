import { useState } from 'react'
import { ViewTrailModal } from './ViewTrailModal'
import type { Trail } from '../../types/trail'
import '../../styles/trail-card.css'

type TrailCardProps = {
  trail: Trail
  onEdit?: (trail: Trail) => void
  onDelete?: (trail: Trail) => void
  disableEdit?: boolean
  disableDelete?: boolean
}

export function TrailCard({ trail, onEdit, onDelete, disableEdit, disableDelete }: TrailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = () => {
    onEdit?.(trail)
  }

  const handleDelete = () => {
    onDelete?.(trail)
  }

  const nextSessionLabel = trail.proximaSessao && trail.proximaSessao.trim().length > 0 ? trail.proximaSessao : '—'

  return (
    <article className="trail-card">
      <div className="trail-card__media">
        {trail.imagemUrl ? (
          <img
            className="trail-card__image"
            src={trail.imagemUrl}
            alt={`Imagem da trilha ${trail.nome}`}
            loading="lazy"
          />
        ) : (
          <div className="trail-card__placeholder" aria-hidden="true">
            Sem imagem
          </div>
        )}
      </div>

      <div className="trail-card__content">
        <h3 className="trail-card__title">{trail.nome}</h3>
        <dl className="trail-card__meta">
          <div className="trail-card__meta-row">
            <dt>Duração</dt>
            <dd>{trail.duracao}</dd>
          </div>
          <div className="trail-card__meta-row">
            <dt>Capacidade</dt>
            <dd>{trail.capacidade} pessoas</dd>
          </div>
          <div className="trail-card__meta-row">
            <dt>Próxima sessão</dt>
            <dd>{nextSessionLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="trail-card__actions">
        <button
          type="button"
          className="trail-card__button trail-card__button--muted"
          onClick={handleEdit}
          disabled={disableEdit}
        >
          Editar
        </button>
        <button
          type="button"
          className="trail-card__button trail-card__button--danger"
          onClick={handleDelete}
          disabled={disableDelete}
        >
          Excluir
        </button>
        <button
          type="button"
          className="trail-card__button trail-card__button--primary"
          onClick={() => setIsModalOpen(true)}
        >
          Ver mais
        </button>
      </div>

      <ViewTrailModal open={isModalOpen} onOpenChange={setIsModalOpen} trail={trail} />
    </article>
  )
}
