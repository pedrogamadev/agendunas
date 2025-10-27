import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  AdminLoginPayload,
  AdminRegisterPayload,
  AuthResponse,
  AuthUser,
  CustomerLoginPayload,
  CustomerRegisterPayload,
} from '../api/auth'
import {
  adminLogin as adminLoginRequest,
  adminRegister as adminRegisterRequest,
  customerLogin as customerLoginRequest,
  customerRegister as customerRegisterRequest,
  fetchProfile,
} from '../api/auth'
import { getAuthToken, setAuthToken } from '../api/client'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticating: boolean
  error: string | null
  adminLogin: (payload: AdminLoginPayload) => Promise<AuthResponse>
  adminRegister: (payload: AdminRegisterPayload) => Promise<AuthResponse>
  customerLogin: (payload: CustomerLoginPayload) => Promise<AuthResponse>
  customerRegister: (payload: CustomerRegisterPayload) => Promise<AuthResponse>
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

  const adminLogin = useCallback(
    async (payload: AdminLoginPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await adminLoginRequest(payload)
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

  const adminRegister = useCallback(
    async (payload: AdminRegisterPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await adminRegisterRequest(payload)
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

  const customerLogin = useCallback(
    async (payload: CustomerLoginPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await customerLoginRequest(payload)
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

  const customerRegister = useCallback(
    async (payload: CustomerRegisterPayload) => {
      setIsAuthenticating(true)
      try {
        const result = await customerRegisterRequest(payload)
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
    () => ({
      user,
      token,
      isAuthenticating,
      error,
      adminLogin,
      adminRegister,
      customerLogin,
      customerRegister,
      logout,
      refresh,
    }),
    [
      user,
      token,
      isAuthenticating,
      error,
      adminLogin,
      adminRegister,
      customerLogin,
      customerRegister,
      logout,
      refresh,
    ],
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
