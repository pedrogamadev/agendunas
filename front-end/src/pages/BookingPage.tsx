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
import type { TranslationContent } from '../i18n/translations'
import {
  createPublicBooking,
  fetchPublicGuides,
  fetchPublicTrails,
  type CreateBookingPayload,
  type PublicTrailSessionGroup,
} from '../api/public'
import { formatCpf, formatCpfForInput, sanitizeCpf } from '../utils/cpf'
import { formatPhoneForDisplay, sanitizePhoneNumber } from '../utils/phone'

type BookingContent = TranslationContent['booking']

type BookingPageProps = PageProps & {
  wizardMode?: 'modal' | 'page'
  reservationId?: string
}

type GuideOption = {
  id: string
  name: string
  photo: string
  speciality: string
  description: string
  trails: number
  experience: string
  rating: number
  certifications: string[]
  languages: string[]
  curiosities: string[]
  featuredTrailId?: string
  databaseCpf?: string
}

type TrailOption = {
  id: string
  label: string
  description: string
  duration: string
  difficulty?: string
  availableSpots: number
  databaseId?: string
  sessions: PublicTrailSessionGroup[]
  contactPhone?: string | null
  guides: {
    name: string
    phone?: string | null
  }[]
}

type NormalizedSession = (PublicTrailSessionGroup['slots'][number] & {
  date: string
  dateLabel: string
}) | null
import { useAuth } from '../context/AuthContext'
import './BookingPage.css'

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

const DEFAULT_MAX_PARTICIPANTS = 10

function BookingPage({ navigation, onNavigate, searchParams, wizardMode = 'modal' }: BookingPageProps) {
  const { content, language } = useTranslation()
  const booking = content.booking
  const guidesContent = content.guides
  const { account, isAuthenticating } = useAuth()
  const [guideOptions, setGuideOptions] = useState<GuideOption[]>(
    guidesContent.guides.map((guide) => ({ ...guide, databaseCpf: undefined })),
  );
  const [trailOptions, setTrailOptions] = useState<TrailOption[]>(
    booking.trails.map((trail) => ({
      ...trail,
      databaseId: trail.id,
      sessions: Array.isArray((trail as { sessions?: PublicTrailSessionGroup[] }).sessions)
        ? ((trail as { sessions?: PublicTrailSessionGroup[] }).sessions as PublicTrailSessionGroup[])
        : [],
      guides: 'guides' in trail && Array.isArray(trail.guides) ? trail.guides : [],
    })),
  )
  const guideParam = searchParams.get('guide')
  const selectedGuide = guideParam
    ? guideOptions.find(
        (guide) => guide.databaseCpf === guideParam || guide.id === guideParam,
      )
    : undefined
  const [selectedTrailId, setSelectedTrailId] = useState<string>(
    selectedGuide?.featuredTrailId ?? '',
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const isPageWizard = wizardMode === 'page'
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
  const [participantsCount, setParticipantsCount] = useState(1)
  const [participants, setParticipants] = useState<Array<{ fullName: string; cpf: string }>>([
    { fullName: '', cpf: '' },
  ])

  const accountFirstName = (account?.nome ?? '').trim()
  const accountLastName = (account?.sobrenome ?? '').trim()
  const accountEmail = account
    ? account.kind === 'cliente'
      ? account.email.trim()
      : account.email?.trim() ?? ''
    : ''
  const accountBirthDate = account?.dataNascimento ?? null
  const accountCity = account?.cidadeOrigem ?? ''
  const accountCpf = account?.cpf ?? ''
  const selectedTrailOption = useMemo(
    () => trailOptions.find((trail) => trail.id === selectedTrailId),
    [selectedTrailId, trailOptions],
  )
  const availableSessionGroups = useMemo(
    () => selectedTrailOption?.sessions ?? [],
    [selectedTrailOption],
  )
  const sessionEntries = useMemo(
    () =>
      availableSessionGroups.flatMap((group) =>
        group.slots.map((slot) => ({ groupDate: group.date, groupLabel: group.dateLabel, slot })),
      ),
    [availableSessionGroups],
  )
  const selectedSession = useMemo<NormalizedSession>(() => {
    const match = sessionEntries.find((entry) => entry.slot.id === selectedSessionId)
    if (!match) {
      return null
    }

    return {
      ...match.slot,
      date: match.groupDate,
      dateLabel: match.groupLabel,
    }
  }, [sessionEntries, selectedSessionId])
  const hasPublishedSessions = useMemo(
    () =>
      availableSessionGroups.some((group) =>
        group.slots.some((slot) => slot.status === 'SCHEDULED'),
      ),
    [availableSessionGroups],
  )
  useEffect(() => {
    if (!selectedTrailOption) {
      setSelectedSessionId('')
      return
    }

    const stillValid = sessionEntries.some((entry) => entry.slot.id === selectedSessionId)
    if (!stillValid) {
      setSelectedSessionId('')
    }
  }, [selectedTrailOption, sessionEntries, selectedSessionId])
  useEffect(() => {
    if (previousTrailIdRef.current !== selectedTrailId) {
      if (!hasPublishedSessions) {
        setSelectedDate('')
      }
      previousTrailIdRef.current = selectedTrailId
    }
  }, [selectedTrailId, hasPublishedSessions])
  const maxParticipants = selectedSession
    ? Math.max(1, selectedSession.availableSpots)
    : selectedTrailOption
    ? Math.max(1, selectedTrailOption.availableSpots)
    : DEFAULT_MAX_PARTICIPANTS
  const participantOptions = useMemo(
    () =>
      Array.from({ length: Math.max(1, maxParticipants) }, (_, index) => {
        const count = index + 1
        if (count === 1) {
          return { value: count, label: booking.form.participantsSelfOption }
        }

        const guests = count - 1
        const guestLabel =
          guests === 1 ? booking.form.participantsGuestSingular : booking.form.participantsGuestPlural
        const label = booking.form.participantsGuestOption
          .replace('{count}', String(count))
          .replace('{guests}', String(guests))
          .replace('{guestLabel}', guestLabel)

        return { value: count, label }
      }),
    [
      booking.form.participantsGuestOption,
      booking.form.participantsGuestPlural,
      booking.form.participantsGuestSingular,
      booking.form.participantsSelfOption,
      maxParticipants,
    ],
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const allowRainySubmitRef = useRef(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const previousTrailIdRef = useRef<string | null>(null)
  const heroStyle = {
    '--hero-background-image': `url(${booking.hero.photo})`,
  } as CSSProperties
  const isLoggedIn = Boolean(account)
  const needsIdentityForm =
    !isLoggedIn || !accountEmail || (!accountFirstName && !accountLastName)
  const contactNameFromProfile = useMemo(() => {
    if (!account) {
      return ''
    }

    const parts: string[] = []
    if (accountFirstName) {
      parts.push(accountFirstName)
    }
    if (accountLastName) {
      parts.push(accountLastName)
    }

    return parts.join(' ').trim()
  }, [account, accountFirstName, accountLastName])
  const firstParticipantLocked = isLoggedIn && Boolean(contactNameFromProfile || accountCpf)
  const contactEmailFromProfile = accountEmail
  const formattedBirthDate = useMemo(() => {
    if (!accountBirthDate) {
      return ''
    }

    const date = new Date(accountBirthDate)
    if (Number.isNaN(date.getTime())) {
      return accountBirthDate
    }

    const locale = language === 'pt' ? 'pt-BR' : 'en-US'
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
  }, [accountBirthDate, language])
  const customerSummaryItems = useMemo(() => {
    if (!account) {
      return [] as { label: string; value: string }[]
    }

    const items: { label: string; value: string }[] = []
    if (contactNameFromProfile) {
      items.push({ label: booking.form.name, value: contactNameFromProfile })
    }
    if (contactEmailFromProfile) {
      items.push({ label: booking.form.email, value: contactEmailFromProfile })
    }
    if (accountCpf) {
      items.push({ label: booking.form.documentLabel, value: formatCpf(accountCpf) })
    }
    if (accountCity) {
      items.push({ label: booking.form.originCityLabel, value: accountCity })
    }
    if (formattedBirthDate) {
      items.push({ label: booking.form.birthDateLabel, value: formattedBirthDate })
    }

    return items
  }, [
    account,
    accountCity,
    accountCpf,
    booking.form.birthDateLabel,
    booking.form.documentLabel,
    booking.form.email,
    booking.form.name,
    booking.form.originCityLabel,
    contactEmailFromProfile,
    contactNameFromProfile,
    formattedBirthDate,
  ])
  const showCustomerSummary = isLoggedIn && !needsIdentityForm && customerSummaryItems.length > 0
  const shouldShowAuthPrompt = !isLoggedIn && !isAuthenticating
  const shouldShowAuthLoading = !isLoggedIn && isAuthenticating
  const authLoadingMessage = language === 'pt' ? 'Verificando sessão...' : 'Checking session...'
  const updateParticipantsCount = useCallback(
    (nextCount: number) => {
      const normalized = Math.max(1, nextCount)
      setParticipantsCount(normalized)
      setParticipants((previous) => {
        const next = previous.slice(0, normalized)
        while (next.length < normalized) {
          next.push({ fullName: '', cpf: '' })
        }

        if (firstParticipantLocked) {
          next[0] = {
            fullName: contactNameFromProfile || '',
            cpf: accountCpf ? sanitizeCpf(accountCpf) : '',
          }
        }

        return next
      })
    },
    [accountCpf, contactNameFromProfile, firstParticipantLocked],
  )
  useEffect(() => {
    const maxOption = participantOptions[participantOptions.length - 1]?.value ?? 1
    if (participantsCount > maxOption) {
      updateParticipantsCount(maxOption)
    }
  }, [participantOptions, participantsCount, updateParticipantsCount])
  const handleNavigateToLogin = useCallback(() => {
    onNavigate('/login-cliente', { search: 'redirect=/agendamento' })
  }, [onNavigate])
  const handleNavigateToCustomerArea = useCallback(() => {
    onNavigate('/area-cliente')
  }, [onNavigate])

  const handleOpenWizard = useCallback(() => {
    setSubmissionResult(null)
    setShowRainWarning(false)
    setIsWizardOpen(true)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false)
  }, [])

  useEffect(() => {
    if (!firstParticipantLocked) {
      return
    }

    setParticipants((previous) => {
      const next = previous.slice()

      if (next.length === 0) {
        next.push({ fullName: '', cpf: '' })
      }

      next[0] = {
        fullName: contactNameFromProfile || '',
        cpf: accountCpf ? sanitizeCpf(accountCpf) : '',
      }

      return next
    })
  }, [accountCpf, contactNameFromProfile, firstParticipantLocked, sanitizeCpf])

  useEffect(() => {
    if (!selectedGuide?.featuredTrailId) {
      return
    }

    setSelectedTrailId((current) => (current ? current : selectedGuide.featuredTrailId!))
  }, [selectedGuide?.featuredTrailId])

  useEffect(() => {
    if (!selectedTrailId) {
      return
    }

    const exists = trailOptions.some((trail) => trail.id === selectedTrailId)
    if (!exists) {
      setSelectedTrailId('')
    }
  }, [selectedTrailId, trailOptions])

  const fetchPublicCatalog = useCallback(async () => {
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

    const [trailsResult, guidesResult] = await Promise.allSettled([
      fetchPublicTrails(),
      fetchPublicGuides(),
    ])

    const catalog: { trails?: TrailOption[]; guides?: GuideOption[] } = {}

    if (trailsResult.status === 'fulfilled' && trailsResult.value.length > 0) {
      catalog.trails = trailsResult.value.map((trail) => ({
        id: trail.slug,
        databaseId: trail.id,
        label: trail.name,
        description: trail.summary ?? trail.description,
        duration: formatDuration(trail.durationMinutes),
        difficulty: difficultyLabels[trail.difficulty] ?? trail.difficulty,
        availableSpots: Number.isFinite(trail.availableSpots)
          ? Math.max(1, trail.availableSpots)
          : Math.max(1, trail.maxGroupSize),
        sessions: trail.sessions ?? [],
        contactPhone: trail.contactPhone ?? null,
        guides: (trail.guides ?? []).map((guide) => ({
          name: guide.name,
          phone: guide.phone ?? null,
        })),
      }))
    }

    if (guidesResult.status === 'fulfilled' && guidesResult.value.length > 0) {
      catalog.guides = guidesResult.value.map((guide) => ({
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
    }

    return catalog
  }, [guidesContent.guides])

  const applyCatalog = useCallback((catalog: { trails?: TrailOption[]; guides?: GuideOption[] }) => {
    if (catalog.trails && catalog.trails.length > 0) {
      setTrailOptions(catalog.trails)
    }

    if (catalog.guides && catalog.guides.length > 0) {
      setGuideOptions(catalog.guides)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchPublicCatalog().then((catalog) => {
      if (!active) {
        return
      }

      applyCatalog(catalog)
    })

    return () => {
      active = false
    }
  }, [applyCatalog, fetchPublicCatalog])

  const refreshPublicCatalog = useCallback(async () => {
    const catalog = await fetchPublicCatalog()
    applyCatalog(catalog)
  }, [applyCatalog, fetchPublicCatalog])

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

  useEffect(() => {
    if (selectedSession) {
      const nextDate = selectedSession.startsAt.slice(0, 10)
      setSelectedDate(nextDate)
      fetchWeather(nextDate)
      setShowRainWarning(false)
    }
  }, [fetchWeather, selectedSession])

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSelectedDate(value)
      setSelectedSessionId('')
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

  const handleSelectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId)
  }, [])

  const handleAcceptTerms = useCallback(() => {
    setHasAcceptedTerms(true)
    setShowTermsModal(false)
  }, [])

  const handleParticipantsCountChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const parsed = Number.parseInt(event.target.value, 10)
      if (Number.isNaN(parsed)) {
        updateParticipantsCount(1)
        return
      }

      updateParticipantsCount(parsed)
    },
    [updateParticipantsCount],
  )

  const handleWizardDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date)
      setSelectedSessionId('')
      fetchWeather(date)
      setShowRainWarning(false)
    },
    [fetchWeather],
  )

  const handleParticipantFieldChange = useCallback(
    (index: number, field: 'fullName' | 'cpf', value: string) => {
      if (index === 0 && firstParticipantLocked) {
        return
      }

      setParticipants((previous) => {
        const next = previous.slice()
        const current = next[index] ?? { fullName: '', cpf: '' }
        next[index] =
          field === 'cpf'
            ? { ...current, cpf: sanitizeCpf(value) }
            : { ...current, fullName: value }
        return next
      })
    },
    [firstParticipantLocked, sanitizeCpf],
  )

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

      if (hasPublishedSessions && !selectedSession) {
        setSubmissionResult({ type: 'error', message: booking.form.sessionRequired })
        setIsSubmitting(false)
        return
      }

      if (
        hasPublishedSessions &&
        selectedSession &&
        (selectedSession.availableSpots <= 0 || selectedSession.status !== 'SCHEDULED')
      ) {
        setSubmissionResult({ type: 'error', message: booking.form.sessionUnavailable })
        setIsSubmitting(false)
        return
      }

      const shouldUseProfileIdentity = isLoggedIn && !needsIdentityForm
      const contactName = shouldUseProfileIdentity
        ? contactNameFromProfile
        : String(formData.get('name') ?? '').trim()
      const contactEmail = shouldUseProfileIdentity
        ? contactEmailFromProfile
        : String(formData.get('email') ?? '').trim()
      const contactPhoneInput = String(formData.get('phone') ?? '').trim()
      const contactPhone = sanitizePhoneNumber(contactPhoneInput)

      if (!contactName || !contactEmail) {
        setSubmissionResult({ type: 'error', message: booking.form.customerSummaryIncomplete })
        setIsSubmitting(false)
        return
      }

      if (!contactPhone) {
        setSubmissionResult({ type: 'error', message: booking.wizard.steps.contact.phoneError })
        setIsSubmitting(false)
        return
      }

      const normalizedParticipants: NonNullable<CreateBookingPayload['participants']> = []
      for (let index = 0; index < participants.length; index += 1) {
        const participant = participants[index]
        const trimmedName = participant.fullName.trim()
        const cpfDigits = sanitizeCpf(participant.cpf)

        if (!trimmedName || cpfDigits.length !== 11) {
          const message = booking.form.participantsValidationError.replace(
            '{index}',
            String(index + 1),
          )
          setSubmissionResult({ type: 'error', message })
          setIsSubmitting(false)
          return
        }

        normalizedParticipants.push({ fullName: trimmedName, cpf: cpfDigits })
      }

      const scheduledDateValue =
        hasPublishedSessions && selectedSession
          ? selectedSession.startsAt.slice(0, 10)
          : String(formData.get('date') ?? '')
      const scheduledTimeValue =
        hasPublishedSessions && selectedSession
          ? selectedSession.startsAt.slice(11, 16)
          : String(formData.get('time') ?? '')

      const payload: CreateBookingPayload = {
        trailId: trailSelection.databaseId ?? trailSelection.id,
        contactName,
        contactEmail,
        contactPhone,
        scheduledDate: scheduledDateValue,
        scheduledTime: scheduledTimeValue || undefined,
        participantsCount: normalizedParticipants.length,
        notes: (formData.get('notes') as string | null) ?? undefined,
        participants: normalizedParticipants,
      }

      if (selectedSession) {
        payload.sessionId = selectedSession.id
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
        setSelectedTrailId('')
        setSelectedSessionId('')
        updateParticipantsCount(1)
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
      booking.wizard.steps.contact.phoneError,
      booking.form.participantsValidationError,
      contactEmailFromProfile,
      contactNameFromProfile,
      guideParam,
      guideOptions,
      isHighRainProbability,
      isLoggedIn,
      isSubmitting,
      hasPublishedSessions,
      booking.form.sessionRequired,
      booking.form.sessionUnavailable,
      selectedSession,
      needsIdentityForm,
      participants,
      updateParticipantsCount,
      sanitizeCpf,
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

  const handleTrailSelect = useCallback((trailId: string) => {
    setSelectedTrailId(trailId)
    setSelectedSessionId('')
    setSelectedDate('')
    setShowRainWarning(false)
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const rainWarningModal = showRainWarning ? (
    <div className="rain-warning-modal" role="presentation">
      <div className="rain-warning-modal__backdrop" aria-hidden="true" onClick={handleCloseRainWarning} />
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
  ) : null

  const termsModal = showTermsModal ? (
    <div className="terms-modal" role="presentation">
      <div className="terms-modal__backdrop" aria-hidden="true" onClick={handleCloseTermsModal} />
      <div className="terms-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
        <div className="terms-modal__content">
          <h3 id="terms-modal-title">{booking.terms.modalTitle}</h3>
          {booking.terms.modalIntro ? <p className="terms-modal__intro">{booking.terms.modalIntro}</p> : null}
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
  ) : null

  const shouldRenderWizard = isPageWizard || isWizardOpen
  const wizardElement = shouldRenderWizard ? (
    <BookingWizard
      mode={isPageWizard ? 'page' : 'modal'}
      isOpen={shouldRenderWizard}
      onClose={isPageWizard ? () => undefined : handleCloseWizard}
      booking={booking}
      formRef={formRef}
      onSubmit={handleSubmit}
      showCustomerSummary={showCustomerSummary}
      customerSummaryItems={customerSummaryItems}
      onManageProfile={handleNavigateToCustomerArea}
      needsIdentityForm={needsIdentityForm}
      isLoggedIn={isLoggedIn}
      contactNameFromProfile={contactNameFromProfile}
      contactEmailFromProfile={contactEmailFromProfile}
      participantOptions={participantOptions}
      participantsCount={participantsCount}
      onParticipantsCountChange={handleParticipantsCountChange}
      participants={participants}
      onParticipantFieldChange={handleParticipantFieldChange}
      formatCpfForInput={formatCpfForInput}
      firstParticipantLocked={firstParticipantLocked}
      hasAcceptedTerms={hasAcceptedTerms}
      onTermsChange={handleTermsChange}
      onOpenTermsModal={handleOpenTermsModal}
      submissionResult={submissionResult}
      isSubmitting={isSubmitting}
      selectedTrailId={selectedTrailId}
      onSelectTrail={handleTrailSelect}
      trailOptions={trailOptions}
      selectedDate={selectedDate}
      onSelectDate={handleWizardDateSelect}
      onManualDateChange={handleDateChange}
      selectedSessionId={selectedSessionId}
      selectedSession={selectedSession}
      availableSessionGroups={availableSessionGroups}
      onSelectSession={handleSelectSession}
      hasPublishedSessions={hasPublishedSessions}
      refreshCatalog={refreshPublicCatalog}
    />
  ) : null

  if (isPageWizard) {
    return (
      <div className="booking-page booking-page--wizard">
        <header className="booking-wizard-page__hero" style={heroStyle}>
          {navigation}
          <div className="booking-wizard-page__hero-content">
            <span className="section-tag">{booking.hero.tag}</span>
            <h1>
              {booking.hero.title.prefix}
              <span>{booking.hero.title.highlight}</span>
              {booking.hero.title.suffix ?? ''}
            </h1>
            <p>{booking.hero.description}</p>
            <p className="booking-wizard-page__notice">{booking.form.disclaimer}</p>
          </div>
        </header>

        <main className="booking-wizard-page">
          {wizardElement}
          {rainWarningModal}
          {termsModal}
        </main>
      </div>
    )
  }

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
            <div className="booking-wizard-card">
              <div className="booking-wizard-card__header">
                <div className="booking-wizard-card__intro">
                  <h2>{booking.wizard.triggerTitle}</h2>
                  <p>{booking.wizard.triggerDescription}</p>
                  <div className="booking-wizard-card__actions">
                    <button type="button" className="btn solid" onClick={handleOpenWizard}>
                      {booking.wizard.openButton}
                    </button>
                  </div>
                </div>
                <div className="booking-wizard-card__status" role="status" aria-live="polite">
                  <span className="booking-wizard-card__status-title">{booking.wizard.status.title}</span>
                  <p className="booking-wizard-card__status-helper">{booking.wizard.status.helper}</p>
                  {submissionResult ? (
                    <div className={`form-feedback form-feedback--${submissionResult.type}`}>
                      <p>
                        {submissionResult.message}
                        {submissionResult.type === 'success' && submissionResult.protocol ? (
                          <>
                            <br />
                            <strong>{booking.wizard.status.protocolLabel}</strong> {submissionResult.protocol}
                          </>
                        ) : null}
                      </p>
                    </div>
                  ) : (
                    <p className="booking-wizard-card__status-placeholder">{booking.wizard.status.empty}</p>
                  )}
                </div>
              </div>
              <p className="booking-wizard-card__disclaimer">{booking.form.disclaimer}</p>
            </div>
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
                  {selectedTrailOption && (
                    <div className="selected-guide-card__trail">
                      <span className="selected-guide-card__trail-label">{booking.guideSummary.trailLabel}</span>
                      <strong>{selectedTrailOption.label}</strong>
                      <span className="selected-guide-card__trail-details">{selectedTrailOption.description}</span>
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

      {wizardElement}

      {rainWarningModal}
      {termsModal}
    </div>
  )
}

type BookingWizardProps = {
  mode?: 'modal' | 'page'
  isOpen: boolean
  onClose: () => void
  booking: BookingContent
  formRef: React.RefObject<HTMLFormElement | null>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  showCustomerSummary: boolean
  customerSummaryItems: { label: string; value: string }[]
  onManageProfile: () => void
  needsIdentityForm: boolean
  isLoggedIn: boolean
  contactNameFromProfile: string
  contactEmailFromProfile: string
  participantOptions: { value: number; label: string }[]
  participantsCount: number
  onParticipantsCountChange: (event: ChangeEvent<HTMLSelectElement>) => void
  participants: Array<{ fullName: string; cpf: string }>
  onParticipantFieldChange: (index: number, field: 'fullName' | 'cpf', value: string) => void
  formatCpfForInput: (value: string) => string
  firstParticipantLocked: boolean
  hasAcceptedTerms: boolean
  onTermsChange: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenTermsModal: () => void
  submissionResult: { type: 'success' | 'error'; message: string; protocol?: string } | null
  isSubmitting: boolean
  selectedTrailId: string
  onSelectTrail: (id: string) => void
  trailOptions: TrailOption[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onManualDateChange: (event: ChangeEvent<HTMLInputElement>) => void
  selectedSessionId: string
  selectedSession: NormalizedSession
  availableSessionGroups: PublicTrailSessionGroup[]
  onSelectSession: (id: string) => void
  hasPublishedSessions: boolean
  refreshCatalog: () => Promise<void>
}

function BookingWizard({
  mode = 'modal',
  isOpen,
  onClose,
  booking,
  formRef,
  onSubmit,
  showCustomerSummary,
  customerSummaryItems,
  onManageProfile,
  needsIdentityForm,
  isLoggedIn,
  contactNameFromProfile,
  contactEmailFromProfile,
  participantOptions,
  participantsCount,
  onParticipantsCountChange,
  participants,
  onParticipantFieldChange,
  formatCpfForInput,
  firstParticipantLocked,
  hasAcceptedTerms,
  onTermsChange,
  onOpenTermsModal,
  submissionResult,
  isSubmitting,
  selectedTrailId,
  onSelectTrail,
  trailOptions,
  selectedDate,
  onSelectDate,
  onManualDateChange,
  selectedSessionId,
  selectedSession,
  availableSessionGroups,
  onSelectSession,
  hasPublishedSessions,
  refreshCatalog,
}: BookingWizardProps) {
  const isPageMode = mode === 'page'
  const [activeStep, setActiveStep] = useState(0)
  const [manualTime, setManualTime] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [] as PublicTrailSessionGroup['slots']
    }

    const group = availableSessionGroups.find((entry) => entry.date === selectedDate)
    return group ? group.slots : []
  }, [availableSessionGroups, selectedDate])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    refreshCatalog()
    const intervalId = window.setInterval(() => {
      refreshCatalog()
    }, 30000)

    const previousOverflow = document.body.style.overflow
    if (!isPageMode) {
      document.body.style.overflow = 'hidden'
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPageMode) {
        event.preventDefault()
        onClose()
      }
    }

    if (!isPageMode) {
      document.addEventListener('keydown', handleKeyDown)
    }

    if (!isPageMode) {
      window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
    }

    return () => {
      window.clearInterval(intervalId)
      if (!isPageMode) {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
      }
    }
  }, [isOpen, isPageMode, onClose, refreshCatalog])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveStep(0)
    setManualTime('')
  }, [isOpen, selectedTrailId])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setManualTime('')
  }, [isOpen, selectedDate])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      '.booking-wizard__step[data-active="true"] button,' +
        '.booking-wizard__step[data-active="true"] input,' +
        '.booking-wizard__step[data-active="true"] select,' +
        '.booking-wizard__step[data-active="true"] textarea',
    )

    focusable?.focus()
  }, [activeStep, isOpen])

  const steps = useMemo(
    () => [
      {
        key: 'trail',
        title: booking.wizard.steps.trail.title,
        description: booking.wizard.steps.trail.description,
      },
      {
        key: 'date',
        title: booking.wizard.steps.date.title,
        description: booking.wizard.steps.date.description,
      },
      {
        key: 'time',
        title: booking.wizard.steps.time.title,
        description: booking.wizard.steps.time.description,
      },
      {
        key: 'participants',
        title: booking.wizard.steps.participants.title,
        description: booking.wizard.steps.participants.description,
      },
      {
        key: 'contact',
        title: booking.wizard.steps.contact.title,
        description: booking.wizard.steps.contact.description,
      },
    ],
    [booking.wizard.steps],
  )

  const totalSteps = steps.length
  const isFinalStep = activeStep === totalSteps - 1

  const canAdvance = useMemo(() => {
    if (activeStep === 0) {
      return Boolean(selectedTrailId)
    }

    if (activeStep === 1) {
      if (availableSessionGroups.length === 0) {
        return Boolean(selectedDate)
      }

      return Boolean(selectedDate)
    }

    if (activeStep === 2) {
      if (availableSessionGroups.length === 0) {
        return manualTime.trim().length > 0
      }

      return Boolean(selectedSessionId)
    }

    return true
  }, [activeStep, availableSessionGroups.length, manualTime, selectedDate, selectedSessionId, selectedTrailId])

  const handleNextStep = useCallback(() => {
    if (isFinalStep || !canAdvance) {
      return
    }

    setActiveStep((current) => Math.min(totalSteps - 1, current + 1))
  }, [canAdvance, isFinalStep, totalSteps])

  const handlePreviousStep = useCallback(() => {
    setActiveStep((current) => Math.max(0, current - 1))
  }, [])

  const handleManualTimeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setManualTime(event.target.value)
  }, [])

  if (!isOpen && !isPageMode) {
    return null
  }

  const selectedDateGroup = availableSessionGroups.find((group) => group.date === selectedDate)
  const availableTimeSlots = sessionsForSelectedDate

  const dialogClassName = isPageMode
    ? 'booking-wizard-page__panel'
    : 'booking-wizard-modal__dialog'

  const content = (
    <div
      ref={dialogRef}
      className={dialogClassName}
      role={isPageMode ? undefined : 'dialog'}
      aria-modal={isPageMode ? undefined : true}
      aria-labelledby="booking-wizard-title"
    >
      <header className="booking-wizard__header">
        <div className="booking-wizard__heading" role="presentation">
          <nav className="booking-wizard__progress" aria-label={booking.wizard.progressLabel}>
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`booking-wizard__progress-item${
                  index === activeStep ? ' is-active' : ''
                }${index < activeStep ? ' is-complete' : ''}`}
              >
                <span className="booking-wizard__progress-index">{index + 1}</span>
                <span className="booking-wizard__progress-title">{step.title}</span>
              </div>
            ))}
          </nav>

          <div className="booking-wizard__title">
            <h2 id="booking-wizard-title">{booking.wizard.modalTitle}</h2>
            <p>{booking.wizard.refreshLabel}</p>
          </div>
        </div>
        {isPageMode ? null : (
          <button
            ref={closeButtonRef}
            type="button"
            className="booking-wizard__close"
            onClick={onClose}
            aria-label={booking.wizard.closeButton}
          >
            ×
          </button>
        )}
      </header>

      <form ref={formRef} className="booking-wizard-form" onSubmit={onSubmit}>
          <input type="hidden" name="trail" value={selectedTrailId} />
          {hasPublishedSessions ? (
            <>
              <input type="hidden" name="date" value={selectedSession ? selectedSession.date : selectedDate} />
              <input
                type="hidden"
                name="time"
                value={selectedSession ? selectedSession.startsAt.slice(11, 16) : ''}
              />
            </>
          ) : null}

          <div className="booking-wizard__steps">
            {steps.map((step, index) => {
              const isActive = index === activeStep
              const stepKey = step.key

              return (
                <section
                  key={stepKey}
                  className={`booking-wizard__step${isActive ? ' is-active' : ''}`}
                  data-active={isActive ? 'true' : 'false'}
                  aria-hidden={isActive ? undefined : true}
                >
                  <header className="booking-wizard__step-header">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </header>

                  {stepKey === 'trail' ? (
                    <div className="booking-wizard__trail-grid" role="radiogroup" aria-label={booking.form.trail}>
                      {trailOptions.map((trail) => {
                        const isSelected = trail.id === selectedTrailId
                        const totalSpots = Math.max(0, trail.availableSpots)

                        return (
                          <button
                            key={trail.id}
                            type="button"
                            className={`booking-wizard__trail-card${isSelected ? ' is-selected' : ''}`}
                            onClick={() => onSelectTrail(trail.id)}
                            aria-pressed={isSelected}
                          >
                            <div className="booking-wizard__trail-card-header">
                              <strong>{trail.label}</strong>
                              {trail.duration ? <span>{trail.duration}</span> : null}
                            </div>
                            <p>{trail.description}</p>
                            <span className="booking-wizard__trail-card-meta">
                              {booking.wizard.steps.trail.availability.replace(
                                '{spots}',
                                String(totalSpots),
                              )}
                            </span>
                            {trail.guides.length > 0 ? (
                              <ul className="booking-wizard__trail-guides">
                                {trail.guides.map((guide) => (
                                  <li key={`${trail.id}-${guide.name}`}>
                                    <strong>{guide.name}</strong>
                                    {guide.phone ? (
                                      <span>
                                        {booking.wizard.steps.trail.phoneLabel}{' '}
                                        {formatPhoneForDisplay(guide.phone)}
                                      </span>
                                    ) : (
                                      <span>{booking.wizard.steps.trail.phoneFallback}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="booking-wizard__trail-guides-empty">
                                {booking.wizard.steps.trail.guidesFallback}
                              </p>
                            )}
                            {trail.contactPhone ? (
                              <span className="booking-wizard__trail-contact">
                                {booking.wizard.steps.trail.contactLabel}{' '}
                                {formatPhoneForDisplay(trail.contactPhone)}
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}

                  {stepKey === 'date' ? (
                    availableSessionGroups.length > 0 ? (
                      <div className="booking-wizard__date-grid" role="radiogroup" aria-label={booking.form.date}>
                        {availableSessionGroups.map((group) => {
                          const isSelected = group.date === selectedDate
                          const availableCount = group.slots.reduce(
                            (total, slot) => total + Math.max(0, slot.availableSpots),
                            0,
                          )

                          return (
                            <button
                              key={group.date}
                              type="button"
                              className={`booking-wizard__date-card${isSelected ? ' is-selected' : ''}`}
                              onClick={() => {
                                onSelectDate(group.date)
                                onSelectSession('')
                              }}
                              aria-pressed={isSelected}
                            >
                              <strong>{group.dateLabel}</strong>
                              <span>
                                {booking.wizard.steps.date.availability.replace(
                                  '{spots}',
                                  String(availableCount),
                                )}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <label className="booking-wizard__input">
                        <span>{booking.form.date}</span>
                        <input
                          type="date"
                          name="date"
                          value={selectedDate}
                          onChange={onManualDateChange}
                          required={activeStep === 1}
                          data-autofocus="true"
                        />
                      </label>
                    )
                  ) : null}

                  {stepKey === 'time' ? (
                    availableSessionGroups.length > 0 ? (
                      selectedDateGroup ? (
                        <div className="booking-wizard__time-grid" role="radiogroup" aria-label={booking.form.time}>
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((slot) => {
                              const isSelected = slot.id === selectedSessionId
                              const isDisabled = slot.status !== 'SCHEDULED' || slot.availableSpots <= 0
                              const capacityLabel = booking.form.sessionCapacity
                                .replace('{available}', String(Math.max(0, slot.availableSpots)))
                                .replace('{total}', String(slot.capacity))

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  className={`booking-wizard__time-card${isSelected ? ' is-selected' : ''}${
                                    isDisabled ? ' is-disabled' : ''
                                  }`}
                                  onClick={() => onSelectSession(slot.id)}
                                  aria-pressed={isSelected}
                                  disabled={isDisabled}
                                >
                                  <strong>{slot.timeLabel}</strong>
                                  <span>{capacityLabel}</span>
                                </button>
                              )
                            })
                          ) : (
                            <p className="booking-wizard__empty">{booking.wizard.steps.time.empty}</p>
                          )}
                        </div>
                      ) : (
                        <p className="booking-wizard__empty">{booking.wizard.steps.time.waitingDate}</p>
                      )
                    ) : (
                      <label className="booking-wizard__input">
                        <span>{booking.form.time}</span>
                        <input
                          type="time"
                          name="time"
                          value={manualTime}
                          onChange={handleManualTimeChange}
                          required={activeStep === 2}
                          data-autofocus="true"
                        />
                      </label>
                    )
                  ) : null}

                  {stepKey === 'participants' ? (
                    <div className="booking-wizard__participants">
                      <label className="booking-wizard__input">
                        <span>{booking.form.participants}</span>
                        <select
                          name="participants"
                          value={participantsCount}
                          onChange={onParticipantsCountChange}
                        >
                          {participantOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="participants-details__list">
                        {participants.map((participant, index) => {
                          const isFirstParticipant = index === 0
                          const isLocked = isFirstParticipant && firstParticipantLocked

                          return (
                            <div key={`participant-${index}`} className="participants-details__item">
                              <label className="input-field">
                                <span>
                                  {booking.form.participantNameLabel.replace('{index}', String(index + 1))}
                                </span>
                                <input
                                  type="text"
                                  name={`participant-name-${index}`}
                                  value={participant.fullName}
                                  placeholder={booking.form.participantNamePlaceholder}
                                  readOnly={isLocked}
                                  aria-readonly={isLocked ? true : undefined}
                                  onChange={
                                    isLocked
                                      ? undefined
                                      : (event) =>
                                          onParticipantFieldChange(index, 'fullName', event.target.value)
                                  }
                                />
                              </label>
                              <label className="input-field">
                                <span>
                                  {booking.form.participantCpfLabel.replace('{index}', String(index + 1))}
                                </span>
                                <input
                                  type="text"
                                  name={`participant-cpf-${index}`}
                                  inputMode="numeric"
                                  value={formatCpfForInput(participant.cpf)}
                                  placeholder={booking.form.participantCpfPlaceholder}
                                  readOnly={isLocked}
                                  aria-readonly={isLocked ? true : undefined}
                                  onChange={
                                    isLocked
                                      ? undefined
                                      : (event) =>
                                          onParticipantFieldChange(index, 'cpf', event.target.value)
                                  }
                                />
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {stepKey === 'contact' ? (
                    <div className="booking-wizard__contact">
                      {showCustomerSummary ? (
                        <section className="customer-summary">
                          <div className="customer-summary__header">
                            <h4>{booking.form.customerSummaryTitle}</h4>
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
                                onClick={onManageProfile}
                              >
                                {booking.form.customerSummaryManage}
                              </button>
                            </p>
                          ) : null}
                        </section>
                      ) : null}

                      {isLoggedIn && needsIdentityForm ? (
                        <div className="customer-summary-notice">
                          <p>{booking.form.customerSummaryIncomplete}</p>
                          <button type="button" onClick={onManageProfile}>
                            {booking.form.customerSummaryManage}
                          </button>
                        </div>
                      ) : null}

                      {needsIdentityForm ? (
                        <div className="booking-wizard__identity">
                          <label className="booking-wizard__input">
                            <span>{booking.form.name}</span>
                            <input
                              type="text"
                              name="name"
                              placeholder={booking.form.namePlaceholder}
                              defaultValue={contactNameFromProfile}
                              required
                            />
                          </label>
                          <label className="booking-wizard__input">
                            <span>{booking.form.email}</span>
                            <input
                              type="email"
                              name="email"
                              placeholder={booking.form.emailPlaceholder}
                              defaultValue={contactEmailFromProfile}
                              required
                            />
                          </label>
                        </div>
                      ) : null}

                      <label className="booking-wizard__input">
                        <span>{booking.form.phone}</span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder={booking.form.phonePlaceholder}
                          required
                        />
                        <small>{booking.wizard.steps.contact.phoneHint}</small>
                      </label>

                      <label className="booking-wizard__input booking-wizard__input--textarea">
                        <span>{booking.form.notes}</span>
                        <textarea
                          name="notes"
                          rows={4}
                          placeholder={booking.form.notesPlaceholder}
                        />
                      </label>

                      <div className="terms-consent">
                        <label className="terms-consent__checkbox">
                          <input
                            type="checkbox"
                            name="termsConsent"
                            checked={hasAcceptedTerms}
                            onChange={onTermsChange}
                            required
                          />
                          <span>{booking.terms.checkboxLabel}</span>
                        </label>
                        <button type="button" className="terms-consent__open" onClick={onOpenTermsModal}>
                          {booking.terms.openModal}
                        </button>
                      </div>

                      {submissionResult ? (
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
                                <strong>{booking.wizard.status.protocolLabel}</strong> {submissionResult.protocol}
                              </>
                            ) : null}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>

          <footer className="booking-wizard__footer">
            <div className="booking-wizard__footer-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={handlePreviousStep}
                disabled={activeStep === 0}
              >
                {booking.wizard.previous}
              </button>
              {isFinalStep ? (
                <button type="submit" className="btn solid" disabled={isSubmitting || !hasAcceptedTerms}>
                  {isSubmitting ? booking.wizard.submitting : booking.wizard.finish}
                </button>
              ) : (
                <button type="button" className="btn solid" onClick={handleNextStep} disabled={!canAdvance}>
                  {booking.wizard.next}
                </button>
              )}
            </div>
            <p className="booking-wizard__footer-note">{booking.form.disclaimer}</p>
          </footer>
        </form>
    </div>
  );

  if (isPageMode) {
    return <div className="booking-wizard-page__container">{content}</div>
  }

  return (
    <div className="booking-wizard-modal" role="presentation">
      <div className="booking-wizard-modal__backdrop" aria-hidden="true" onClick={onClose} />
      {content}
    </div>
  )
}

export default BookingPage
