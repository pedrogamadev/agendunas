import type { CSSProperties } from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'

function BookingPage({ navigation, searchParams }: PageProps) {
  const { content } = useTranslation()
  const booking = content.booking
  const guideId = searchParams.get('guide')
  const selectedGuide = guideId
    ? content.guides.guides.find((guide) => guide.id === guideId)
    : undefined
  const selectedTrail = selectedGuide
    ? booking.trails.find((trail) => trail.id === selectedGuide.featuredTrailId)
    : undefined
  const heroStyle = {
    '--hero-background-image': `url(${booking.hero.photo})`,
  } as CSSProperties

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
                <input type="date" name="date" required />
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
