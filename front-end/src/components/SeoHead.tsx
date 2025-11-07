import { useEffect } from 'react'

type SeoHeadProps = {
  title?: string
  description?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
  ogLocale?: string
  preloadImages?: Array<{ src: string; type?: string }>
  preloadFonts?: Array<{ src: string; type?: string; as?: string; crossorigin?: string }>
  structuredData?: object
}

const defaultTitle = 'AgenDunas | Trilhas guiadas no Parque das Dunas em Natal-RN'
const defaultDescription =
  'Descubra a natureza preservada do Parque das Dunas em Natal-RN com trilhas guiadas. Agende sua aventura e viva uma experiência única na maior floresta urbana do Brasil.'
const defaultCanonical = 'https://www.agendunas.com.br/'
const defaultOgImage = '/og-home.jpg'
const defaultOgType = 'website'
const defaultOgLocale = 'pt_BR'

export function SeoHead({
  title = defaultTitle,
  description = defaultDescription,
  canonicalUrl = defaultCanonical,
  ogImage = defaultOgImage,
  ogType = defaultOgType,
  ogLocale = defaultOgLocale,
  preloadImages = [],
  preloadFonts = [],
  structuredData,
}: SeoHeadProps) {
  useEffect(() => {
    // Atualizar title
    document.title = title

    // Atualizar ou criar meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)

    // Atualizar ou criar canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage.startsWith('http') ? ogImage : `${canonicalUrl.replace(/\/$/, '')}${ogImage}` },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: ogType },
      { property: 'og:locale', content: ogLocale },
    ]

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage.startsWith('http') ? ogImage : `${canonicalUrl.replace(/\/$/, '')}${ogImage}` },
    ]

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // Preload images
    preloadImages.forEach(({ src, type = 'image/avif' }) => {
      let link = document.querySelector(`link[rel="preload"][href="${src}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'preload')
        link.setAttribute('as', 'image')
        link.setAttribute('href', src)
        if (type) {
          link.setAttribute('type', type)
        }
        document.head.appendChild(link)
      }
    })

    // Preload fonts
    preloadFonts.forEach(({ src, type = 'font/woff2', as = 'font', crossorigin = 'anonymous' }) => {
      let link = document.querySelector(`link[rel="preload"][href="${src}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'preload')
        link.setAttribute('as', as)
        link.setAttribute('href', src)
        link.setAttribute('type', type)
        link.setAttribute('crossorigin', crossorigin)
        document.head.appendChild(link)
      }
    })

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-seo-head]')
      if (!script) {
        script = document.createElement('script')
        script.setAttribute('type', 'application/ld+json')
        script.setAttribute('data-seo-head', 'true')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(structuredData)
    }
  }, [title, description, canonicalUrl, ogImage, ogType, ogLocale, preloadImages, preloadFonts, structuredData])

  return null
}

