/**
 * Parse a date value coming from the DB/API (ISO string like "2017-08-30T00:00:00.000Z"
 * or a plain "YYYY-MM-DD" string) treating the calendar date as local (no UTC shift).
 *
 * Dates stored in the DB are saved at UTC midnight. When converted with `new Date(isoString)`
 * in a UTC-3 browser they shift one day backwards. This helper extracts the UTC date parts
 * so that "2017-08-30T00:00:00.000Z" always yields August 30, regardless of the local timezone.
 */
export function parseDateUTC(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return null
  // Build a local Date using the UTC year/month/day so display is timezone-agnostic
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/**
 * Format a birth date string/Date for display in Spanish using UTC parts.
 * Example output: "30 de agosto de 2017"
 */
export function formatBirthDate(
  value: string | Date | null | undefined,
  opts: { year?: boolean } = { year: true }
): string {
  const d = parseDateUTC(value)
  if (!d) return "No especificada"
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    ...(opts.year !== false ? { year: "numeric" } : {})
  })
}

/**
 * Calculate age from a birth date, using UTC-safe parsing.
 */
export function calculateAgeFromDate(value: string | Date | null | undefined): number | null {
  const birth = parseDateUTC(value)
  if (!birth) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Made with Bob
