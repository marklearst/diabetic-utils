/**
 * @file src/metrics/jindex.ts
 *
 * J-Index: a composite measure of both mean glucose and variability.
 *
 * Formula (Wojcicki 1995):
 *   J = 0.001 * (mean + SD)^2
 *
 * Input values must be in mg/dL.
 *
 * @see https://doi.org/10.1055/s-2007-979906  Wojcicki (1995)
 */

/**
 * Calculates the J-Index for a glucose trace.
 *
 * The J-Index captures both central tendency and variability in a
 * single score. Higher values indicate worse glycemic control.
 *
 * @param readings - Array of glucose values in mg/dL
 * @returns J-Index value, or NaN if fewer than 2 valid readings
 * @see https://doi.org/10.1055/s-2007-979906
 */
export function calculateJIndex(readings: number[]): number {
  const valid = readings.filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length < 2) return NaN

  const mean = valid.reduce((s, v) => s + v, 0) / valid.length
  const variance =
    valid.reduce((s, v) => s + (v - mean) ** 2, 0) / (valid.length - 1)
  const sd = Math.sqrt(variance)

  return Math.round(0.001 * (mean + sd) ** 2 * 100) / 100
}
