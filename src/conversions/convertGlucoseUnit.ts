import { GlucoseUnit } from '@src/a1c/types'

/**
 * Converts a glucose value from one unit to another.
 * @param value - Glucose value (must be a positive, finite number)
 * @param from - Source unit ('mg/dL' or 'mmol/L')
 * @param to - Target unit ('mg/dL' or 'mmol/L')
 * @returns Converted value
 * @throws If value is invalid or conversion is unsupported
 */
export function convertGlucoseUnit(
  value: number,
  from: GlucoseUnit,
  to: GlucoseUnit
): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }
  if (from === to) return value
  if (from === 'mg/dL' && to === 'mmol/L') return value / 18.0182
  if (from === 'mmol/L' && to === 'mg/dL') return value * 18.0182
  throw new Error(`Unsupported conversion: ${from} → ${to}`)
}
