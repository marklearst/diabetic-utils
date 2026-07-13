// @file src/validators.ts

/**
 * Validates a clinical fasting insulin value (µIU/mL).
 * Ensures value is a positive finite number and within plausible physiological range.
 * @param value - Candidate insulin value
 * @returns True if value is a valid fasting insulin (µIU/mL)
 * @see https://www.ncbi.nlm.nih.gov/books/NBK279396/ (normal fasting insulin: ~2-25 µIU/mL, but allow wider plausible range for outliers)
 */
export function isValidInsulin(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    value < 1000 // upper bound is generous for outliers, adjust as needed
  )
}
