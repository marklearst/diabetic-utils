import type { EstimateGMIOptions } from '@src/a1c/types'

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
