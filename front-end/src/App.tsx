import './App.css'
import type { JSX, ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Footer from './components/Footer'
import { useTranslation } from './i18n/TranslationProvider'
import { useAuth } from './context/AuthContext'
import AdminPage from './pages/AdminPage'
import CustomerAuthPage from './pages/CustomerAuthPage'
import FaunaFloraPage from './pages/FaunaFloraPage'
import GuidesPage from './pages/GuidesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Agendamento from './app/pages/Agendamento'

type RouteComponent = (props: PageProps) => JSX.Element

type RouteConfig = {
  path: string
  component: RouteComponent
  labelKey?: 'home' | 'guides' | 'booking' | 'faunaFlora' | 'admin'
  requireAdmin?: boolean
}

export type NavigateOptions = {
  search?: string
}

type PageProps = {
  navigation: ReactNode
  onNavigate: (path: string, options?: NavigateOptions) => void
  searchParams: URLSearchParams
}

const routes: RouteConfig[] = [
  { path: '/', labelKey: 'home', component: HomePage },
  { path: '/guias', labelKey: 'guides', component: GuidesPage },
  { path: '/agendamento', labelKey: 'booking', component: Agendamento },
  { path: '/fauna-e-flora', labelKey: 'faunaFlora', component: FaunaFloraPage },
  { path: '/admin', labelKey: 'admin', component: AdminPage, requireAdmin: true },
  { path: '/login', component: LoginPage },
  { path: '/cadastro', component: RegisterPage },
  { path: '/login-cliente', component: CustomerAuthPage },
  { path: '/area-cliente', component: CustomerAuthPage },
]

const normalizePath = (value: string) => {
  const [pathname] = value.split('?')
  if (pathname === '/') {
    return '/'
  }

  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed.length > 0 ? trimmed : '/'
}

function App() {
  const [location, setLocation] = useState(() => ({
    path: normalizePath(window.location.pathname),
    search: window.location.search ?? '',
  }))
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 16)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const navRef = useRef<HTMLElement | null>(null)
  const { content, toggleLanguage } = useTranslation()
  const { user, isAuthenticating, logout } = useAuth()
  const isAdmin = user?.tipo === 'A'
  const isCustomerLoginRoute =
    location.path === '/area-cliente' || location.path === '/login-cliente'

  useEffect(() => {
    const handlePopState = () => {
      setLocation({
        path: normalizePath(window.location.pathname),
        search: window.location.search ?? '',
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useLayoutEffect(() => {
    const element = navRef.current
    if (!element) {
      return
    }

    const updateHeight = () => {
      const nextHeight = Math.round(element.getBoundingClientRect().height)
      setNavHeight((current) => (current !== nextHeight ? nextHeight : current))
    }

    updateHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateHeight())
      observer.observe(element)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 960px)')
    const handleChange = () => {
      if (mediaQuery.matches) {
        setIsMenuOpen(false)
      }
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.path, location.search])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    if (!isMenuOpen) {
      return undefined
    }

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const navigate = useCallback((path: string, options?: NavigateOptions) => {
    const nextPath = normalizePath(path)
    const rawSearch = options?.search ?? ''
    const normalizedSearch = rawSearch
      ? rawSearch.startsWith('?')
        ? rawSearch
        : `?${rawSearch}`
      : ''

    setLocation((current) => {
      if (current.path === nextPath && current.search === normalizedSearch) {
        return current
      }

      const fullPath = `${nextPath}${normalizedSearch}`
      window.history.pushState({}, '', fullPath)
      window.scrollTo({ top: 0, behavior: 'auto' })
      return { path: nextPath, search: normalizedSearch }
    })
  }, [])

  useEffect(() => {
    if (!routes.some((route) => route.path === location.path)) {
      navigate('/')
    }
  }, [location.path, navigate])

  useEffect(() => {
    if (isAuthenticating) {
      return
    }

    if (location.path === '/admin') {
      if (!user) {
        navigate('/login', { search: 'redirect=/admin' })
        return
      }

      if (!isAdmin) {
        navigate('/')
      }
    }
  }, [isAdmin, isAuthenticating, location.path, navigate, user])

  const activeRoute = useMemo(
    () => routes.find((route) => route.path === location.path) ?? routes[0],
    [location.path],
  )

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )

  const navRoutes = useMemo(
    () =>
      routes.filter((route) => {
        if (!route.labelKey) {
          return false
        }
        if (route.requireAdmin && !isAdmin) {
          return false
        }
        return true
      }),
    [isAdmin],
  )

  const navigation = (
    <>
      <nav
        ref={navRef}
        className={`top-nav${
          isScrolled || isCustomerLoginRoute ? ' top-nav--scrolled' : ''
        }${isMenuOpen ? ' top-nav--open' : ''}`}
        aria-label="Principal"
      >
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            setIsMenuOpen(false)
            navigate('/')
          }}
          aria-label="AgenDunas - Página inicial"
        >
          <img className="brand-logo" src="/agendunaslogo.png" alt="Logo AgenDunas" width="40" height="40" />
          <span className="brand-text">AgenDunas</span>
        </a>
        <button
          type="button"
          className={`top-nav__mobile-toggle${isMenuOpen ? ' is-active' : ''}`}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? content.navigation.menuToggle.closeLabel : content.navigation.menuToggle.openLabel}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="sr-only">
            {isMenuOpen
              ? content.navigation.menuToggle.closeLabel
              : content.navigation.menuToggle.openLabel}
          </span>
          <span aria-hidden="true" className="top-nav__mobile-icon" />
        </button>
        <div className={`top-nav__content${isMenuOpen ? ' is-open' : ''}`} id="primary-navigation">
          <ul className="nav-links" role="list">
            {navRoutes.map((link) => (
              <li key={link.path} role="listitem">
                <a
                  href={link.path}
                  onClick={(event) => {
                    event.preventDefault()
                    setIsMenuOpen(false)
                    navigate(link.path)
                  }}
                  className={`nav-link ${activeRoute.path === link.path ? 'active' : ''}`}
                  aria-current={activeRoute.path === link.path ? 'page' : undefined}
                >
                  {link.labelKey ? content.navigation.links[link.labelKey]! : link.path}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <button
              type="button"
              className="translation-toggle"
              title={content.navigation.translationToggle.tooltip}
              aria-label={content.navigation.translationToggle.ariaLabel}
              onClick={() => {
                toggleLanguage()
                setIsMenuOpen(false)
              }}
            >
              <svg
                className="translation-toggle__icon"
                viewBox="0 0 24 24"
                role="img"
                aria-hidden="true"
              >
                <path
                  d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm6.93 8H16.1a14.45 14.45 0 0 0-1.2-5 7.52 7.52 0 0 1 4.03 5ZM12 4.5 A12.8 12.8 0 0 1 13.75 11h-3.5A12.8 12.8 0 0 1 12 4.5ZM4.07 11a7.52 7.52 0 0 1 4-5 14.45 14.45 0 0 0-1.2 5Zm0 2h2.85a14.45 14.45 0 0 0 1.2 5 7.52 7.52 0 0 1-4.05-5Zm7.93 6.5A12.8 12.8 0 0 1 10.25 13h3.5A12.8 12.8 0 0 1 12 19.5Zm3.9-1.5a14.45 14.45 0 0 0 1.2-5h2.83a7.52 7.52 0 0 1-4.03 5Z"
                  fill="currentColor"
                />
                <path
                  d="M21 4.5a2.5 2.5 0 0 0-5 0 2.46 2.46 0 0 0 .29 1.17l-4.76 4.76 1 1 4.76-4.76a2.46 2.46 0 0 0 1.17.29A2.5 2.5 0 0 0 21 4.5Zm-2.5.5a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5Z"
                  fill="currentColor"
                />
              </svg>
              <span className="translation-toggle__label">{content.navigation.translationToggle.label}</span>
            </button>
            {user ? (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setIsMenuOpen(false)
                  logout()
                  navigate('/')
                }}
              >
                Sair
              </button>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/area-cliente')
                }}
              >
                Entrar
              </button>
            )}
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/agendamento')
              }}
              aria-label={`${content.navigation.scheduleButton} - Agendar trilha guiada`}
            >
              {content.navigation.scheduleButton}
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`top-nav__backdrop${isMenuOpen ? ' is-visible' : ''}`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
      <div className="top-nav__spacer" aria-hidden="true" style={{ height: navHeight || undefined }} />
    </>
  )
  const Page = activeRoute.component

  return (
    <div className={`app route-${activeRoute.path.replace('/', '') || 'home'}`}>
      <Page navigation={navigation} onNavigate={navigate} searchParams={searchParams} />
      <Footer onNavigate={navigate} />
    </div>
  )
}

export type { PageProps }
export default App
