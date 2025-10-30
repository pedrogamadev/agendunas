import { useEffect, useId, useRef, useState } from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'
import { fetchFaunaFloraRecords, fetchPublicTrails } from '../api/public'

const heroImages = [
  'https://semeia.org.br/wp-content/uploads/2025/07/IMG_20250619_081831285_HDR-edited-scaled.jpg',
  'https://portaln10.com.br/wp-content/uploads/2025/03/Parque-das-Dunas-em-Natal-se-destaca-entre-os-mais-visitados-do-Brasil-scaled.jpg',
  'https://semeia.org.br/wp-content/uploads/2025/07/IMG_20250619_095111763_HDR-edited-scaled.jpg',
  'https://diariodorn.com.br/wp-content/uploads/2024/05/titulo.png',
]

const duninhoImages = [
  '/images/duninho/Duninho.png',
  '/images/duninho/Duninho-acena.png',
  '/images/duninho/duninho-cajado.png',
  '/images/duninho/duninho-correndo.png',
  '/images/duninho/duninho-lupa.png',
  '/images/duninho/duninho-mapa.png',
  '/images/duninho/duninho-skate.png',
]

function HomePage({ navigation, onNavigate }: PageProps) {
  const { content } = useTranslation()
  const home = content.home
  const helper = home.helper
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeHeroImage, setActiveHeroImage] = useState(0)
  const [activeDuninho, setActiveDuninho] = useState(0)
  const [trailCards, setTrailCards] = useState(home.trails.items)
  const [wildlifeCards, setWildlifeCards] = useState(home.wildlife.items)
  const [isMascotDocked, setIsMascotDocked] = useState(false)
  const [isFaqOpen, setIsFaqOpen] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const floatingButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const wasFaqOpen = useRef(false)
  const helperTitleId = useId()
  const helperDescriptionId = useId()
  const helperDialogId = useId()
  const testimonials = home.testimonials.items
  const highlights = home.about.highlights
  const trails = trailCards
  const wildlife = wildlifeCards
  const stats = home.stats
  const aboutTitleText = `${home.about.title.prefix}${home.about.title.highlight}${home.about.title.suffix ?? ''}`
  const normalizedAboutTitle = aboutTitleText.replace(/\s+/g, ' ').trim().toLowerCase()
  const normalizedAboutTag = (home.about.tag ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
  const shouldShowAboutTag = Boolean(normalizedAboutTag) && normalizedAboutTag !== normalizedAboutTitle

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

        const mapped = data.map((trail) => ({
          name: trail.name,
          description: trail.summary ?? trail.description,
          duration: formatDuration(trail.durationMinutes),
          difficulty: difficultyLabels[trail.difficulty] ?? trail.difficulty,
          groups: `Até ${trail.maxGroupSize} pessoas`,
          badge: trail.badgeLabel ?? home.trails.items[0]?.badge ?? 'Destaque',
          image: trail.imageUrl ?? home.trails.items[0]?.image ?? '',
        }))

        if (mapped.length > 0) {
          setTrailCards(mapped)
        }
      })
      .catch(() => {
        /* ignora falhas de rede mantendo conteúdo estático */
      })

    fetchFaunaFloraRecords()
      .then((data) => {
        if (!isMounted || data.length === 0) {
          return
        }

        const mapped = data.slice(0, home.wildlife.items.length).map((item) => ({
          name: item.name,
          image: item.imageUrl ?? home.wildlife.items[0]?.image ?? '',
        }))

        if (mapped.length > 0) {
          setWildlifeCards(mapped)
        }
      })
      .catch(() => {
        /* ignora falhas de rede mantendo conteúdo estático */
      })

    return () => {
      isMounted = false
    }
  }, [home.trails.items, home.wildlife.items])

  useEffect(() => {
    if (testimonials.length === 0) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [testimonials])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (duninhoImages.length <= 1) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setActiveDuninho((current) => (current + 1) % duninhoImages.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateDocking = () => {
      const element = heroRef.current
      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const shouldDock = rect.top <= -32 || rect.bottom <= viewportHeight - 64
      setIsMascotDocked((previous) => (previous !== shouldDock ? shouldDock : previous))
    }

    let frame = 0
    const handleScroll = () => {
      if (frame !== 0) {
        return
      }
      frame = window.requestAnimationFrame(() => {
        updateDocking()
        frame = 0
      })
    }

    updateDocking()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!isMascotDocked) {
      setIsFaqOpen(false)
    }
  }, [isMascotDocked])

  useEffect(() => {
    if (!isFaqOpen) {
      if (wasFaqOpen.current && isMascotDocked) {
        floatingButtonRef.current?.focus()
      }
      wasFaqOpen.current = false
      return undefined
    }

    wasFaqOpen.current = true
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFaqOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isFaqOpen, isMascotDocked])

  const handleCloseFaq = () => {
    setIsFaqOpen(false)
  }

  return (
    <div className="home-page" id="home">
      <header className="hero" ref={heroRef}>
        <div className="hero-background" aria-hidden="true">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`hero-background__image ${index === activeHeroImage ? 'is-active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="hero-overlay" aria-hidden="true" />
        {navigation}
        <div className="hero-content">
          <span className="hero-tag">{home.hero.tag}</span>
          <h1>
            {home.hero.title.prefix}
            <span>{home.hero.title.highlight}</span>
            {home.hero.title.suffix ?? ''}
          </h1>
          <p>{home.hero.description}</p>
          <div className="hero-actions">
            <button type="button" className="btn solid" onClick={() => onNavigate('/agendamento')}>
              {home.hero.primaryCta}
            </button>
            <button type="button" className="btn ghost" onClick={() => onNavigate('/fauna-e-flora')}>
              {home.hero.secondaryCta}
            </button>
          </div>
        </div>
        {duninhoImages.length > 0 && (
          <div className={`hero-mascot ${isMascotDocked ? 'is-docked' : ''}`} aria-hidden={!isMascotDocked}>
            {!isMascotDocked && (
              <div className="hero-mascot__carousel">
                <div className="hero-mascot__disk" />
                {duninhoImages.map((image, index) => (
                  <div
                    key={image}
                    className={`hero-mascot__image ${index === activeDuninho ? 'is-active' : ''}`}
                  >
                    <img src={image} alt="" decoding="async" />
                  </div>
                ))}
              </div>
            )}
            {isMascotDocked && (
              <button
                ref={floatingButtonRef}
                type="button"
                className="hero-mascot__button"
                onClick={() => setIsFaqOpen(true)}
                aria-label={helper.openLabel}
                aria-expanded={isFaqOpen}
                aria-controls={helperDialogId}
              >
                <img src="/images/duninho/duninho-ajuda.png" alt="" decoding="async" />
              </button>
            )}
          </div>
        )}
      </header>

      <main>
        <section className="home-section home-about" id="about">
          <div className="home-about__content">
            {shouldShowAboutTag && <span className="section-tag">{home.about.tag}</span>}
            <h2>
              {home.about.title.prefix}
              <span>{home.about.title.highlight}</span>
            </h2>
            <p>{home.about.description}</p>
            <div className="highlights">
              {highlights.map((item) => (
                <div key={item.title} className="highlight-card">
                  <span className="highlight-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="impact-card">
              <span>{home.about.impactValue}</span>
              <p>{home.about.impactDescription}</p>
            </div>
          </div>
          <div className="home-about__media">
            <div className="about-image" role="img" aria-label={home.about.mediaAriaLabel} />
          </div>
        </section>

        <section className="home-section home-trails" id="booking">
          <div className="section-header">
            <span className="section-tag">{home.trails.tag}</span>
            <h2>{home.trails.title}</h2>
            <p>{home.trails.description}</p>
          </div>
          <div className="trail-grid">
            {trails.map((trail) => (
              <article key={trail.name} className="trail-card">
                <div className="trail-image" style={{ backgroundImage: `url(${trail.image})` }}>
                  <span className="badge">{trail.badge}</span>
                </div>
                <div className="trail-body">
                  <h3>{trail.name}</h3>
                  <p>{trail.description}</p>
                  <div className="trail-meta">
                    <span>⏱ {trail.duration}</span>
                    <span>🧗‍♀️ {trail.difficulty}</span>
                    <span>👥 {trail.groups}</span>
                  </div>
                  <button
                    type="button"
                    className="btn link"
                    onClick={() => onNavigate('/agendamento')}
                  >
                    {home.trails.cta}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-wildlife" id="wildlife">
          <div className="section-header">
            <span className="section-tag">{home.wildlife.tag}</span>
            <h2>
              {home.wildlife.title.prefix}
              <span>{home.wildlife.title.highlight}</span>
              {home.wildlife.title.suffix ?? ''}
            </h2>
            <p>{home.wildlife.description}</p>
          </div>
          <div className="wildlife-grid">
            {wildlife.map((animal) => (
              <figure key={animal.name} className="wildlife-card">
                <div className="wildlife-image" style={{ backgroundImage: `url(${animal.image})` }} />
                <figcaption>{animal.name}</figcaption>
              </figure>
            ))}
          </div>
          <button type="button" className="btn ghost" onClick={() => onNavigate('/fauna-e-flora')}>
            {home.wildlife.cta}
          </button>
        </section>

        <section className="home-section home-testimonials" id="testimonials">
          <div className="section-header">
            <span className="section-tag">{home.testimonials.tag}</span>
            <h2>{home.testimonials.title}</h2>
          </div>
          <div className="testimonial-slider" role="region" aria-live="polite">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className={`testimonial-card${index === activeTestimonial ? ' is-active' : ''}`}
                aria-hidden={index !== activeTestimonial}
                id={`testimonial-${index}`}
              >
                <span className="quote-icon" aria-hidden="true">
                  “
                </span>
                <p className="quote">{item.quote}</p>
                <div className="testimonial-meta">
                  <h3>{item.name}</h3>
                  <span>{home.testimonials.location}</span>
                  <span className="trail">{item.trail}</span>
                </div>
                <div className="rating" aria-label={home.testimonials.ratingLabel}>
                  {'★★★★★'}
                </div>
              </article>
            ))}
          </div>
          <div className="testimonial-dots" role="tablist" aria-label={home.testimonials.navAriaLabel}>
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={index === activeTestimonial}
                aria-controls={`testimonial-${index}`}
                className={`testimonial-dot${index === activeTestimonial ? ' is-active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
                tabIndex={index === activeTestimonial ? 0 : -1}
              >
                <span className="sr-only">{home.testimonials.navLabelPrefix} {item.name}</span>
              </button>
            ))}
          </div>
          <div className="stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat">
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {isFaqOpen && (
        <div className="duninho-helper" role="presentation">
          <button
            type="button"
            className="duninho-helper__backdrop"
            aria-label={helper.closeLabel}
            onClick={handleCloseFaq}
          />
          <div
            className="duninho-helper__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={helperTitleId}
            aria-describedby={helperDescriptionId}
            id={helperDialogId}
          >
            <div className="duninho-helper__header">
              <div className="duninho-helper__title">
                <h2 id={helperTitleId}>{helper.title}</h2>
                <p id={helperDescriptionId}>{helper.description}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="duninho-helper__close"
                onClick={handleCloseFaq}
              >
                {helper.closeLabel}
              </button>
            </div>
            <div className="duninho-helper__body">
              <figure className="duninho-helper__illustration">
                <img src="/images/duninho/duninho-mapa.png" alt={helper.imageAlt} decoding="async" />
              </figure>
              <div className="duninho-helper__faq-wrapper">
                <ul className="duninho-helper__faq">
                  {helper.items.map((item) => (
                    <li key={item.question}>
                      <details>
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                      </details>
                    </li>
                  ))}
                </ul>
                {helper.scrollHint && <p className="duninho-helper__hint">{helper.scrollHint}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
