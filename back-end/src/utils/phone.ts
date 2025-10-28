const NON_DIGIT_REGEX = /\D+/g

export const MIN_PHONE_DIGITS = 10
export const MAX_PHONE_DIGITS = 13

export function sanitizePhoneNumber(input: string): string {
  return input.replace(NON_DIGIT_REGEX, '')
}

export function isValidPhoneDigits(digits: string): boolean {
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS
}

export function isValidPhoneInput(input: string): boolean {
  const digits = sanitizePhoneNumber(input)
  return isValidPhoneDigits(digits)
}

export function normalizePhoneInput(input?: string | null): string | null {
  if (!input) {
    return null
  }

  const digits = sanitizePhoneNumber(input)
  return digits.length > 0 ? digits : null
}
