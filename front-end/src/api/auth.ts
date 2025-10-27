import { apiRequest } from './client'

export type AuthUser = {
  cpf: string
  nome: string | null
  sobrenome: string | null
  email: string | null
  dataNascimento: string | null
  cidadeOrigem: string | null
  tipo: 'A' | 'C' | 'G'
  guia: { slug: string; nome: string | null } | null
  fotoUrl?: string | null
}

export type AuthResponse = {
  token: string
  usuario: AuthUser | null
}

export type AdminLoginPayload = {
  cpf: string
  senha: string
}

export type AdminRegisterPayload = {
  cpf: string
  token: string
  senha: string
  confirmacaoSenha: string
  nome?: string
}

export type CustomerLoginPayload = {
  cpf: string
  senha: string
}

export type CustomerRegisterPayload = {
  cpf: string
  nome: string
  sobrenome: string
  dataNascimento: string
  email: string
  cidadeOrigem: string
  senha: string
  confirmacaoSenha: string
}

export function adminLogin(payload: AdminLoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload })
}

export function adminRegister(payload: AdminRegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload })
}

export function customerLogin(payload: CustomerLoginPayload) {
  return apiRequest<AuthResponse>('/auth/customer/login', { method: 'POST', body: payload })
}

export function customerRegister(payload: CustomerRegisterPayload) {
  return apiRequest<AuthResponse>('/auth/customer/register', { method: 'POST', body: payload })
}

export function fetchProfile() {
  return apiRequest<AuthUser>('/auth/me')
}
