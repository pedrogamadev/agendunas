import './App.css'

const navLinks = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Guias', href: '#about' },
  { label: 'Agendamento', href: '#booking' },
  { label: 'Fauna & Flora', href: '#wildlife' },
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

const testimonial = {
  quote:
    'Uma experiência transformadora! A Trilha da Cachoeira superou todas as expectativas. Os guias são extremamente conhecedores e apaixonados pela natureza.',
  name: 'Marina Silva',
  location: 'São Paulo, SP',
  trail: 'Trilha da Cachoeira',
}

const stats = [
  { value: '4.9', label: 'Avaliação média' },
  { value: '500+', label: 'Aventuras guiadas' },
  { value: '98%', label: 'Recomendariam' },
]

function App() {
  return (
    <div className="app" id="home">
      <header className="hero">
        <nav className="top-nav">
          <a className="brand" href="#home">
            <span className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C7.03 6.5 4.5 10.73 4.5 14.67c0 4.43 3.36 7.33 7.5 7.33s7.5-2.9 7.5-7.33C19.5 10.73 16.97 6.5 12 2z"
                  fill="currentColor"
                />
              </svg>
            </span>
            AgenDunas
          </a>
          <div className="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`nav-link ${link.active ? 'active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <button className="btn primary">Agendar Trilha</button>
        </nav>

        <div className="hero-content">
          <span className="hero-tag">Conecte-se com a natureza</span>
          <h1>
            Trilhas que <span>despertam</span> a alma
          </h1>
          <p>
            Descubra os segredos da mata atlântica através de experiências únicas e inesquecíveis.
            Cada trilha é uma jornada de descoberta e conexão com a natureza selvagem.
          </p>
          <div className="hero-actions">
            <button className="btn solid">Agendar Aventura</button>
            <button className="btn ghost">Explorar Fauna &amp; Flora</button>
          </div>
        </div>
      </header>

      <main>
        <section className="about" id="about">
          <div className="about-content">
            <span className="section-tag">Quem Somos</span>
            <h2>
              Somos uma empresa familiar apaixonada pela preservação da mata atlântica. Há mais de 15 anos,
              conduzimos visitantes através dos caminhos mais selvagens e preservados com respeito e cuidado pela
              natureza.
            </h2>
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
          <div className="about-media">
            <div className="about-image" role="img" aria-label="Exploradores caminhando nas dunas" />
          </div>
        </section>

        <section className="trails" id="booking">
          <div className="section-header">
            <span className="section-tag">Nossas Trilhas</span>
            <h2>
              Três experiências únicas para conectar-se com a natureza, cada uma oferecendo uma perspectiva
              diferente da nossa floresta.
            </h2>
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
                  <button className="btn link">Ver detalhes</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="wildlife" id="wildlife">
          <div className="section-header">
            <span className="section-tag">Vida Selvagem</span>
            <h2>
              Conheça alguns dos moradores mais carismáticos da nossa mata. Cada trilha é uma oportunidade de
              avistar essas criaturas em seu habitat natural.
            </h2>
          </div>
          <div className="wildlife-grid">
            {wildlife.map((animal) => (
              <figure key={animal.name} className="wildlife-card">
                <div className="wildlife-image" style={{ backgroundImage: `url(${animal.image})` }} />
                <figcaption>{animal.name}</figcaption>
              </figure>
            ))}
          </div>
          <button className="btn ghost">Ver Galeria Completa</button>
        </section>

        <section className="testimonials" id="testimonials">
          <div className="section-header">
            <span className="section-tag">O que dizem nossos Aventureiros</span>
            <h2>Experiências reais de quem viveu a magia das nossas trilhas</h2>
          </div>
          <div className="testimonial-card">
            <span className="quote-icon" aria-hidden="true">“</span>
            <p className="quote">{testimonial.quote}</p>
            <div className="testimonial-meta">
              <h3>{testimonial.name}</h3>
              <span>{testimonial.location}</span>
              <span className="trail">{testimonial.trail}</span>
            </div>
            <div className="rating" aria-label="Avaliação 5 de 5">
              {'★★★★★'}
            </div>
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

      <footer className="footer">
        <p>© {new Date().getFullYear()} AgenDunas. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

export default App
