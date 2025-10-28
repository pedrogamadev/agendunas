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
