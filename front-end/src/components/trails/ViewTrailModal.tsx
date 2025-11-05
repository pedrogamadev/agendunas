import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Trail } from '../../types/trail'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

type ViewTrailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trail: Trail
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

const formatDetailValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'number') {
    return numberFormatter.format(value)
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : '—'
}

export function ViewTrailModal({ open, onOpenChange, trail }: ViewTrailModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)
  const titleId = useMemo(() => `trail-modal-title-${trail.id}`, [trail.id])

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return
    }

    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null

    const focusFirstElement = () => {
      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      const first = focusable[0] ?? dialog
      first.focus({ preventScroll: true })
    }

    const timer = window.setTimeout(focusFirstElement, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      if (event.key === 'Tab') {
        const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)

        if (focusable.length === 0) {
          event.preventDefault()
          dialog.focus({ preventScroll: true })
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const activeElement = document.activeElement as HTMLElement | null

        if (event.shiftKey) {
          if (activeElement === first || activeElement === dialog) {
            event.preventDefault()
            last.focus({ preventScroll: true })
          }
          return
        }

        if (activeElement === last) {
          event.preventDefault()
          first.focus({ preventScroll: true })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement.current?.focus?.({ preventScroll: true })
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) {
    return null
  }

  const modalRoot = typeof document !== 'undefined' ? document.body : null

  const tagLabels = [
    trail.badge,
    trail.visivelNaHome ? 'Visível na home' : null,
    trail.destaque ? 'Trilha em destaque' : null,
  ].filter((label): label is string => Boolean(label && label.trim().length > 0))

  const generalDetails = [
    { label: 'Identificador', value: trail.slug },
    { label: 'Status', value: trail.status },
    { label: 'Dificuldade', value: trail.dificuldade },
    { label: 'Duração', value: trail.duracao },
    { label: 'Capacidade', value: `${numberFormatter.format(trail.capacidade)} pessoas` },
    { label: 'Próximas sessões', value: trail.proximasSessoes },
    { label: 'Próxima sessão', value: trail.proximaSessao },
    { label: 'Última sessão', value: trail.ultimaSessao },
    { label: 'Preço base', value: trail.precoBase },
    { label: 'Ponto de encontro', value: trail.pontoEncontro },
    { label: 'Criada em', value: trail.criadaEm },
    { label: 'Atualizada em', value: trail.atualizadaEm },
    {
      label: 'Visível na home',
      value:
        trail.visivelNaHome === undefined
          ? null
          : trail.visivelNaHome
            ? 'Sim'
            : 'Não',
    },
    {
      label: 'Destaque',
      value:
        trail.destaque === undefined
          ? null
          : trail.destaque
            ? 'Sim'
            : 'Não',
    },
  ]

  const guides = trail.guias ?? []
  const sessions = trail.sessoes ?? []

  const modalContent = (
    <div className="trail-modal">
      <div
        className="trail-modal__backdrop"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="trail-modal__dialog"
        tabIndex={-1}
      >
        <header className="trail-modal__header">
          <h2 id={titleId} className="trail-modal__title">
            {trail.nome}
          </h2>
          <button type="button" className="trail-modal__button" onClick={() => onOpenChange(false)}>
            Fechar
          </button>
        </header>

        <div className="trail-modal__content">
          {tagLabels.length > 0 ? (
            <div className="trail-modal__section">
              <h3>Etiquetas</h3>
              <div className="trail-modal__tag-list">
                {tagLabels.map((label) => (
                  <span key={label} className="trail-modal__tag">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="trail-modal__section">
            <h3>Informações gerais</h3>
            <div className="trail-modal__details">
              {generalDetails.map(({ label, value }) => (
                <dl key={label}>
                  <dt>{label}</dt>
                  <dd>{formatDetailValue(value)}</dd>
                </dl>
              ))}
            </div>
          </div>

          {trail.resumo ? (
            <div className="trail-modal__section">
              <h3>Resumo</h3>
              <p className="trail-modal__text">{trail.resumo}</p>
            </div>
          ) : null}

          {trail.descricao ? (
            <div className="trail-modal__section">
              <h3>Descrição</h3>
              <p className="trail-modal__text">{trail.descricao}</p>
            </div>
          ) : null}

          {guides.length > 0 ? (
            <div className="trail-modal__section">
              <h3>Guias vinculados</h3>
              <ul className="trail-modal__list">
                {guides.map((guide) => (
                  <li key={guide.id}>
                    {guide.nome}
                    {!guide.ativo ? ' (inativo)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sessions.length > 0 ? (
            <div className="trail-modal__section trail-modal__sessions">
              <h3>Sessões cadastradas</h3>
              {sessions.map((session) => (
                <div key={session.id} className="trail-modal__session">
                  <h4>{session.inicio}</h4>
                  <div className="trail-modal__session-meta">
                    {session.status ? <span><strong>Status:</strong> {session.status}</span> : null}
                    {session.guia ? <span><strong>Guia:</strong> {session.guia}</span> : null}
                    {typeof session.capacidade === 'number' ? (
                      <span>
                        <strong>Capacidade:</strong> {numberFormatter.format(session.capacidade)}
                      </span>
                    ) : null}
                    {typeof session.vagas === 'number' ? (
                      <span>
                        <strong>Vagas disponíveis:</strong> {numberFormatter.format(session.vagas)}
                      </span>
                    ) : null}
                    {typeof session.participantes === 'number' ? (
                      <span>
                        <strong>Participantes:</strong> {numberFormatter.format(session.participantes)}
                      </span>
                    ) : null}
                    {session.pontoEncontro ? (
                      <span>
                        <strong>Ponto de encontro:</strong> {session.pontoEncontro}
                      </span>
                    ) : null}
                    {session.fim ? (
                      <span>
                        <strong>Término:</strong> {session.fim}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (!modalRoot) {
    return null
  }

  return createPortal(modalContent, modalRoot)
}
