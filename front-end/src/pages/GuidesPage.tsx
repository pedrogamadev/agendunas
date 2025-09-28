import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'

function GuidesPage({ navigation }: PageProps) {
  const { content } = useTranslation()
  const guidesContent = content.guides

  return (
    <div className="guides-page">
      <header className="page-hero guides-hero">
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
                <div className="guide-avatar">
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
                </div>
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

              <button type="button" className="btn solid guide-cta">
                {guidesContent.meta.cta}
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default GuidesPage
