import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { PageProps } from '../App'
import { useTranslation } from '../i18n/TranslationProvider'
import { fetchFaunaFloraRecords } from '../api/public'

function FaunaFloraPage({ navigation }: PageProps) {
  const { content } = useTranslation()
  const faunaFlora = content.faunaFlora
  const [galleryItems, setGalleryItems] = useState(faunaFlora.gallery)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const heroStyle = {
    '--hero-background-image': `url(${faunaFlora.hero.photo})`,
  } as CSSProperties

  useEffect(() => {
    let isMounted = true

    const statusLabels: Record<string, string> = {
      NOT_EVALUATED: 'Não avaliado',
      LEAST_CONCERN: 'Pouco preocupante',
      NEAR_THREATENED: 'Quase ameaçado',
      VULNERABLE: 'Vulnerável',
      ENDANGERED: 'Em perigo',
      CRITICALLY_ENDANGERED: 'Criticamente em perigo',
    }

    fetchFaunaFloraRecords()
      .then((data) => {
        if (!isMounted || data.length === 0) {
          return
        }

        const mapped = data.map((item) => ({
          id: item.slug,
          name: item.name,
          scientificName: item.scientificName,
          type: (item.category === 'FAUNA' ? 'fauna' : 'flora') as 'fauna' | 'flora',
          status: statusLabels[item.status] ?? item.status,
          description: item.description ?? '',
          image: item.imageUrl ?? faunaFlora.gallery[0]?.image ?? '',
        }))

        if (mapped.length > 0) {
          setGalleryItems(mapped)
        }
      })
      .catch(() => {
        /* mantém o mural estático em caso de erro */
      })

    return () => {
      isMounted = false
    }
  }, [faunaFlora.gallery])

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
  }, [galleryItems, query, selectedFilter])

  return (
    <div className="fauna-page">
      <header className="page-hero fauna-hero" style={heroStyle}>
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">{faunaFlora.hero.tag}</span>
          <h1>{faunaFlora.hero.title}</h1>
          <p>{faunaFlora.hero.description}</p>
          <div className="fauna-controls">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="search"
                placeholder={faunaFlora.hero.searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="filter-buttons" role="group" aria-label={faunaFlora.hero.filterGroupLabel}>
              {faunaFlora.filters.map((filter) => (
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
                    <span className="gallery-type">
                      {item.type === 'fauna' ? faunaFlora.labels.fauna : faunaFlora.labels.flora}
                    </span>
                    <span className="gallery-status">{item.status}</span>
                  </div>
                  <h2>{item.name}</h2>
                  <p className="scientific-name">{item.scientificName}</p>
                  <p>{item.description}</p>
                </figcaption>
              </figure>
            </article>
          ))}
          {visibleItems.length === 0 && <p className="empty-state">{faunaFlora.labels.emptyState}</p>}
        </section>
      </main>
    </div>
  )
}

export default FaunaFloraPage
