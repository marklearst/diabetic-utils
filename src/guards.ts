import type { EstimateGMIOptions } from './types'

/**
 * Type guard to check if a value is a valid EstimateGMIOptions object.
 *
 * @param input - The input to check
 * @returns True if input is a valid EstimateGMIOptions shape
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
 * Checks if a glucose string is in the format "100 mg/dL" or "5.5 mmol/L".
 *
 * @param input - The string to validate
 * @returns True if it matches a valid glucose format
 */
export function isValidGlucoseString(input: unknown): input is string {
  if (typeof input !== 'string') return false

  return /^\d+(\.\d+)?\s+(mg\/dL|mmol\/L)$/i.test(input.trim())
}
