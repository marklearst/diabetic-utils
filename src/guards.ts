import type { EstimateGMIOptions } from './types'

/**
 * Type guard to check if a value is a valid EstimateGMIOptions object.
 * @param input - The value to check for EstimateGMIOptions shape.
 * @returns True if the input is an object with numeric 'value' and string 'unit' properties, otherwise false.
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
 * Checks if a string is in the format "100 mg/dL" or "5.5 mmol/L".
 * @param input - The value to validate as a glucose string.
 * @returns True if the input is a string matching the glucose value and unit format, otherwise false.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function isValidGlucoseString(input: unknown): input is string {
  if (typeof input !== 'string') return false

  return /^\d+(\.\d+)?\s+(mg\/dL|mmol\/L)$/i.test(input.trim())
}
