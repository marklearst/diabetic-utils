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
