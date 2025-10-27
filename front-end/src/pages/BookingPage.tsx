import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'
import {
  createPublicBooking,
  fetchPublicGuides,
  fetchPublicTrails,
  type CreateBookingPayload,
} from '../api/public'
import { useAuth } from '../context/AuthContext'

type WeatherConditionKey =
  | 'clear'
  | 'mostlyClear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'freezingDrizzle'
  | 'rainLight'
  | 'rainHeavy'
  | 'freezingRain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown'

type WeatherSummary = {
  date: string
  maxTemperature: number
  minTemperature: number
  precipitationProbability: number | null
  condition: WeatherConditionKey
}

type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'success'; summary: WeatherSummary }

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) {
    return value
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function BookingPage({ navigation, onNavigate, searchParams }: PageProps) {
  const { content, language } = useTranslation()
  const booking = content.booking
  const guidesContent = content.guides
  const { user, isAuthenticating } = useAuth()
  type GuideOption = (typeof guidesContent.guides)[number] & { databaseCpf?: string }
  type TrailOption = (typeof booking.trails)[number] & { databaseId?: string }
  const [guideOptions, setGuideOptions] = useState<GuideOption[]>(
    guidesContent.guides.map((guide) => ({ ...guide, databaseCpf: undefined })),
  )
  const [trailOptions, setTrailOptions] = useState<TrailOption[]>(
    booking.trails.map((trail) => ({ ...trail, databaseId: trail.id })),
  )
  const guideParam = searchParams.get('guide')
  const selectedGuide = guideParam
    ? guideOptions.find(
        (guide) => guide.databaseCpf === guideParam || guide.id === guideParam,
      )
    : undefined
  const selectedTrail = selectedGuide
    ? trailOptions.find((trail) => trail.id === selectedGuide.featuredTrailId)
    : undefined
  const [selectedDate, setSelectedDate] = useState('')
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'idle' })
  const [showRainWarning, setShowRainWarning] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<
    | { type: 'success'; message: string; protocol?: string }
    | { type: 'error'; message: string }
    | null
  >(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const allowRainySubmitRef = useRef(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const heroStyle = {
    '--hero-background-image': `url(${booking.hero.photo})`,
  } as CSSProperties
  const isLoggedIn = Boolean(user)
  const needsIdentityForm = !isLoggedIn || !user?.email || (!user?.nome && !user?.sobrenome)
  const contactNameFromProfile = useMemo(() => {
    if (!user) {
      return ''
    }

    const parts: string[] = []
    if (typeof user.nome === 'string' && user.nome.trim()) {
      parts.push(user.nome.trim())
    }
    if (typeof user.sobrenome === 'string' && user.sobrenome.trim()) {
      parts.push(user.sobrenome.trim())
    }

    if (parts.length > 0) {
      return parts.join(' ')
    }

    return ''
  }, [user])
  const contactEmailFromProfile = typeof user?.email === 'string' ? user.email.trim() : ''
  const formattedBirthDate = useMemo(() => {
    if (!user?.dataNascimento) {
      return ''
    }

    const date = new Date(user.dataNascimento)
    if (Number.isNaN(date.getTime())) {
      return user.dataNascimento
    }

    const locale = language === 'pt' ? 'pt-BR' : 'en-US'
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
  }, [language, user?.dataNascimento])
  const customerSummaryItems = useMemo(() => {
    if (!user) {
      return [] as { label: string; value: string }[]
    }

    const items: { label: string; value: string }[] = []
    if (contactNameFromProfile) {
      items.push({ label: booking.form.name, value: contactNameFromProfile })
    }
    if (contactEmailFromProfile) {
      items.push({ label: booking.form.email, value: contactEmailFromProfile })
    }
    if (user.cpf) {
      items.push({ label: booking.form.documentLabel, value: formatCpf(user.cpf) })
    }
    if (user.cidadeOrigem) {
      items.push({ label: booking.form.originCityLabel, value: user.cidadeOrigem })
    }
    if (formattedBirthDate) {
      items.push({ label: booking.form.birthDateLabel, value: formattedBirthDate })
    }

    return items
  }, [
    booking.form.birthDateLabel,
    booking.form.documentLabel,
    booking.form.email,
    booking.form.name,
    booking.form.originCityLabel,
    contactEmailFromProfile,
    contactNameFromProfile,
    formattedBirthDate,
    user,
  ])
  const showCustomerSummary = isLoggedIn && !needsIdentityForm && customerSummaryItems.length > 0
  const shouldShowAuthPrompt = !isLoggedIn && !isAuthenticating
  const shouldShowAuthLoading = !isLoggedIn && isAuthenticating
  const authLoadingMessage = language === 'pt' ? 'Verificando sessão...' : 'Checking session...'
  const handleNavigateToLogin = useCallback(() => {
    onNavigate('/login', { search: 'redirect=/agendamento' })
  }, [onNavigate])
  const handleNavigateToCustomerArea = useCallback(() => {
    onNavigate('/area-cliente')
  }, [onNavigate])

  useEffect(() => {
    let isMounted = true

    const difficultyLabels: Record<string, string> = {
      EASY: 'Leve',
      MODERATE: 'Moderada',
      HARD: 'Desafiadora',
    }

    const formatDuration = (minutes: number) => {
      if (!Number.isFinite(minutes)) {
        return ''
      }

      const hours = Math.floor(minutes / 60)
      const remaining = Math.max(0, minutes - hours * 60)
      if (remaining === 0) {
        return `${hours}h`
      }

      return `${hours}h${String(remaining).padStart(2, '0')}`
    }

    fetchPublicTrails()
      .then((data) => {
        if (!isMounted || data.length === 0) {
          return
        }

        const mapped: TrailOption[] = data.map((trail) => ({
          id: trail.slug,
          databaseId: trail.id,
          label: trail.name,
          description: trail.summary ?? trail.description,
          duration: formatDuration(trail.durationMinutes),
          difficulty: difficultyLabels[trail.difficulty] ?? trail.difficulty,
        }))

        if (mapped.length > 0) {
          setTrailOptions(mapped)
        }
      })
      .catch(() => {
        /* mantém opções padrão quando API estiver indisponível */
      })

    fetchPublicGuides()
      .then((data) => {
        if (!isMounted || data.length === 0) {
          return
        }

        const mapped: GuideOption[] = data.map((guide) => ({
          id: guide.slug,
          databaseCpf: guide.cpf,
          name: guide.name,
          photo: guide.photoUrl ?? guidesContent.guides[0]?.photo ?? '',
          speciality: guide.speciality ?? guidesContent.guides[0]?.speciality ?? '',
          description:
            guide.summary ?? guide.biography ?? guidesContent.guides[0]?.description ?? '',
          trails: guide.toursCompleted > 0 ? guide.toursCompleted : guide.trails.length,
          experience: `${guide.experienceYears} anos guiando trilhas`,
          rating: guide.rating ?? guidesContent.guides[0]?.rating ?? 0,
          certifications:
            guide.certifications.length > 0
              ? guide.certifications
              : guidesContent.guides[0]?.certifications ?? [],
          languages: guide.languages.length > 0 ? guide.languages : ['Português'],
          curiosities:
            guide.curiosities.length > 0
              ? guide.curiosities
              : guidesContent.guides[0]?.curiosities ?? [],
          featuredTrailId:
            guide.featuredTrail?.slug ?? guidesContent.guides[0]?.featuredTrailId ?? undefined,
        }))

        if (mapped.length > 0) {
          setGuideOptions(mapped)
        }
      })
      .catch(() => {
        /* mantém o catálogo estático se não houver API */
      })

    return () => {
      isMounted = false
    }
  }, [booking.trails, guidesContent.guides])

  const dateFormatter = useMemo(() => {
    const locale = language === 'pt' ? 'pt-BR' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [language])

  const formatForecastDate = useCallback(
    (value: string) => {
      const date = new Date(`${value}T00:00:00`)
      if (Number.isNaN(date.getTime())) {
        return value
      }

      const formatted = dateFormatter.format(date)
      return formatted.charAt(0).toUpperCase() + formatted.slice(1)
    },
    [dateFormatter],
  )

  const getConditionKey = useCallback((code: number): WeatherConditionKey => {
    if (code === 0) return 'clear'
    if (code === 1) return 'mostlyClear'
    if (code === 2) return 'partlyCloudy'
    if (code === 3) return 'overcast'
    if (code === 45 || code === 48) return 'fog'
    if (code === 51 || code === 53 || code === 55) return 'drizzle'
    if (code === 56 || code === 57) return 'freezingDrizzle'
    if (code === 61 || code === 63 || code === 80 || code === 81) return 'rainLight'
    if (code === 65 || code === 82) return 'rainHeavy'
    if (code === 66 || code === 67) return 'freezingRain'
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86)
      return 'snow'
    if (code === 95 || code === 96 || code === 99) return 'thunderstorm'
    return 'unknown'
  }, [])

  const fetchWeather = useCallback(
    async (date: string) => {
      if (!date) {
        setWeatherState({ status: 'idle' })
        return
      }

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setWeatherState({ status: 'loading' })

      try {
        const params = new URLSearchParams({
          latitude: '-5.81063',
          longitude: '-35.19756',
          daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          timezone: 'America/Recife',
          start_date: date,
          end_date: date,
        })

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch weather')
        }

        const data = await response.json()
        const daily = data?.daily

        if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
          setWeatherState({ status: 'empty' })
          abortControllerRef.current = null
          return
        }

        const index = daily.time.findIndex((time: string) => time === date)

        if (index === -1) {
          setWeatherState({ status: 'empty' })
          abortControllerRef.current = null
          return
        }

        const weatherCode = Number(daily.weathercode?.[index])
        const maxTemperature = Number(daily.temperature_2m_max?.[index])
        const minTemperature = Number(daily.temperature_2m_min?.[index])
        const precipitationRaw = daily.precipitation_probability_max?.[index]
        const precipitationProbability =
          typeof precipitationRaw === 'number'
            ? Math.max(0, Math.min(100, Math.round(precipitationRaw)))
            : null

        if (Number.isNaN(maxTemperature) || Number.isNaN(minTemperature) || Number.isNaN(weatherCode)) {
          setWeatherState({ status: 'empty' })
          abortControllerRef.current = null
          return
        }

        const summary: WeatherSummary = {
          date,
          maxTemperature,
          minTemperature,
          precipitationProbability,
          condition: getConditionKey(weatherCode),
        }

        setWeatherState({ status: 'success', summary })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setWeatherState({ status: 'error' })
      } finally {
        abortControllerRef.current = null
      }
    },
    [getConditionKey],
  )

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSelectedDate(value)
      fetchWeather(value)
      setShowRainWarning(false)
    },
    [fetchWeather],
  )

  const handleTermsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setHasAcceptedTerms(event.target.checked)
  }, [])

  const handleOpenTermsModal = useCallback(() => {
    setShowTermsModal(true)
  }, [])

  const handleCloseTermsModal = useCallback(() => {
    setShowTermsModal(false)
  }, [])

  const handleAcceptTerms = useCallback(() => {
    setHasAcceptedTerms(true)
    setShowTermsModal(false)
  }, [])

  const isHighRainProbability =
    weatherState.status === 'success' &&
    typeof weatherState.summary.precipitationProbability === 'number' &&
    weatherState.summary.precipitationProbability > 10

  const rainWarningDescription = useMemo(() => {
    if (!isHighRainProbability) {
      return booking.rainWarningModal.description
    }

    const formattedDate = formatForecastDate(weatherState.summary.date)
    const probability = `${weatherState.summary.precipitationProbability}%`

    return booking.rainWarningModal.description
      .replace('{date}', formattedDate)
      .replace('{percentage}', probability)
  }, [booking.rainWarningModal.description, formatForecastDate, isHighRainProbability, weatherState])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (isSubmitting) {
        return
      }

      if (isHighRainProbability && !allowRainySubmitRef.current) {
        setShowRainWarning(true)
        return
      }

      allowRainySubmitRef.current = false
      setSubmissionResult(null)
      setIsSubmitting(true)

      const form = event.currentTarget
      const formData = new FormData(form)
      const trailKey = String(formData.get('trail') ?? '')
      const trailSelection = trailOptions.find((trail) => trail.id === trailKey)

      if (!trailSelection) {
        setSubmissionResult({ type: 'error', message: 'Selecione uma trilha válida.' })
        setIsSubmitting(false)
        return
      }

      const participantsRaw = Number.parseInt(String(formData.get('participants') ?? '1'), 10)
      const participantsCount = Number.isNaN(participantsRaw) ? 1 : participantsRaw
      const shouldUseProfileIdentity = isLoggedIn && !needsIdentityForm
      const contactName = shouldUseProfileIdentity
        ? contactNameFromProfile
        : String(formData.get('name') ?? '').trim()
      const contactEmail = shouldUseProfileIdentity
        ? contactEmailFromProfile
        : String(formData.get('email') ?? '').trim()
      const contactPhone = String(formData.get('phone') ?? '').trim()

      if (!contactName || !contactEmail) {
        setSubmissionResult({ type: 'error', message: booking.form.customerSummaryIncomplete })
        setIsSubmitting(false)
        return
      }

      const payload: CreateBookingPayload = {
        trailId: trailSelection.databaseId ?? trailSelection.id,
        contactName,
        contactEmail,
        contactPhone,
        scheduledDate: String(formData.get('date') ?? ''),
        scheduledTime: String(formData.get('time') ?? '') || undefined,
        participantsCount,
        notes: (formData.get('notes') as string | null) ?? undefined,
      }

      const guideSelection = guideParam
        ? guideOptions.find((guide) => guide.databaseCpf === guideParam || guide.id === guideParam)
        : undefined
      if (guideSelection?.databaseCpf) {
        payload.guideCpf = guideSelection.databaseCpf
      }

      try {
        const result = await createPublicBooking(payload)
        setSubmissionResult({
          type: 'success',
          message: 'Solicitação registrada! Em breve entraremos em contato para confirmação.',
          protocol: result.protocol,
        })
        form.reset()
        setHasAcceptedTerms(false)
        setSelectedDate('')
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar sua solicitação. Tente novamente mais tarde.'
        setSubmissionResult({ type: 'error', message })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      booking.form.customerSummaryIncomplete,
      contactEmailFromProfile,
      contactNameFromProfile,
      guideParam,
      guideOptions,
      isHighRainProbability,
      isLoggedIn,
      isSubmitting,
      needsIdentityForm,
      trailOptions,
    ],
  )

  const handleCloseRainWarning = useCallback(() => {
    setShowRainWarning(false)
    allowRainySubmitRef.current = false
  }, [])

  const handleProceedWithRain = useCallback(() => {
    setShowRainWarning(false)
    allowRainySubmitRef.current = true
    formRef.current?.requestSubmit()
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return (
    <div className="booking-page">
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

      <main className="page-main booking-main">
        <section className="booking-layout">
          {shouldShowAuthPrompt ? (
            <div className="booking-auth-card">
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
          ) : shouldShowAuthLoading ? (
            <div className="booking-auth-card booking-auth-card--loading" role="status" aria-live="polite">
              <div className="booking-auth-spinner" aria-hidden="true" />
              <p>{authLoadingMessage}</p>
            </div>
          ) : (
            <form ref={formRef} className="booking-form" onSubmit={handleSubmit}>
              <h2>{booking.form.title}</h2>
              {showCustomerSummary ? (
                <section className="customer-summary">
                  <div className="customer-summary__header">
                    <h3>{booking.form.customerSummaryTitle}</h3>
                    <p>{booking.form.customerSummaryDescription}</p>
                  </div>
                  <dl className="customer-summary__list">
                    {customerSummaryItems.map((item) => (
                      <div key={`${item.label}-${item.value}`} className="customer-summary__item">
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {booking.form.customerSummaryHint ? (
                    <p className="customer-summary__hint">
                      {booking.form.customerSummaryHint}{' '}
                      <button
                        type="button"
                        className="customer-summary__manage"
                        onClick={handleNavigateToCustomerArea}
                      >
                        {booking.form.customerSummaryManage}
                      </button>
                    </p>
                  ) : null}
                </section>
              ) : null}
              <div className="booking-grid">
                {isLoggedIn && needsIdentityForm ? (
                  <div className="customer-summary-notice input-full">
                    <p>{booking.form.customerSummaryIncomplete}</p>
                    <button type="button" onClick={handleNavigateToCustomerArea}>
                      {booking.form.customerSummaryManage}
                    </button>
                  </div>
                ) : null}
                {needsIdentityForm ? (
                  <>
                    <label className="input-field">
                      <span>{booking.form.name}</span>
                      <input
                        type="text"
                        name="name"
                        placeholder={booking.form.namePlaceholder}
                        required
                        defaultValue={contactNameFromProfile}
                      />
                    </label>
                    <label className="input-field">
                      <span>{booking.form.email}</span>
                      <input
                        type="email"
                        name="email"
                        placeholder={booking.form.emailPlaceholder}
                        required
                        defaultValue={contactEmailFromProfile}
                      />
                    </label>
                  </>
                ) : null}
                <label className="input-field">
                  <span>{booking.form.phone}</span>
                  <input type="tel" name="phone" placeholder={booking.form.phonePlaceholder} required />
                </label>
                <label className="input-field">
                  <span>{booking.form.trail}</span>
                  <select name="trail" required defaultValue={selectedTrail?.id ?? ''}>
                    <option value="" disabled>
                      {booking.form.selectPlaceholder}
                    </option>
                    {trailOptions.map((trail) => (
                      <option key={trail.id} value={trail.id}>
                        {trail.label} · {trail.duration}
                      </option>
                    ))}
                  </select>
                  <small className="field-help">{booking.form.helpText}</small>
                </label>
                <label className="input-field">
                  <span>{booking.form.date}</span>
                  <input type="date" name="date" value={selectedDate} onChange={handleDateChange} required />
                </label>
                <label className="input-field">
                  <span>{booking.form.time}</span>
                  <input type="time" name="time" required />
                </label>
                <label className="input-field">
                  <span>{booking.form.participants}</span>
                  <input type="number" name="participants" min={1} max={20} defaultValue={1} required />
                </label>
                <label className="input-field input-full">
                  <span>{booking.form.notes}</span>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder={booking.form.notesPlaceholder}
                  />
                </label>
              </div>
              <div className="terms-consent">
                <label className="terms-consent__checkbox">
                  <input
                    type="checkbox"
                    name="termsConsent"
                    required
                    checked={hasAcceptedTerms}
                    onChange={handleTermsChange}
                  />
                  <span>{booking.terms.checkboxLabel}</span>
                </label>
                <button type="button" className="terms-consent__open" onClick={handleOpenTermsModal}>
                  {booking.terms.openModal}
                </button>
              </div>
              {submissionResult && (
                <div
                  className={`form-feedback form-feedback--${submissionResult.type}`}
                  role="status"
                  aria-live="polite"
                >
                  <p>
                    {submissionResult.message}
                    {submissionResult.type === 'success' && submissionResult.protocol ? (
                      <>
                        <br />
                        <strong>Protocolo:</strong> {submissionResult.protocol}
                      </>
                    ) : null}
                  </p>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn solid" disabled={!hasAcceptedTerms || isSubmitting}>
                  {booking.form.submit}
                </button>
                <p className="form-disclaimer">{booking.form.disclaimer}</p>
              </div>
            </form>
          )}
          <aside className="booking-sidebar">
            <div className="selected-guide-card">
              <h3>{booking.guideSummary.title}</h3>
              {selectedGuide ? (
                <>
                  <div className="selected-guide-card__header">
                    <img
                      src={selectedGuide.photo}
                      alt={content.guides.meta.photoAltTemplate.replace('{name}', selectedGuide.name)}
                      loading="lazy"
                    />
                    <div className="selected-guide-card__info">
                      <strong>{selectedGuide.name}</strong>
                      <span>{selectedGuide.speciality}</span>
                    </div>
                  </div>
                  {selectedTrail && (
                    <div className="selected-guide-card__trail">
                      <span className="selected-guide-card__trail-label">{booking.guideSummary.trailLabel}</span>
                      <strong>{selectedTrail.label}</strong>
                      <span className="selected-guide-card__trail-details">{selectedTrail.description}</span>
                    </div>
                  )}
                  <p className="selected-guide-card__note">{booking.guideSummary.changeMessage}</p>
                </>
              ) : (
                <p className="selected-guide-card__empty">{booking.guideSummary.emptyMessage}</p>
              )}
            </div>
            <div className="booking-map">
              <h2>{booking.sidebar.locationTitle}</h2>
              <div className="map-frame">
                <iframe
                  title={booking.sidebar.mapTitle}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3592.026426769827!2d-35.19756052547422!3d-5.810629257306963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b2ffe742b9133f%3A0xec2b60cecae02a3c!2sParque%20das%20Dunas%20-%20Bosque%20dos%20Namorados!5e1!3m2!1spt-BR!2sbr!4v1759068531397!5m2!1spt-BR!2sbr"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <address>
                <strong>{booking.sidebar.address}</strong>
                <span>{booking.sidebar.addressComplement}</span>
              </address>
            </div>

            <div className="weather-card">
              <h3>{booking.weather.title}</h3>
              <p className="weather-card__subtitle">{booking.weather.subtitle}</p>
              {selectedDate === '' ? (
                <p className="weather-card__placeholder">{booking.weather.selectDatePrompt}</p>
              ) : weatherState.status === 'loading' ? (
                <p className="weather-card__placeholder">{booking.weather.loading}</p>
              ) : weatherState.status === 'error' ? (
                <p className="weather-card__error">{booking.weather.error}</p>
              ) : weatherState.status === 'empty' ? (
                <p className="weather-card__placeholder">{booking.weather.empty}</p>
              ) : weatherState.status === 'success' ? (
                <div className="weather-card__details">
                  <p className="weather-card__date">
                    {booking.weather.forecastFor.replace(
                      '{date}',
                      formatForecastDate(weatherState.summary.date),
                    )}
                  </p>
                  <p className="weather-card__condition">
                    {booking.weather.conditions[weatherState.summary.condition]}
                  </p>
                  <div className="weather-card__metrics">
                    <div>
                      <span>{booking.weather.temperatureLabel}</span>
                      <strong>
                        {booking.weather.maxLabel} {Math.round(weatherState.summary.maxTemperature)}°C ·{' '}
                        {booking.weather.minLabel} {Math.round(weatherState.summary.minTemperature)}°C
                      </strong>
                    </div>
                    <div>
                      <span>{booking.weather.precipitationLabel}</span>
                      <strong>
                        {typeof weatherState.summary.precipitationProbability === 'number'
                          ? `${weatherState.summary.precipitationProbability}%`
                          : booking.weather.precipitationFallback}
                      </strong>
                    </div>
                  </div>
                  <span className="weather-card__source">{booking.weather.sourceLabel}</span>
                </div>
              ) : null}
            </div>

            <div className="contact-card">
              <h3>{booking.sidebar.contactTitle}</h3>
              <ul>
                <li>
                  <span>{booking.sidebar.phone}</span>
                  <strong>{booking.sidebar.phoneValue}</strong>
                </li>
                <li>
                  <span>{booking.sidebar.whatsapp}</span>
                  <strong>{booking.sidebar.whatsappValue}</strong>
                </li>
                <li>
                  <span>{booking.sidebar.email}</span>
                  <strong>{booking.sidebar.emailValue}</strong>
                </li>
                <li>
                  <span>{booking.sidebar.schedule}</span>
                  <strong>{booking.sidebar.scheduleValue}</strong>
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>{booking.sidebar.infoTitle}</h3>
              <ul>
                {booking.sidebar.infoItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>

      {showRainWarning && (
        <div className="rain-warning-modal" role="presentation">
          <div
            className="rain-warning-modal__backdrop"
            aria-hidden="true"
            onClick={handleCloseRainWarning}
          />
          <div
            className="rain-warning-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rain-warning-title"
            aria-describedby="rain-warning-description"
          >
            <div className="rain-warning-modal__content">
              <span className="rain-warning-modal__tag">{booking.rainWarningModal.tag}</span>
              <h3 id="rain-warning-title">{booking.rainWarningModal.title}</h3>
              <p id="rain-warning-description">{rainWarningDescription}</p>
              {isHighRainProbability && (
                <p className="rain-warning-modal__highlight">
                  {booking.rainWarningModal.highlight.replace(
                    '{percentage}',
                    `${weatherState.summary.precipitationProbability}%`,
                  )}
                </p>
              )}
              <div className="rain-warning-modal__actions">
                <button type="button" className="btn ghost" onClick={handleCloseRainWarning}>
                  {booking.rainWarningModal.changeDate}
                </button>
                <button type="button" className="btn solid" onClick={handleProceedWithRain}>
                  {booking.rainWarningModal.proceed}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showTermsModal && (
        <div className="terms-modal" role="presentation">
          <div className="terms-modal__backdrop" aria-hidden="true" onClick={handleCloseTermsModal} />
          <div
            className="terms-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            <div className="terms-modal__content">
              <h3 id="terms-modal-title">{booking.terms.modalTitle}</h3>
              {booking.terms.modalIntro ? (
                <p className="terms-modal__intro">{booking.terms.modalIntro}</p>
              ) : null}
              <div className="terms-modal__body">
                {booking.terms.sections.map((section, index) => (
                  <section
                    key={section.heading ? section.heading : `terms-section-${index}`}
                    className="terms-modal__section"
                  >
                    {section.heading ? <h4>{section.heading}</h4> : null}
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`terms-paragraph-${index}-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                    {section.list ? (
                      <ul>
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
              <div className="terms-modal__actions">
                <button type="button" className="btn ghost" onClick={handleCloseTermsModal}>
                  {booking.terms.closeLabel}
                </button>
                <button type="button" className="btn solid" onClick={handleAcceptTerms}>
                  {booking.terms.acceptLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPage
