import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../api/auth'
import { fetchProfile, login as loginRequest, register as registerRequest } from '../api/auth'
import { getAuthToken, setAuthToken } from '../api/client'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticating: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'agendunas.auth.token'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage.getItem(STORAGE_KEY)
  })
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = token ?? (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (storedToken) {
      setAuthToken(storedToken)
      fetchProfile()
        .then((profile) => {
          setUser(profile)
        })
        .catch(() => {
          setAuthToken(null)
          setUser(null)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        })
        .finally(() => {
          setIsAuthenticating(false)
        })
    } else {
      setAuthToken(null)
      setIsAuthenticating(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, token)
      }
    } else if (typeof window !== 'undefined') {
      if (!getAuthToken()) {
        setAuthToken(null)
      }
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [token])

  const handleSuccess = useCallback((response: AuthResponse) => {
    if (response.token) {
      setToken(response.token)
      setAuthToken(response.token)
    }
    setUser(response.usuario ?? null)
    setError(null)
    return response
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await loginRequest(payload)
        return handleSuccess(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível entrar no sistema.'
        setError(message)
        throw err
      } finally {
        setIsAuthenticating(false)
      }
    },
    [handleSuccess],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await registerRequest(payload)
        return handleSuccess(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.'
        setError(message)
        throw err
      } finally {
        setIsAuthenticating(false)
      }
    },
    [handleSuccess],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setError(null)
    setAuthToken(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const refresh = useCallback(async () => {
    const activeToken = getAuthToken() ?? token
    if (!activeToken) {
      setUser(null)
      return
    }

    try {
      const profile = await fetchProfile()
      setUser(profile)
    } catch (err) {
      logout()
      throw err
    }
  }, [logout, token])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticating, error, login, register, logout, refresh }),
    [user, token, isAuthenticating, error, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider')
  }
  return context
}
