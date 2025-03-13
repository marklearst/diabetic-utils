import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'

/**
 * Checks if a glucose value and unit are valid.
 * @param value - Glucose value
 * @param unit - Glucose unit
 * @returns boolean
 */
export function isValidGlucoseValue(value: unknown, unit: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    allowedGlucoseUnits.includes(unit as GlucoseUnit)
  )
}
