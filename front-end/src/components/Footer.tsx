import type { MouseEvent } from 'react'
import { useTranslation } from '../i18n/TranslationProvider'
import type { NavigateOptions } from '../App'

type FooterProps = {
  onNavigate: (path: string, options?: NavigateOptions) => void
}

function isExternalLink(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

function Footer({ onNavigate }: FooterProps) {
  const { content } = useTranslation()
  const year = new Date().getFullYear().toString()
  const text = content.footer.text.replace('{year}', year)

  const handleInternalNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()

    try {
      const url = new URL(href, window.location.origin)
      const path = url.pathname || '/'
      const search = url.search ? url.search.slice(1) : ''
      onNavigate(path, search ? { search } : undefined)
    } catch {
      onNavigate(href)
    }
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__legal">
          <p>{text}</p>
        </div>
        <nav className="footer__links" aria-label={content.footer.linksLabel}>
          {content.footer.links.map((link) => {
            const external = isExternalLink(link.href)
            return (
              <a
                key={link.href}
                className="footer__link"
                href={link.href}
                onClick={external ? undefined : (event) => handleInternalNavigation(event, link.href)}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer noopener' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
        <div className="footer__admin">
          <a
            className="footer__admin-link"
            href={content.footer.adminArea.href}
            onClick={(event) => handleInternalNavigation(event, content.footer.adminArea.href)}
          >
            {content.footer.adminArea.label}
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
