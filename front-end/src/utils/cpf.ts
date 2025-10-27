export function sanitizeCpf(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatCpf(value: string) {
  const digits = sanitizeCpf(value)

  if (digits.length !== 11) {
    return digits
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatCpfForInput(value: string) {
  const digits = sanitizeCpf(value)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 9)
  const part4 = digits.slice(9, 11)

  let formatted = part1
  if (part2) {
    formatted = formatted ? `${formatted}.${part2}` : part2
  }
  if (part3) {
    formatted = formatted ? `${formatted}.${part3}` : part3
  }
  if (part4) {
    formatted = formatted ? `${formatted}-${part4}` : part4
  }

  return formatted
}
