/**
 * Estimates the average glucose (eAG) from A1C using the ADA/ADAG standard formula.
 *
 * Formula: eAG (mg/dL) = 28.7 × A1C - 46.7
 *
 * @param a1c - Hemoglobin A1C value (must be a positive, finite number)
 * @returns Estimated average glucose in mg/dL, rounded to nearest integer
 * @throws If input is not a positive, finite number
 *
 * @see https://professional.diabetes.org/glucose_calc
 * @see https://www.omnicalculator.com/health/estimated-average-glucose
 *
 * @example
 * estimateEAG(6.0) // → 126
 * estimateEAG(7.0) // → 154
 * estimateEAG(5.5) // → 111
 * estimateEAG(10)  // → 240
 */
export function estimateEAG(a1c: number): number {
  if (typeof a1c !== 'number' || !Number.isFinite(a1c) || a1c <= 0) {
    throw new Error('A1C must be a positive, finite number')
  }
  // Use toFixed to avoid floating-point errors, then round to nearest integer
  const eAG = Number((28.7 * a1c - 46.7).toFixed(10))
  return Math.round(eAG)
}
