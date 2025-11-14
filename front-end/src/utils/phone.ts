export function sanitizePhoneNumber(value: string) {
  return value.replace(/\D/g, '')
}

export function formatPhoneForDisplay(value: string) {
  const digits = sanitizePhoneNumber(value)
  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

/**
 * Formata um número de telefone para o formato do WhatsApp (wa.me)
 * Adiciona o código do país +55 (Brasil) se não estiver presente
 * @param value - Número de telefone em qualquer formato
 * @returns Número formatado apenas com dígitos, começando com 55
 */
export function formatPhoneForWhatsApp(value: string): string {
  // Remove todos os caracteres não numéricos
  const digits = sanitizePhoneNumber(value)
  
  if (!digits) {
    return ''
  }

  // Se o número já começa com 55 (código do Brasil), retorna como está
  if (digits.startsWith('55')) {
    return digits
  }

  // Se não começa com 55, adiciona o código do país
  return `55${digits}`
}