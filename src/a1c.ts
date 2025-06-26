// @file src/a1c.ts

/**
 * Formats a clinical A1C value as a percent string (e.g., "7.2%").
 * Used for clinical reporting and display.
 * @param val - A1C value (percentage)
 * @returns A1C as string with percent sign
 */
export function formatA1C(val: number): string {
  return `${val.toFixed(1)}%`
}

/**
 * Validates a clinical A1C value (percentage).
 * Ensures value is within physiologically plausible range for clinical analytics.
 * @param value - Candidate A1C value
 * @returns True if value is a valid A1C percentage
 */
export function isValidA1C(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    value < 20
  )
}

/**
 * Returns the clinical category for an A1C value (normal, prediabetes, diabetes, or invalid).
 * Uses ADA thresholds by default, but allows custom cutoffs for research or population-specific use.
 * @param a1c - A1C value (percentage)
 * @returns 'normal' | 'prediabetes' | 'diabetes' | 'invalid'
 */
/**
 * Returns the clinical category for an A1C value (normal, prediabetes, diabetes, or invalid).
 * Uses ADA thresholds by default, but allows custom cutoffs for research or population-specific use.
 * @param a1c - A1C value (percentage)
 * @param thresholds - Optional custom thresholds: { normalMax?: number; prediabetesMax?: number }
 * @returns 'normal' | 'prediabetes' | 'diabetes' | 'invalid'
 */
export function getA1CCategory(
  a1c: number,
  thresholds?: { normalMax?: number; prediabetesMax?: number }
): 'normal' | 'prediabetes' | 'diabetes' | 'invalid' {
  const normalMax = thresholds?.normalMax ?? 5.7
  const prediabetesMax = thresholds?.prediabetesMax ?? 6.5
  if (!isValidA1C(a1c)) return 'invalid'
  if (a1c <= normalMax) return 'normal'
  if (a1c <= prediabetesMax) return 'prediabetes'
  return 'diabetes'
}

/**
 * Checks if an A1C value is within a target range.
 * @param a1c - A1C value
 * @param target - [min, max] range (default: [6.5, 7.0])
 * @param thresholds - Optional custom thresholds: { min?: number; max?: number }
 * @returns True if in target range
 */
export function isA1CInTarget(
  a1c: number,
  target: [number, number] = [6.5, 7.0],
  thresholds?: { min?: number; max?: number }
): boolean {
  const min = thresholds?.min ?? target[0]
  const max = thresholds?.max ?? target[1]
  return isValidA1C(a1c) && a1c >= min && a1c <= max
}

/**
 * Calculates the change (delta) between two A1C values.
 * @param current - Current A1C
 * @param previous - Previous A1C
 * @returns Delta (current - previous)
 * @throws If either value is invalid
 */
export function a1cDelta(current: number, previous: number): number {
  if (!isValidA1C(current) || !isValidA1C(previous))
    throw new Error('Invalid A1C value')
  return +(current - previous).toFixed(2)
}

/**
 * Determines the trend of A1C values over time.
 * @param readings - Array of A1C values (chronological order)
 * @returns 'increasing' | 'decreasing' | 'stable' | 'insufficient data'
 */
export function a1cTrend(
  readings: number[]
): 'increasing' | 'decreasing' | 'stable' | 'insufficient data' {
  if (!Array.isArray(readings) || readings.length < 2)
    return 'insufficient data'
  const delta = readings[readings.length - 1] - readings[0]
  if (Math.abs(delta) < 0.1) return 'stable'
  return delta > 0 ? 'increasing' : 'decreasing'
}
