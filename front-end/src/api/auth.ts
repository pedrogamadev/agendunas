import { apiRequest } from './client'

export type AuthUser = {
  cpf: string
  nome: string | null
  tipo: 'A' | 'C' | 'G'
  guia: { slug: string; nome: string | null } | null
}

export type AuthResponse = {
  token: string
  usuario: AuthUser | null
}

export type LoginPayload = {
  cpf: string
  senha: string
}

export type RegisterPayload = {
  cpf: string
  token: string
  senha: string
  confirmacaoSenha: string
  nome?: string
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload })
}

export function fetchProfile() {
  return apiRequest<AuthUser>('/auth/me')
}
