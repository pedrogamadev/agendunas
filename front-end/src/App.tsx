import './App.css'
import type { JSX, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from './i18n/TranslationProvider'
import BookingPage from './pages/BookingPage'
import FaunaFloraPage from './pages/FaunaFloraPage'
import GuidesPage from './pages/GuidesPage'
import HomePage from './pages/HomePage'

type RouteComponent = (props: PageProps) => JSX.Element

type RouteConfig = {
  path: string
  labelKey: 'home' | 'guides' | 'booking' | 'faunaFlora'
  component: RouteComponent
}

type PageProps = {
  navigation: ReactNode
  onNavigate: (path: string) => void
}

const routes: RouteConfig[] = [
  { path: '/', labelKey: 'home', component: HomePage },
  { path: '/guias', labelKey: 'guides', component: GuidesPage },
  { path: '/agendamento', labelKey: 'booking', component: BookingPage },
  { path: '/fauna-e-flora', labelKey: 'faunaFlora', component: FaunaFloraPage },
]

const normalizePath = (value: string) => {
  if (value === '/') {
    return '/'
  }

  const trimmed = value.replace(/\/+$/, '')
  return trimmed.length > 0 ? trimmed : '/'
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname))
  const { content, toggleLanguage } = useTranslation()

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path: string) => {
    const nextPath = normalizePath(path)
    if (nextPath === currentPath) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setCurrentPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  useEffect(() => {
    if (!routes.some((route) => route.path === currentPath)) {
      navigate('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  const activeRoute = useMemo(
    () => routes.find((route) => route.path === currentPath) ?? routes[0],
    [currentPath],
  )

  const navigation = (
    <nav className="top-nav">
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault()
          navigate('/')
        }}
      >
        <img className="brand-logo" src="/agendunaslogo.png" alt="Logo AgenDunas" />
        <span className="brand-text">AgenDunas</span>
      </a>
      <div className="nav-links">
        {routes.map((link) => (
          <a
            key={link.path}
            href={link.path}
            onClick={(event) => {
              event.preventDefault()
              navigate(link.path)
            }}
            className={`nav-link ${activeRoute.path === link.path ? 'active' : ''}`}
          >
            {content.navigation.links[link.labelKey]}
          </a>
        ))}
      </div>
      <div className="nav-actions">
        <button
          type="button"
          className="translation-toggle"
          title={content.navigation.translationToggle.tooltip}
          aria-label={content.navigation.translationToggle.ariaLabel}
          onClick={toggleLanguage}
        >
          <svg
            className="translation-toggle__icon"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path
              d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm6.93 8H16.1a14.45 14.45 0 0 0-1.2-5 7.52 7.52 0 0 1 4.03 5ZM12 4.5A12.8 12.8 0 0 1 13.75 11h-3.5A12.8 12.8 0 0 1 12 4.5ZM4.07 11a7.52 7.52 0 0 1 4-5 14.45 14.45 0 0 0-1.2 5Zm0 2h2.85a14.45 14.45 0 0 0 1.2 5 7.52 7.52 0 0 1-4.05-5Zm7.93 6.5A12.8 12.8 0 0 1 10.25 13h3.5A12.8 12.8 0 0 1 12 19.5Zm3.9-1.5a14.45 14.45 0 0 0 1.2-5h2.83a7.52 7.52 0 0 1-4.03 5Z"
              fill="currentColor"
            />
            <path
              d="M21 4.5a2.5 2.5 0 0 0-5 0 2.46 2.46 0 0 0 .29 1.17l-4.76 4.76 1 1 4.76-4.76a2.46 2.46 0 0 0 1.17.29A2.5 2.5 0 0 0 21 4.5Zm-2.5.5a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5Z"
              fill="currentColor"
            />
          </svg>
          <span className="translation-toggle__label">{content.navigation.translationToggle.label}</span>
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => navigate('/agendamento')}
        >
          {content.navigation.scheduleButton}
        </button>
      </div>
    </nav>
  )

  const Page = activeRoute.component

  return (
    <div className={`app route-${activeRoute.path.replace('/', '') || 'home'}`}>
      <Page navigation={navigation} onNavigate={navigate} />
      <footer className="footer">
        <p>{content.footer.text.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  )
}

export type { PageProps }
export default App
