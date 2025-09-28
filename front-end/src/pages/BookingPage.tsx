import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'

function BookingPage({ navigation }: PageProps) {
  const { content } = useTranslation()
  const booking = content.booking

  return (
    <div className="booking-page">
      <header className="page-hero booking-hero">
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
                <select name="trail" required defaultValue="">
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
            <div className="booking-map">
              <h2>{booking.sidebar.locationTitle}</h2>
              <div className="map-frame">
                <iframe
                  title={booking.sidebar.mapTitle}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57470.49387760395!2d-35.250735867600305!3d-5.829495663855279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b2fff2656f056b%3A0x5b7be096d7dfdd4!2sParque%20das%20Dunas!5e0!3m2!1spt-BR!2sbr!4v1701100000000!5m2!1spt-BR!2sbr"
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
