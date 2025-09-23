import { useMemo, useState } from 'react'
import type { PageProps } from '../App'

type GalleryItem = {
  id: string
  name: string
  scientificName: string
  type: 'fauna' | 'flora'
  description: string
  image: string
  status: string
}

const galleryItems: GalleryItem[] = [
  {
    id: 'tucano-toco',
    name: 'Tucano-toco',
    scientificName: 'Ramphastos toco',
    type: 'fauna',
    description: 'Ave símbolo das matas atlânticas com bico colorido marcante. Observado pela manhã nas áreas abertas.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    status: 'Pouco Preocupante',
  },
  {
    id: 'mico-leao-dourado',
    name: 'Mico-leão-dourado',
    scientificName: 'Leontopithecus rosalia',
    type: 'fauna',
    description: 'Primata endêmico da Mata Atlântica que participa de programas de reintrodução nas nossas trilhas.',
    image: 'https://images.unsplash.com/photo-1507666405895-422eee7d5172?auto=format&fit=crop&w=1200&q=80',
    status: 'Em perigo',
  },
  {
    id: 'bromelia-imperial',
    name: 'Bromélia Imperial',
    scientificName: 'Vriesea regina',
    type: 'flora',
    description: 'Planta epífita que colore as trilhas com tons vibrantes. Floresce entre novembro e janeiro.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
    status: 'Protegida',
  },
  {
    id: 'preguica',
    name: 'Bicho-preguiça',
    scientificName: 'Bradypus variegatus',
    type: 'fauna',
    description: 'Mamífero arborícola avistado em áreas de bromélias. Costuma ser visto em grupos familiares no entardecer.',
    image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
    status: 'Pouco Preocupante',
  },
  {
    id: 'orquidea-lua',
    name: 'Orquídea-da-lua',
    scientificName: 'Cattleya walkeriana',
    type: 'flora',
    description: 'Orquídea de perfume adocicado muito buscada pelos visitantes. Cultivamos um viveiro para conservação.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    status: 'Vulnerável',
  },
  {
    id: 'jararaca',
    name: 'Jararaca-das-dunas',
    scientificName: 'Bothrops erythromelas',
    type: 'fauna',
    description: 'Serpente discreta e essencial para o equilíbrio ecológico. Guias treinam visitantes a identificar rastros com segurança.',
    image: 'https://images.unsplash.com/photo-1617831489119-471b33e49d5a?auto=format&fit=crop&w=1200&q=80',
    status: 'Pouco Preocupante',
  },
]

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'fauna', label: 'Fauna' },
  { id: 'flora', label: 'Flora' },
]

function FaunaFloraPage({ navigation }: PageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return galleryItems.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.scientificName.toLowerCase().includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })
  }, [query, selectedFilter])

  return (
    <div className="fauna-page">
      <header className="page-hero fauna-hero">
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">Fauna &amp; Flora</span>
          <h1>Mural da Fauna &amp; Flora</h1>
          <p>
            Descubra a rica biodiversidade da mata atlântica. Uma coleção fotográfica dos habitantes mais fascinantes da
            nossa floresta.
          </p>
          <div className="fauna-controls">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="search"
                placeholder="Buscar por nome comum ou científico..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="filter-buttons" role="group" aria-label="Filtros do mural">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`filter-button ${selectedFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="page-main fauna-main">
        <section className="gallery-grid" aria-live="polite">
          {visibleItems.map((item) => (
            <article key={item.id} className="gallery-card">
              <figure>
                <img src={item.image} alt={`${item.name} (${item.scientificName})`} loading="lazy" />
                <figcaption>
                  <div className="gallery-caption">
                    <span className="gallery-type">{item.type === 'fauna' ? 'Fauna' : 'Flora'}</span>
                    <span className="gallery-status">{item.status}</span>
                  </div>
                  <h2>{item.name}</h2>
                  <p className="scientific-name">{item.scientificName}</p>
                  <p>{item.description}</p>
                </figcaption>
              </figure>
            </article>
          ))}
          {visibleItems.length === 0 && (
            <p className="empty-state">Nenhum registro encontrado com os filtros selecionados.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default FaunaFloraPage
