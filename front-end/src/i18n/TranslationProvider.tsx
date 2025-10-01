import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { translations, type Language, type TranslationContent } from './translations'

type TranslationContextValue = {
  language: Language
  content: TranslationContent
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

const STORAGE_KEY = 'agendunas-language'

const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'pt'
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored === 'pt' || stored === 'en') {
      return stored
    }

    const browserLanguage = window.navigator.language.slice(0, 2)
    return browserLanguage === 'en' ? 'en' : 'pt'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language)
    }
  }, [language])

  const setLanguage = useCallback((value: Language) => {
    setLanguageState(value)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => (current === 'pt' ? 'en' : 'pt'))
  }, [])

  const value = useMemo<TranslationContextValue>(
    () => ({ language, content: translations[language], setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }

  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { TranslationProvider, useTranslation }
