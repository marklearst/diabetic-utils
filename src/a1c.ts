// @file src/a1c.ts

/**
 * Formats an A1C value with % sign.
 * @param val - A1C number
 * @returns A1C as string with percent
 */
export function formatA1C(val: number): string {
  return `${val.toFixed(1)}%`
}

/**
 * Validates if a value is a plausible A1C percentage.
 * @param value - Value to check
 * @returns True if valid A1C
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
 * Returns a clinical category for an A1C value.
 * @param a1c - A1C value
 * @returns 'normal' | 'prediabetes' | 'diabetes' | 'invalid'
 */
export function getA1CCategory(
  a1c: number
): 'normal' | 'prediabetes' | 'diabetes' | 'invalid' {
  if (!isValidA1C(a1c)) return 'invalid'
  if (a1c < 5.7) return 'normal'
  if (a1c < 6.5) return 'prediabetes'
  return 'diabetes'
}

/**
 * Checks if an A1C value is within a target range.
 * @param a1c - A1C value
 * @param target - [min, max] range (default: [6.5, 7.0])
 * @returns True if in target range
 */
export function isA1CInTarget(
  a1c: number,
  target: [number, number] = [6.5, 7.0]
): boolean {
  return isValidA1C(a1c) && a1c >= target[0] && a1c <= target[1]
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
