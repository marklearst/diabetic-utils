/**
 * Converts glucose value from mg/dL to mmol/L.
 * Uses the standard clinical conversion factor of 18.
 *
 * @param mgdl - Glucose value in mg/dL (must be a positive, finite number)
 * @returns Glucose value in mmol/L, rounded to 2 decimal places
 * @throws If input is not a positive, finite number
 *
 * @example
 * mgdlToMmol(100) // → 5.56
 * mgdlToMmol(180) // → 10.00
 *
 * @see https://www.diabetes.co.uk/blood-sugar-converter.html#google_vignette
 * @see https://en.wikipedia.org/wiki/Blood_sugar_level
 */
export const mgdlToMmol = (mgdl: number): number => {
  if (!Number.isFinite(mgdl) || mgdl <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }
  // Round to 2 decimal places using Math.round for better precision
  return Math.round((mgdl / 18) * 100) / 100
}
