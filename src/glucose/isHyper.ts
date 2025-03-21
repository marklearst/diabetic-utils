import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'
import { GLUCOSE_RANGES } from '@src/constants'

/**
 * Returns true if glucose value is above the high threshold.
 * @param value - Glucose value (must be a positive, finite number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @returns boolean
 */
export function isHyper(value: number, unit: GlucoseUnit): boolean {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error('Invalid glucose value')
  // istanbul ignore next
  if (!allowedGlucoseUnits.includes(unit)) throw new Error('Invalid unit')
  const mgdl = unit === 'mmol/L' ? value * 18.0182 : value
  return mgdl > GLUCOSE_RANGES.high
}
