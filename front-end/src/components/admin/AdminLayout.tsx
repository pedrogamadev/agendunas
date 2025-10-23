import type { ReactNode } from 'react'
import './AdminLayout.css'

type AdminSection = {
  id: string
  label: string
  icon: ReactNode
}

type AdminHeader = {
  title: string
  description?: string
  actions?: ReactNode
}

type AdminLayoutProps = {
  sections: AdminSection[]
  activeSection: string
  onSelectSection: (id: string) => void
  children: ReactNode
  header: AdminHeader
}

function AdminLayout({ sections, activeSection, onSelectSection, header, children }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo" aria-hidden="true">
            <span>A</span>
          </div>
          <div className="admin-sidebar__meta">
            <span className="admin-sidebar__title">AgenDunas Admin</span>
            <span className="admin-sidebar__subtitle">Gestão do Parque</span>
          </div>
        </div>
        <nav className="admin-sidebar__nav" aria-label="Navegação principal">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`admin-sidebar__link${activeSection === section.id ? ' is-active' : ''}`}
              onClick={() => onSelectSection(section.id)}
            >
              <span className="admin-sidebar__icon" aria-hidden="true">
                {section.icon}
              </span>
              <span className="admin-sidebar__label">{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="admin-surface">
        <header className="admin-topbar">
          <form
            className="admin-topbar__search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="sr-only" htmlFor="admin-search">
              Buscar
            </label>
            <span className="admin-topbar__search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M10.5 4a6.5 6.5 0 1 0 4.03 11.57l3.95 3.95 1.06-1.06-3.95-3.95A6.5 6.5 0 0 0 10.5 4Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              id="admin-search"
              type="search"
              placeholder="Buscar agendamentos, pessoas, trilhas, eventos..."
              autoComplete="off"
            />
          </form>
          <div className="admin-topbar__actions" aria-label="Ações rápidas">
            <button type="button" className="admin-icon-button" title="Notificações" aria-label="Abrir notificações">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-4.5a6 6 0 1 0-12 0V16l-1.8 1.8a1 1 0 0 0 .7 1.7h14.2a1 1 0 0 0 .7-1.7Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button type="button" className="admin-icon-button" title="Central de Ajuda" aria-label="Abrir ajuda">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm.75 13.5h-1.5v-1.5h1.5Zm1.94-5.63-.74.78c-.5.5-.95.93-.95 1.85h-1.5V13a2.9 2.9 0 0 1 .85-2l.85-.88a1.41 1.41 0 0 0 .39-1 1.62 1.62 0 0 0-1.75-1.5 1.74 1.74 0 0 0-1.85 1.62h-1.5A3.23 3.23 0 0 1 12.04 5 3.16 3.16 0 0 1 15.36 8.37a2.72 2.72 0 0 1-.67 1.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="admin-user-chip" role="button" tabIndex={0} aria-label="Abrir menu do usuário">
              <div className="admin-user-chip__avatar" aria-hidden="true">
                <span>DS</span>
              </div>
              <div className="admin-user-chip__meta">
                <span className="admin-user-chip__name">Dora Silva</span>
                <span className="admin-user-chip__role">Coordenadora</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <div className="admin-content__header">
            <div>
              <h1>{header.title}</h1>
              {header.description ? <p>{header.description}</p> : null}
            </div>
            {header.actions ? <div className="admin-content__actions">{header.actions}</div> : null}
          </div>
          <div className="admin-content__body">{children}</div>
        </main>
      </div>
    </div>
  )
}

export type { AdminSection, AdminHeader }
export default AdminLayout
