import { useEffect, useState, type CSSProperties } from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'

function GuidesPage({ navigation, onNavigate }: PageProps) {
  const { content } = useTranslation()
  const guidesContent = content.guides
  type Guide = (typeof guidesContent.guides)[number]
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)

  const heroStyle = {
    '--hero-background-image': `url(${guidesContent.header.photo})`,
  } as CSSProperties

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedGuide(null)
      }
    }

    if (selectedGuide) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGuide])

  const handleOpenGuide = (guide: Guide) => {
    setSelectedGuide(guide)
  }

  const handleCloseGuide = () => {
    setSelectedGuide(null)
  }

  const handleRequestGuide = (guide: Guide) => {
    setSelectedGuide(null)
    onNavigate('/agendamento', { search: `guide=${guide.id}` })
  }

  const getShortDescription = (description: string) => {
    const [firstSentence] = description.split('. ')
    if (!firstSentence) return description
    return firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`
  }

  return (
    <div className="guides-page">
      <header className="page-hero guides-hero" style={heroStyle}>
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">{guidesContent.header.tag}</span>
          <h1>{guidesContent.header.title}</h1>
          <p>{guidesContent.header.description}</p>
        </div>
      </header>

      <main className="page-main guides-main">
        <section className="guide-grid" aria-label={guidesContent.gridAriaLabel}>
          {guidesContent.guides.map((guide) => (
            <article key={guide.id} className="guide-card">
              <div className="guide-card-header">
                <button
                  type="button"
                  className="guide-avatar"
                  onClick={() => handleOpenGuide(guide)}
                  aria-label={guidesContent.meta.openProfileLabel.replace('{name}', guide.name)}
                >
                  <img
                    src={guide.photo}
                    alt={guidesContent.meta.photoAltTemplate.replace('{name}', guide.name)}
                    loading="lazy"
                  />
                  <span
                    className="guide-rating"
                    aria-label={guidesContent.meta.ratingAriaLabel.replace('{rating}', guide.rating.toFixed(1))}
                  >
                    ★ {guide.rating.toFixed(1)}
                  </span>
                </button>
                <div className="guide-headline">
                  <span className="guide-trails">{guide.trails} {guidesContent.meta.trailsLabel}</span>
                  <h2>{guide.name}</h2>
                  <p className="guide-speciality">{guide.speciality}</p>
                </div>
              </div>

              <p className="guide-description">{guide.description}</p>

              <dl className="guide-meta">
                <div className="guide-meta-item">
                  <dt>{guidesContent.meta.experienceLabel}</dt>
                  <dd>{guide.experience}</dd>
                </div>
                <div className="guide-meta-item">
                  <dt>{guidesContent.meta.languagesLabel}</dt>
                  <dd>{guide.languages.join(' · ')}</dd>
                </div>
              </dl>

              <div className="guide-chips">
                {guide.certifications.map((certification) => (
                  <span key={certification} className="chip">
                    {certification}
                  </span>
                ))}
              </div>

              <ul className="guide-curiosities">
                {guide.curiosities.map((curiosity) => (
                  <li key={curiosity}>{curiosity}</li>
                ))}
              </ul>

              <button
                type="button"
                className="btn solid guide-cta"
                onClick={() => handleRequestGuide(guide)}
              >
                {guidesContent.meta.cta}
              </button>
            </article>
          ))}
        </section>
      </main>

      {selectedGuide && (
        <div className="guide-modal" role="presentation">
          <div className="guide-modal__backdrop" aria-hidden="true" onClick={handleCloseGuide} />
          <div
            className="guide-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
            aria-describedby="guide-modal-description"
          >
            <button type="button" className="guide-modal__close" onClick={handleCloseGuide} aria-label={guidesContent.meta.closeProfileLabel}>
              ×
            </button>
            <div className="guide-modal__content">
              <div className="guide-modal__media">
                <img
                  src={selectedGuide.photo}
                  alt={guidesContent.meta.photoAltTemplate.replace('{name}', selectedGuide.name)}
                  loading="lazy"
                />
                <div className="guide-modal__stats">
                  <span className="guide-modal__rating">★ {selectedGuide.rating.toFixed(1)}</span>
                  <span className="guide-modal__trails">
                    {selectedGuide.trails} {guidesContent.meta.trailsLabel}
                  </span>
                </div>
              </div>
              <div className="guide-modal__details">
                <span className="guide-modal__label">{guidesContent.meta.featuredGuideLabel}</span>
                <h2 id="guide-modal-title">{selectedGuide.name}</h2>
                <p className="guide-modal__speciality">{selectedGuide.speciality}</p>
                <p id="guide-modal-description" className="guide-modal__description">
                  {getShortDescription(selectedGuide.description)}
                </p>
                <dl className="guide-modal__meta">
                  <div>
                    <dt>{guidesContent.meta.experienceLabel}</dt>
                    <dd>{selectedGuide.experience}</dd>
                  </div>
                  <div>
                    <dt>{guidesContent.meta.languagesLabel}</dt>
                    <dd>{selectedGuide.languages.join(' · ')}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn solid guide-cta"
                  onClick={() => handleRequestGuide(selectedGuide)}
                >
                  {guidesContent.meta.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuidesPage
