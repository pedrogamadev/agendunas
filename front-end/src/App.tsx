import './App.css'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import BookingPage from './pages/BookingPage'
import FaunaFloraPage from './pages/FaunaFloraPage'
import GuidesPage from './pages/GuidesPage'
import HomePage from './pages/HomePage'

type RouteComponent = (props: PageProps) => JSX.Element

type RouteConfig = {
  path: string
  label: string
  component: RouteComponent
}

type PageProps = {
  navigation: ReactNode
  onNavigate: (path: string) => void
}

const routes: RouteConfig[] = [
  { path: '/', label: 'Home', component: HomePage },
  { path: '/guias', label: 'Guias', component: GuidesPage },
  { path: '/agendamento', label: 'Agendamento', component: BookingPage },
  { path: '/fauna-e-flora', label: 'Fauna & Flora', component: FaunaFloraPage },
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
        <span className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C7.03 6.5 4.5 10.73 4.5 14.67c0 4.43 3.36 7.33 7.5 7.33s7.5-2.9 7.5-7.33C19.5 10.73 16.97 6.5 12 2z"
              fill="currentColor"
            />
          </svg>
        </span>
        AgenDunas
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
            {link.label}
          </a>
        ))}
      </div>
      <button
        type="button"
        className="btn primary"
        onClick={() => navigate('/agendamento')}
      >
        Agendar Trilha
      </button>
    </nav>
  )

  const Page = activeRoute.component

  return (
    <div className={`app route-${activeRoute.path.replace('/', '') || 'home'}`}>
      <Page navigation={navigation} onNavigate={navigate} />
      <footer className="footer">
        <p>© {new Date().getFullYear()} AgenDunas. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

export type { PageProps }
export default App
