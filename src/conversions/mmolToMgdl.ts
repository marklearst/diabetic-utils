/**
 * Converts glucose value from mmol/L to mg/dL.
 * Uses the standard clinical conversion factor of 18.
 *
 * @param mmol - Glucose value in mmol/L (must be a positive, finite number)
 * @returns Glucose value in mg/dL, rounded to nearest integer
 * @throws If input is not a positive, finite number
 *
 * @example
 * mmolToMgdl(5.6) // → 101
 * mmolToMgdl(10) // → 180
 *
 * @see https://www.diabetes.co.uk/blood-sugar-converter.html#google_vignette
 * @see https://en.wikipedia.org/wiki/Blood_sugar_level
 */
export function mmolToMgdl(mmol: number): number {
  if (!Number.isFinite(mmol) || mmol <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }
  return Math.round(mmol * 18)
}
