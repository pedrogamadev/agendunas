import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'

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

function BookingPage({ navigation, searchParams }: PageProps) {
  const { content, language } = useTranslation()
  const booking = content.booking
  const guideId = searchParams.get('guide')
  const selectedGuide = guideId
    ? content.guides.guides.find((guide) => guide.id === guideId)
    : undefined
  const selectedTrail = selectedGuide
    ? booking.trails.find((trail) => trail.id === selectedGuide.featuredTrailId)
    : undefined
  const [selectedDate, setSelectedDate] = useState('')
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'idle' })
  const abortControllerRef = useRef<AbortController | null>(null)
  const heroStyle = {
    '--hero-background-image': `url(${booking.hero.photo})`,
  } as CSSProperties

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
    },
    [fetchWeather],
  )

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
          <form className="booking-form">
            <h2>{booking.form.title}</h2>
            <div className="booking-grid">
              <label className="input-field">
                <span>{booking.form.name}</span>
                <input type="text" name="name" placeholder={booking.form.namePlaceholder} required />
              </label>
              <label className="input-field">
                <span>{booking.form.email}</span>
                <input type="email" name="email" placeholder={booking.form.emailPlaceholder} required />
              </label>
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
                  {booking.trails.map((trail) => (
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
            <div className="form-actions">
              <button type="submit" className="btn solid">
                {booking.form.submit}
              </button>
              <p className="form-disclaimer">{booking.form.disclaimer}</p>
            </div>
          </form>

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
    </div>
  )
}

export default BookingPage
