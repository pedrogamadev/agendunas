import type { CSSProperties, JSX } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { PageProps } from '../../App'
import BookingPage from '../../pages/BookingPage'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../i18n/TranslationProvider'

function Agendamento({ navigation, onNavigate, searchParams, params }: PageProps): JSX.Element {
  const { account, isAuthenticating } = useAuth()
  const { content, language } = useTranslation()
  const booking = content.booking
  const reservationIdFromParams = params.reservaId ?? ''
  const fallbackReservationIdRef = useRef(
    reservationIdFromParams ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Date.now().toString(36)),
  )
  const reservationId = reservationIdFromParams || fallbackReservationIdRef.current
  const heroStyle = useMemo(
    () => ({ '--hero-background-image': `url(${booking.hero.photo})` }) as CSSProperties,
    [booking.hero.photo],
  )

  const handleNavigateToLogin = useCallback(() => {
    onNavigate('/login-cliente', { search: `redirect=/agendamento/${reservationId}` })
  }, [onNavigate, reservationId])

  useEffect(() => {
    if (!account || reservationIdFromParams) {
      return
    }

    onNavigate(`/agendamento/${reservationId}`)
  }, [account, onNavigate, reservationId, reservationIdFromParams])

  const authLoadingMessage = language === 'pt' ? 'Verificando sessão...' : 'Checking session...'
  const shouldShowAuthPrompt = !account && !isAuthenticating
  const shouldShowAuthLoading = !account && isAuthenticating

  if (account) {
    return (
      <BookingPage
        navigation={navigation}
        onNavigate={onNavigate}
        searchParams={searchParams}
        wizardMode="page"
        reservationId={reservationId}
        path={`/agendamento/${reservationId}`}
        params={{ reservaId: reservationId }}
      />
    )
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
