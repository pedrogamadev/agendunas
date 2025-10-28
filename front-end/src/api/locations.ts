export type BrazilianState = {
  id: number
  name: string
  abbreviation: string
}

export type BrazilianCity = {
  id: number
  name: string
}

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades'

export async function fetchBrazilianStates(): Promise<BrazilianState[]> {
  const response = await fetch(`${IBGE_BASE_URL}/estados?orderBy=nome`)

  if (!response.ok) {
    throw new Error('Não foi possível carregar a lista de estados.')
  }

  const payload = (await response.json()) as { id: number; sigla: string; nome: string }[]

  return payload
    .map((state) => ({ id: state.id, abbreviation: state.sigla, name: state.nome }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function fetchCitiesByState(stateAbbreviation: string): Promise<BrazilianCity[]> {
  const normalized = stateAbbreviation.trim().toUpperCase()

  if (!normalized) {
    return []
  }

  const response = await fetch(`${IBGE_BASE_URL}/estados/${normalized}/municipios?orderBy=nome`)

  if (!response.ok) {
    throw new Error('Não foi possível carregar a lista de cidades.')
  }

  const payload = (await response.json()) as { id: number; nome: string }[]

  return payload.map((city) => ({ id: city.id, name: city.nome }))
}
