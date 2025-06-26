import type { EstimateGMIOptions } from './types'

/**
 * Clinical type guard for EstimateGMIOptions.
 * Validates that the input matches the required shape for GMI estimation options (numeric value, string unit).
 * Useful for ensuring safe handling of clinical glucose data and interoperability with analytics functions.
 * @param input - Candidate value to validate.
 * @returns True if input is a valid EstimateGMIOptions object.
 */
export function isEstimateGMIOptions(
  input: unknown
): input is EstimateGMIOptions {
  return (
    typeof input === 'object' &&
    input !== null &&
    'value' in input &&
    'unit' in input &&
    typeof (input as any).value === 'number' &&
    typeof (input as any).unit === 'string'
  )
}

/**
 * Validates a clinical glucose string (e.g., "100 mg/dL", "5.5 mmol/L").
 * Ensures the string is in a recognized clinical format for glucose values, supporting safe parsing and conversion.
 * @param input - Value to check as a clinical glucose string.
 * @returns True if input is a valid glucose string for clinical use.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function isValidGlucoseString(input: unknown): input is string {
  if (typeof input !== 'string') return false

  return /^\d+(\.\d+)?\s+(mg\/dL|mmol\/L)$/i.test(input.trim())
}
