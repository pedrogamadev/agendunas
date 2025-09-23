import type { PageProps } from '../App'

type Guide = {
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
}

const guides: Guide[] = [
  {
    id: 'joao-mendes',
    name: 'João Mendes',
    photo: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80',
    speciality: 'Fauna e Trilhas Técnicas',
    description:
      'Biólogo especializado em fauna da mata atlântica. Apaixonado por aves e mamíferos, transforma cada trilha em uma aula de biologia ao ar livre.',
    trails: 850,
    experience: '12 anos',
    rating: 4.9,
    certifications: ['Primeiros Socorros', 'Guia de Turismo', 'Condutor Ambiental'],
    languages: ['Português', 'Inglês', 'Espanhol'],
    curiosities: ['Observador de aves credenciado', 'Resgatou 32 animais feridos em expedições', 'Autor do guia “Rastros da Mata”'],
  },
  {
    id: 'maria-fernanda',
    name: 'Maria Fernanda',
    photo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    speciality: 'Flora e Plantas Medicinais',
    description:
      'Botânica com foco em plantas medicinais. Lidera trilhas interpretativas apresentando espécies endêmicas e usos tradicionais das comunidades locais.',
    trails: 650,
    experience: '9 anos',
    rating: 4.8,
    certifications: ['Educação Ambiental', 'Primeiros Socorros'],
    languages: ['Português', 'Francês'],
    curiosities: ['Mantém herbário próprio com 210 espécies catalogadas', 'Idealizadora da Trilha dos Sentidos'],
  },
  {
    id: 'carlos-rodrigues',
    name: 'Carlos Rodrigues',
    photo: 'https://images.unsplash.com/photo-1544723795-3fb17fe73707?auto=format&fit=crop&w=900&q=80',
    speciality: 'Montanhismo e Histórias Locais',
    description:
      'Condutor apaixonado por histórias da região. Especialista em travessias longas, conduz grupos com foco em fotografia e cultura local.',
    trails: 1200,
    experience: '15 anos',
    rating: 5,
    certifications: ['Resgate em Altura', 'Primeiros Socorros', 'Condutor de Turismo de Aventura'],
    languages: ['Português', 'Inglês'],
    curiosities: ['Participou de expedições internacionais nos Andes', 'Fotógrafo colaborador do projeto “Mata Viva”'],
  },
]

function GuidesPage({ navigation }: PageProps) {
  return (
    <div className="guides-page">
      <header className="page-hero guides-hero">
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">Guias Especializados</span>
          <h1>Nossos Guias</h1>
          <p>
            Conheça os especialistas que transformarão sua aventura inesquecível. Cada guia traz uma paixão única pela
            natureza e anos de experiência nas trilhas da mata atlântica.
          </p>
        </div>
      </header>

      <main className="page-main guides-main">
        <section className="guide-grid" aria-label="Guias disponíveis para condução de trilhas">
          {guides.map((guide) => (
            <article key={guide.id} className="guide-card">
              <div className="guide-card-header">
                <div className="guide-avatar">
                  <img src={guide.photo} alt={`Foto do guia ${guide.name}`} loading="lazy" />
                  <span className="guide-rating" aria-label={`Avaliação ${guide.rating.toFixed(1)} de 5`}>
                    ★ {guide.rating.toFixed(1)}
                  </span>
                </div>
                <div className="guide-headline">
                  <span className="guide-trails">{guide.trails} trilhas guiadas</span>
                  <h2>{guide.name}</h2>
                  <p className="guide-speciality">{guide.speciality}</p>
                </div>
              </div>

              <p className="guide-description">{guide.description}</p>

              <dl className="guide-meta">
                <div className="guide-meta-item">
                  <dt>Tempo de atuação</dt>
                  <dd>{guide.experience}</dd>
                </div>
                <div className="guide-meta-item">
                  <dt>Idiomas</dt>
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
                Solicitar este guia
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default GuidesPage
