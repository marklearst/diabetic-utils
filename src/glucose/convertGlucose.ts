import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'

/**
 * Converts glucose value between mg/dL and mmol/L.
 * @param value - Glucose value (must be a positive, finite number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @returns Object with converted value and new unit
 */
export function convertGlucose({
  value,
  unit,
}: {
  value: number
  unit: GlucoseUnit
}): { value: number; unit: GlucoseUnit } {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error('Invalid glucose value')
  if (!allowedGlucoseUnits.includes(unit)) throw new Error('Invalid unit')
  if (unit === 'mg/dL')
    return { value: +(value / 18.0182).toFixed(2), unit: 'mmol/L' }
  return { value: +(value * 18.0182).toFixed(0), unit: 'mg/dL' }
}
