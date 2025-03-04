import type { GlucoseUnit } from '@src/a1c/types'
import { isValidGlucoseString } from './guards/isValidGlucoseString'

/**
 * Parses a glucose string like "100 mg/dL" or "5.5 mmol/L".
 *
 * @param input - The glucose string to parse
 * @returns An object with numeric value and glucose unit
 * @throws If the string is not a valid glucose format
 *
 * @example
 * parseGlucoseString("100 mg/dL") → { value: 100, unit: "mg/dL" }
 */
export function parseGlucoseString(input: string): {
  value: number
  unit: GlucoseUnit
} {
  if (!isValidGlucoseString(input)) {
    throw new Error(
      'Invalid glucose string format. Use "100 mg/dL" or "5.5 mmol/L".'
    )
  }

  const cleaned = input.trim().replace(/\s+/g, ' ')
  const match = cleaned.match(/^([\d.]+) (mg\/dL|mmol\/L)$/i)
  if (!match) {
    throw new Error(
      'Invalid glucose string format. Use "100 mg/dL" or "5.5 mmol/L".'
    )
  }
  const [_, rawValue, rawUnit] = match // safe due to guard

  return {
    value: parseFloat(rawValue),
    unit:
      rawUnit.toLowerCase() === 'mg/dl'
        ? 'mg/dL'
        : rawUnit.toLowerCase() === 'mmol/l'
        ? 'mmol/L'
        : (rawUnit as GlucoseUnit),
  }
}
