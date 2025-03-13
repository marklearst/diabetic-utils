/**
 * Format a glucose value with its unit.
 *
 * @param value - Glucose value (must be a positive, finite number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @returns Formatted string (e.g., '100 mg/dL')
 *
 * @throws If value is not a positive, finite number or unit is invalid
 *
 * @example
 * formatGlucose(100, 'mg/dL') // '100 mg/dL'
 * formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'
 */

import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'

export function formatGlucose(value: number, unit: GlucoseUnit): string {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }

  if (!allowedGlucoseUnits.includes(unit)) {
    throw new Error(`Invalid glucose unit: ${unit}`)
  }

  return `${value} ${unit}`
}
