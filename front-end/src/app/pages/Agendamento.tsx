import type { CSSProperties, JSX } from 'react'
import { useCallback, useMemo } from 'react'
import type { PageProps } from '../../App'
import BookingPage from '../../pages/BookingPage'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../i18n/TranslationProvider'

function Agendamento({ navigation, onNavigate, searchParams }: PageProps): JSX.Element {
  const { user, isAuthenticating } = useAuth()
  const { content, language } = useTranslation()
  const booking = content.booking
  const heroStyle = useMemo(
    () => ({ '--hero-background-image': `url(${booking.hero.photo})` }) as CSSProperties,
    [booking.hero.photo],
  )

  const handleNavigateToLogin = useCallback(() => {
    onNavigate('/login-cliente', { search: 'redirect=/agendamento' })
  }, [onNavigate])

  const authLoadingMessage = language === 'pt' ? 'Verificando sessão...' : 'Checking session...'
  const shouldShowAuthPrompt = !user && !isAuthenticating
  const shouldShowAuthLoading = !user && isAuthenticating

  if (user) {
    return <BookingPage navigation={navigation} onNavigate={onNavigate} searchParams={searchParams} />
  }

  return (
    <div className="agendamento-page">
      <header className="page-hero booking-hero" style={heroStyle}>
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">{booking.hero.tag}</span>
          <h1>
            {booking.hero.title.prefix}
            <span>{booking.hero.title.highlight}</span>
            {booking.hero.title.suffix ?? ''}
          </h1>
          <p>{booking.hero.description}</p>
        </div>
      </header>

      <main className="page-main agendamento-main">
        <section className="agendamento-layout">
          {shouldShowAuthPrompt ? (
            <div className="booking-auth-card agendamento-auth-card">
              <div className="booking-auth-card__content">
                <h2>{booking.authPrompt.title}</h2>
                <p>{booking.authPrompt.description}</p>
                <div className="booking-auth-card__actions">
                  <button type="button" className="btn solid" onClick={handleNavigateToLogin}>
                    {booking.authPrompt.cta}
                  </button>
                </div>
              </div>
              <div
                className="booking-auth-animation"
                role="img"
                aria-label={booking.authPrompt.animationLabel}
              >
                <span className="booking-auth-animation__orb booking-auth-animation__orb--lg" />
                <span className="booking-auth-animation__orb booking-auth-animation__orb--md" />
                <span className="booking-auth-animation__orb booking-auth-animation__orb--sm" />
              </div>
            </div>
          ) : null}

          {shouldShowAuthLoading ? (
            <div className="booking-auth-card booking-auth-card--loading" role="status" aria-live="polite">
              <div className="booking-auth-spinner" aria-hidden="true" />
              <p>{authLoadingMessage}</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default Agendamento
