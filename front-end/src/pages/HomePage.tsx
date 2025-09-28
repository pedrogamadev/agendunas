import { useEffect, useState } from 'react'
import type { PageProps } from '../App'

const heroImages = [
  'https://semeia.org.br/wp-content/uploads/2025/07/IMG_20250619_081831285_HDR-edited-scaled.jpg',
  'https://portaln10.com.br/wp-content/uploads/2025/03/Parque-das-Dunas-em-Natal-se-destaca-entre-os-mais-visitados-do-Brasil-scaled.jpg',
  'https://semeia.org.br/wp-content/uploads/2025/07/IMG_20250619_095111763_HDR-edited-scaled.jpg',
  'https://diariodorn.com.br/wp-content/uploads/2024/05/titulo.png',
]

const experienceHighlights = [
  {
    title: 'Paixão',
    description: 'Amor genuíno pela natureza',
    icon: '🌿',
  },
  {
    title: 'Experiência',
    description: '15+ anos de aventura',
    icon: '🧭',
  },
  {
    title: 'Segurança',
    description: 'Protocolos rigorosos',
    icon: '🛡️',
  },
]

const trails = [
  {
    name: 'Trilha da Cachoeira',
    description:
      'Caminhada que te conecta até as majestosas cachoeiras da Mata Atlântica. Paradas para contemplar a fauna local.',
    duration: '5h30',
    difficulty: 'Moderada',
    groups: 'Até 12 pessoas',
    badge: 'Destaques',
    image:
      'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Trilha do Mirante',
    description:
      'Subida íngreme recompensada com vista panorâmica de 360° e mar atlântico. Ideal para apreciar o pôr do sol.',
    duration: '4h',
    difficulty: 'Desafiadora',
    groups: 'Até 8 pessoas',
    badge: 'Aventura',
    image:
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Trilha Ecológica',
    description:
      'Caminhada educativa com nossos guias biólogos apresentando espécies endêmicas e histórias da mata.',
    duration: '3h30',
    difficulty: 'Leve',
    groups: 'Até 15 pessoas',
    badge: 'Famílias',
    image:
      'https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=900&q=80',
  },
]

const wildlife = [
  {
    name: 'Tucano',
    image:
      'https://images.unsplash.com/photo-1518799175674-ef795e70e1f6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Macaco Prego',
    image:
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cutia',
    image:
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Tamanduá',
    image:
      'https://images.unsplash.com/photo-1574851459476-3eb3fb9d1357?auto=format&fit=crop&w=900&q=80',
  },
]

const testimonials = [
  {
    quote:
      'Organização impecável e guias muito atenciosos. A trilha do mirante rendeu memórias incríveis ao pôr do sol!',
    name: 'Clara Mendonça',
    trail: 'Trilha do Mirante',
  },
  {
    quote:
      'Foi emocionante observar a vida selvagem de tão perto. Voltarei para explorar outras trilhas em breve!',
    name: 'Rafael Albuquerque',
    trail: 'Trilha Ecológica',
  },
  {
    quote:
      'Equipe super preparada, equipamentos de qualidade e cenários de tirar o fôlego. Experiência inesquecível.',
    name: 'Larissa Souza',
    trail: 'Trilha da Cachoeira',
  },
  {
    quote:
      'Perfeito para sair da rotina e se conectar com a natureza. Cada parada tinha uma história fascinante!',
    name: 'Eduardo Campos',
    trail: 'Trilha do Mirante',
  },
]

const stats = [
  { value: '4.9', label: 'Avaliação média' },
  { value: '500+', label: 'Aventuras guiadas' },
  { value: '98%', label: 'Recomendariam' },
]

function HomePage({ navigation, onNavigate }: PageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeHeroImage, setActiveHeroImage] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [testimonials.length])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [heroImages.length])

  return (
    <div className="home-page" id="home">
      <header className="hero">
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
          <span className="hero-tag">Conecte-se com a natureza</span>
          <h1>
            Trilhas que <span>despertam</span> a alma
          </h1>
          <p>
            Descubra os segredos da mata atlântica através de experiências únicas e inesquecíveis. Cada trilha é uma
            jornada de descoberta e conexão com a natureza selvagem.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn solid" onClick={() => onNavigate('/agendamento')}>
              Agendar Aventura
            </button>
            <button type="button" className="btn ghost" onClick={() => onNavigate('/fauna-e-flora')}>
              Explorar Fauna &amp; Flora
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="home-section home-about" id="about">
          <div className="home-about__content">
            <span className="section-tag">Quem Somos</span>
            <h2>
              Quem <span>Somos</span>
            </h2>
            <p>
              Somos uma empresa familiar apaixonada pela preservação da mata atlântica. Há mais de 15 anos, conduzimos
              visitantes através dos caminhos mais selvagens e preservados com respeito e cuidado pela natureza.
            </p>
            <div className="highlights">
              {experienceHighlights.map((item) => (
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
              <span>1.500+</span>
              <p>Trilhas realizadas com sucesso</p>
            </div>
          </div>
          <div className="home-about__media">
            <div className="about-image" role="img" aria-label="Exploradores caminhando nas dunas" />
          </div>
        </section>

        <section className="home-section home-trails" id="booking">
          <div className="section-header">
            <span className="section-tag">Nossas Trilhas</span>
            <h2>Nossas Trilhas</h2>
            <p>
              Três experiências únicas para conectar-se com a natureza, cada uma oferecendo uma perspectiva diferente da
              nossa floresta.
            </p>
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
                    Ver detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-wildlife" id="wildlife">
          <div className="section-header">
            <span className="section-tag">Vida Selvagem</span>
            <h2>
              Habitantes da <span>Floresta</span>
            </h2>
            <p>
              Conheça alguns dos moradores mais carismáticos da nossa mata. Cada trilha é uma oportunidade de avistar
              essas criaturas em seu habitat natural.
            </p>
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
            Ver Galeria Completa
          </button>
        </section>

        <section className="home-section home-testimonials" id="testimonials">
          <div className="section-header">
            <span className="section-tag">O que dizem nossos aventureiros</span>
            <h2>Experiências reais de quem viveu a magia das nossas trilhas</h2>
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
                  <span>Natal, RN</span>
                  <span className="trail">{item.trail}</span>
                </div>
                <div className="rating" aria-label="Avaliação 5 de 5">
                  {'★★★★★'}
                </div>
              </article>
            ))}
          </div>
          <div className="testimonial-dots" role="tablist" aria-label="Navegação de depoimentos">
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
                <span className="sr-only">Depoimento de {item.name}</span>
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
    </div>
  )
}

export default HomePage
