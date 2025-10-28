import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createAdminTrailSession,
  fetchAdminGuides,
  fetchAdminTrailSessions,
  fetchAdminTrails,
  type AdminGuide,
  type AdminTrail,
  type AdminTrailSession,
} from '../../api/admin'
import { useTranslation } from '../../i18n/TranslationProvider'

export type SessionWizardStep = 'trail' | 'date' | 'time' | 'guide' | 'phone' | 'capacity'

export type SessionWizardFormState = {
  trailId: string
  scheduledDate: string
  scheduledTime: string
  guideCpf: string
  guidePhone: string
  capacity: string
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const SESSION_WIZARD_STEPS: SessionWizardStep[] = [
  'trail',
  'date',
  'time',
  'guide',
  'phone',
  'capacity',
]

/* eslint-disable-next-line react-refresh/only-export-components */
export const INITIAL_SESSION_WIZARD_FORM: SessionWizardFormState = {
  trailId: '',
  scheduledDate: '',
  scheduledTime: '',
  guideCpf: '',
  guidePhone: '',
  capacity: '',
}

type AdminSessionWizardProps = {
  isOpen: boolean
  step: SessionWizardStep
  form: SessionWizardFormState
  onStepChange: (step: SessionWizardStep) => void
  onFormChange: (updates: Partial<SessionWizardFormState>) => void
  onCancel: () => void
  onComplete: (session: AdminTrailSession) => void
}

const AdminSessionWizard = ({
  isOpen,
  step,
  form,
  onStepChange,
  onFormChange,
  onCancel,
  onComplete,
}: AdminSessionWizardProps) => {
  const { content, language } = useTranslation()
  const translations = content.admin.sessionWizard

  const [trailOptions, setTrailOptions] = useState<AdminTrail[]>([])
  const [guideOptions, setGuideOptions] = useState<AdminGuide[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<AdminTrailSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(language === 'en' ? 'en-US' : 'pt-BR'),
    [language],
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [language],
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [language],
  )

  const selectedTrail = useMemo(
    () => trailOptions.find((trail) => trail.id === form.trailId) ?? null,
    [form.trailId, trailOptions],
  )

  const trailDescription = useMemo(() => {
    if (!selectedTrail) {
      return null
    }

    return selectedTrail.summary?.trim().length
      ? selectedTrail.summary
      : selectedTrail.description
  }, [selectedTrail])

  const trailDurationLabel = useMemo(() => {
    if (!selectedTrail) {
      return null
    }

    const totalMinutes = Math.max(0, selectedTrail.durationMinutes)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0 && minutes > 0) {
      return translations.duration.hoursAndMinutes
        .replace('{hours}', String(hours))
        .replace('{minutes}', String(minutes))
    }

    if (hours > 0) {
      return translations.duration.hoursOnly.replace('{hours}', String(hours))
    }

    return translations.duration.minutesOnly.replace('{minutes}', String(minutes))
  }, [selectedTrail, translations.duration])

  const trailDifficultyLabel = useMemo(() => {
    if (!selectedTrail) {
      return null
    }

    return (
      translations.difficultyLabels[selectedTrail.difficulty] ?? selectedTrail.difficulty
    )
  }, [selectedTrail, translations.difficultyLabels])

  const filteredGuides = useMemo(() => {
    if (!selectedTrail || selectedTrail.guides.length === 0) {
      return guideOptions
    }

    const assignedCpfs = new Set(selectedTrail.guides.map((guide) => guide.cpf))
    const assignedGuides = guideOptions.filter((guide) => assignedCpfs.has(guide.cpf))

    return assignedGuides.length > 0 ? assignedGuides : guideOptions
  }, [guideOptions, selectedTrail])

  const selectedGuide = useMemo(
    () => guideOptions.find((guide) => guide.cpf === form.guideCpf) ?? null,
    [form.guideCpf, guideOptions],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const loadOptions = async () => {
      setIsLoadingOptions(true)
      try {
        const [trailsResponse, guidesResponse] = await Promise.all([
          fetchAdminTrails(),
          fetchAdminGuides(),
        ])

        setTrailOptions(trailsResponse.trails)
        setGuideOptions(guidesResponse.guides)
        setOptionsError(null)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : translations.status.loadOptionsError
        setOptionsError(message)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    void loadOptions()
  }, [isOpen, translations.status.loadOptionsError])

  useEffect(() => {
    if (!isOpen || !form.trailId) {
      setSessions([])
      setSessionsError(null)
      setIsLoadingSessions(false)
      return
    }

    let isActive = true

    const loadSessions = async () => {
      try {
        setIsLoadingSessions(true)
        const response = await fetchAdminTrailSessions(form.trailId)
        if (!isActive) {
          return
        }
        setSessions(response)
        setSessionsError(null)
      } catch (error) {
        if (!isActive) {
          return
        }
        const message =
          error instanceof Error ? error.message : translations.status.loadSessionsError
        setSessionsError(message)
      } finally {
        if (isActive) {
          setIsLoadingSessions(false)
        }
      }
    }

    void loadSessions()
    const intervalId = window.setInterval(() => {
      void loadSessions()
    }, 30_000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [form.trailId, isOpen, translations.status.loadSessionsError])

  useEffect(() => {
    if (!isOpen || !selectedGuide || form.guidePhone.trim().length > 0) {
      return
    }

    const enrichedGuide = selectedGuide as AdminGuide & { contactPhone?: string | null }
    if (enrichedGuide.contactPhone) {
      onFormChange({ guidePhone: enrichedGuide.contactPhone })
    }
  }, [form.guidePhone, isOpen, onFormChange, selectedGuide])

  useEffect(() => {
    if (!isOpen) {
      setValidationError(null)
      setSubmissionError(null)
    }
  }, [isOpen])

  const stepIndex = SESSION_WIZARD_STEPS.indexOf(step)
  const isFirstStep = stepIndex <= 0
  const isLastStep = stepIndex === SESSION_WIZARD_STEPS.length - 1
  const progress = ((stepIndex + 1) / SESSION_WIZARD_STEPS.length) * 100

  const totalAvailableSpots = useMemo(
    () => sessions.reduce((total, session) => total + session.availableSpots, 0),
    [sessions],
  )

  const upcomingSessions = useMemo(() => sessions.slice(0, 4), [sessions])

  const formatDateLabel = useCallback(
    (value: string) => {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return '—'
      }
      return dateFormatter.format(date)
    },
    [dateFormatter],
  )

  const formatTimeLabel = useCallback(
    (value: string) => {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return '—'
      }
      return timeFormatter.format(date)
    },
    [timeFormatter],
  )

  const validateStep = useCallback(
    (currentStep: SessionWizardStep) => {
      const messages = translations.validation

      switch (currentStep) {
        case 'trail':
          if (!form.trailId) {
            return messages.trail
          }
          break
        case 'date':
          if (!form.scheduledDate) {
            return messages.date
          }
          break
        case 'time':
          if (!form.scheduledTime) {
            return messages.time
          }
          if (!form.scheduledDate) {
            return messages.date
          }
          if (
            Number.isNaN(
              new Date(`${form.scheduledDate}T${form.scheduledTime || '00:00'}:00`).getTime(),
            )
          ) {
            return messages.datetime
          }
          break
        case 'guide':
          if (!form.guideCpf) {
            return messages.guide
          }
          break
        case 'phone':
          if (!form.guidePhone.trim()) {
            return messages.phone
          }
          break
        case 'capacity': {
          if (!form.capacity.trim()) {
            return messages.capacityRequired
          }
          const numericCapacity = Number.parseInt(form.capacity, 10)
          if (!Number.isFinite(numericCapacity) || numericCapacity <= 0) {
            return messages.capacityInvalid
          }
          break
        }
        default:
          return null
      }

      return null
    },
    [form.capacity, form.guideCpf, form.guidePhone, form.scheduledDate, form.scheduledTime, form.trailId, translations.validation],
  )

  const goToStep = useCallback(
    (nextStepIndex: number) => {
      const nextStep = SESSION_WIZARD_STEPS[nextStepIndex]
      if (nextStep) {
        onStepChange(nextStep)
      }
    },
    [onStepChange],
  )

  const handleNext = useCallback(() => {
    const message = validateStep(step)
    if (message) {
      setValidationError(message)
      return
    }

    setValidationError(null)
    goToStep(stepIndex + 1)
  }, [goToStep, step, stepIndex, validateStep])

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      return
    }

    setValidationError(null)
    goToStep(stepIndex - 1)
  }, [goToStep, isFirstStep, stepIndex])

  const handleSubmit = useCallback(async () => {
    for (const currentStep of SESSION_WIZARD_STEPS) {
      const message = validateStep(currentStep)
      if (message) {
        setValidationError(message)
        onStepChange(currentStep)
        return
      }
    }

    const date = new Date(`${form.scheduledDate}T${form.scheduledTime || '00:00'}:00`)
    if (Number.isNaN(date.getTime())) {
      setSubmissionError(translations.validation.datetime)
      return
    }

    const numericCapacity = Number.parseInt(form.capacity, 10)
    if (!Number.isFinite(numericCapacity) || numericCapacity <= 0) {
      setSubmissionError(translations.validation.capacityInvalid)
      return
    }

    setIsSaving(true)
    setSubmissionError(null)

    try {
      const createdSession = await createAdminTrailSession(form.trailId, {
        startsAt: date.toISOString(),
        capacity: numericCapacity,
        primaryGuideCpf: form.guideCpf || undefined,
      })

      setIsSaving(false)
      setValidationError(null)
      onComplete(createdSession)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : translations.status.submitError
      setSubmissionError(message)
      setIsSaving(false)
    }
  }, [
    form.capacity,
    form.guideCpf,
    form.scheduledDate,
    form.scheduledTime,
    form.trailId,
    onComplete,
    onStepChange,
    translations.status.submitError,
    translations.validation,
    validateStep,
  ])

  if (!isOpen) {
    return null
  }

  return (
    <div className="admin-session-wizard" role="dialog" aria-modal="true" aria-labelledby="session-wizard-title">
      <div className="admin-session-wizard__backdrop" aria-hidden="true" onClick={onCancel} />
      <div className="admin-session-wizard__container" role="document">
        <header className="admin-session-wizard__header">
          <div>
            <span className="admin-session-wizard__eyebrow">{translations.title}</span>
            <h2 id="session-wizard-title">{translations.headline}</h2>
            <p>{translations.description}</p>
          </div>
          <button type="button" className="admin-session-wizard__close" onClick={onCancel} aria-label={translations.actions.close}>
            ×
          </button>
        </header>

        <div className="admin-session-wizard__content">
          <div className="admin-session-wizard__scroll-area">
            <div className="admin-session-wizard__progress">
              <div className="admin-session-wizard__progress-bar" style={{ width: `${progress}%` }} />
              <ul className="admin-session-wizard__steps" role="list">
                {SESSION_WIZARD_STEPS.map((wizardStep, index) => {
                  const isCompleted = index < stepIndex
                  const isActive = index === stepIndex
                  return (
                    <li
                      key={wizardStep}
                      className={[
                        'admin-session-wizard__step',
                        isCompleted ? 'is-complete' : '',
                        isActive ? 'is-active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="admin-session-wizard__step-index">{index + 1}</span>
                      <span className="admin-session-wizard__step-label">
                        {translations.steps[wizardStep]}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="admin-session-wizard__layout">
          <section className="admin-session-wizard__form" aria-live="polite">
            {(() => {
              switch (step) {
                case 'trail':
                  return (
                    <>
                      <label className="admin-session-wizard__field">
                        <span>{translations.fields.trail.label}</span>
                        <select
                          value={form.trailId}
                          onChange={(event) => onFormChange({ trailId: event.target.value })}
                          disabled={isLoadingOptions}
                        >
                          <option value="">{translations.fields.trail.placeholder}</option>
                          {trailOptions.map((trail) => (
                            <option key={trail.id} value={trail.id}>
                              {trail.name}
                            </option>
                          ))}
                        </select>
                        <small>{translations.fields.trail.help}</small>
                      </label>

                      {selectedTrail ? (
                        <div className="admin-session-wizard__trail-preview">
                          <div className="admin-session-wizard__trail-media">
                            {selectedTrail.imageUrl ? (
                              <img
                                src={selectedTrail.imageUrl}
                                alt={translations.fields.trail.preview.imageAlt.replace(
                                  '{name}',
                                  selectedTrail.name,
                                )}
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="admin-session-wizard__trail-media-fallback"
                                aria-hidden="true"
                              >
                                {selectedTrail.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="admin-session-wizard__trail-details">
                            <div className="admin-session-wizard__trail-header">
                              <h3>{translations.fields.trail.preview.heading}</h3>
                              {trailDescription ? <p>{trailDescription}</p> : null}
                            </div>
                            <dl className="admin-session-wizard__trail-meta">
                              {trailDurationLabel ? (
                                <div className="admin-session-wizard__trail-meta-item">
                                  <dt>{translations.fields.trail.preview.duration}</dt>
                                  <dd>{trailDurationLabel}</dd>
                                </div>
                              ) : null}
                              <div className="admin-session-wizard__trail-meta-item">
                                <dt>{translations.fields.trail.preview.capacity}</dt>
                                <dd>{numberFormatter.format(selectedTrail.maxGroupSize)}</dd>
                              </div>
                              {trailDifficultyLabel ? (
                                <div className="admin-session-wizard__trail-meta-item">
                                  <dt>{translations.fields.trail.preview.difficulty}</dt>
                                  <dd>{trailDifficultyLabel}</dd>
                                </div>
                              ) : null}
                            </dl>
                            <button
                              type="button"
                              className="admin-primary-button admin-session-wizard__trail-action"
                              onClick={handleNext}
                            >
                              {translations.fields.trail.preview.action}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )
                case 'date':
                  return (
                    <label className="admin-session-wizard__field">
                      <span>{translations.fields.date.label}</span>
                      <input
                        type="date"
                        value={form.scheduledDate}
                        onChange={(event) => onFormChange({ scheduledDate: event.target.value })}
                        disabled={isLoadingOptions}
                      />
                      <small>{translations.fields.date.help}</small>
                    </label>
                  )
                case 'time':
                  return (
                    <label className="admin-session-wizard__field">
                      <span>{translations.fields.time.label}</span>
                      <input
                        type="time"
                        value={form.scheduledTime}
                        onChange={(event) => onFormChange({ scheduledTime: event.target.value })}
                        disabled={isLoadingOptions}
                      />
                      <small>{translations.fields.time.help}</small>
                    </label>
                  )
                case 'guide':
                  return (
                    <label className="admin-session-wizard__field">
                      <span>{translations.fields.guide.label}</span>
                      <select
                        value={form.guideCpf}
                        onChange={(event) => onFormChange({ guideCpf: event.target.value })}
                        disabled={isLoadingOptions || filteredGuides.length === 0}
                      >
                        <option value="">{translations.fields.guide.placeholder}</option>
                        {filteredGuides.map((guide) => (
                          <option key={guide.cpf} value={guide.cpf}>
                            {guide.name}
                          </option>
                        ))}
                      </select>
                      <small>{translations.fields.guide.help}</small>
                    </label>
                  )
                case 'phone':
                  return (
                    <label className="admin-session-wizard__field">
                      <span>{translations.fields.phone.label}</span>
                      <input
                        type="tel"
                        value={form.guidePhone}
                        onChange={(event) => onFormChange({ guidePhone: event.target.value })}
                        placeholder={translations.fields.phone.placeholder}
                      />
                      <small>{translations.fields.phone.help}</small>
                    </label>
                  )
                case 'capacity':
                  return (
                    <label className="admin-session-wizard__field">
                      <span>{translations.fields.capacity.label}</span>
                      <input
                        type="number"
                        min="1"
                        value={form.capacity}
                        onChange={(event) => onFormChange({ capacity: event.target.value })}
                        placeholder={translations.fields.capacity.placeholder}
                      />
                      <small>{translations.fields.capacity.help}</small>
                    </label>
                  )
                default:
                  return null
              }
            })()}

            {optionsError ? (
              <p className="admin-session-wizard__hint admin-session-wizard__hint--error">{optionsError}</p>
            ) : null}
          </section>

          <aside className="admin-session-wizard__summary">
            <h3>{translations.summary.title}</h3>
            <p>{translations.summary.description}</p>

            {selectedTrail ? (
              <ul className="admin-session-wizard__summary-list">
                <li>
                  <span>{translations.summary.trail}</span>
                  <strong>{selectedTrail.name}</strong>
                </li>
                <li>
                  <span>{translations.summary.capacity}</span>
                  <strong>{numberFormatter.format(selectedTrail.maxGroupSize)}</strong>
                </li>
                {selectedGuide ? (
                  <li>
                    <span>{translations.summary.guide}</span>
                    <strong>{selectedGuide.name}</strong>
                  </li>
                ) : null}
                {form.guidePhone ? (
                  <li>
                    <span>{translations.summary.phone}</span>
                    <strong>{form.guidePhone}</strong>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="admin-session-wizard__placeholder">{translations.summary.empty}</p>
            )}

            <div className="admin-session-wizard__availability">
              <span>{translations.summary.availability}</span>
              <strong>{translations.summary.totalSpots.replace('{count}', String(totalAvailableSpots))}</strong>
            </div>

            <div className="admin-session-wizard__sessions">
              <header>
                <h4>{translations.summary.sessionsTitle}</h4>
                <span>{translations.summary.refreshHint}</span>
              </header>
              {isLoadingSessions ? (
                <p className="admin-session-wizard__placeholder">{translations.status.loadingSessions}</p>
              ) : sessionsError ? (
                <p className="admin-session-wizard__hint admin-session-wizard__hint--error">{sessionsError}</p>
              ) : upcomingSessions.length === 0 ? (
                <p className="admin-session-wizard__placeholder">{translations.summary.noSessions}</p>
              ) : (
                <ul>
                  {upcomingSessions.map((session) => (
                    <li key={session.id}>
                      <strong>
                        {formatDateLabel(session.startsAt)} • {formatTimeLabel(session.startsAt)}
                      </strong>
                      <span>{translations.summary.sessionSpots.replace('{count}', String(session.availableSpots))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
            </div>
          </div>

          {validationError ? (
            <div className="admin-session-wizard__feedback admin-session-wizard__feedback--error">
              {validationError}
            </div>
          ) : null}
          {submissionError ? (
            <div className="admin-session-wizard__feedback admin-session-wizard__feedback--error">
              {submissionError}
            </div>
          ) : null}
        </div>

        <footer className="admin-session-wizard__footer">
          <button type="button" className="admin-secondary-button" onClick={onCancel}>
            {translations.actions.cancel}
          </button>
          <div className="admin-session-wizard__footer-actions">
            <button type="button" className="admin-secondary-button" onClick={handlePrevious} disabled={isFirstStep}>
              {translations.actions.previous}
            </button>
            {isLastStep ? (
              <button type="button" className="admin-primary-button" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? translations.actions.saving : translations.actions.finish}
              </button>
            ) : (
              <button type="button" className="admin-primary-button" onClick={handleNext}>
                {translations.actions.next}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AdminSessionWizard
