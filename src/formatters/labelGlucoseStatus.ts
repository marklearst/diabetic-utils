import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'
import { GLUCOSE_RANGES } from '@src/constants/ranges'

/**
 * Label glucose status as 'low', 'normal', or 'high' based on value and unit.
 *
 * @param value - Glucose value (must be a positive, finite number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @returns 'low', 'normal', or 'high'
 *
 * @throws If value is not a positive, finite number or unit is invalid
 *
 * @example
 * labelGlucoseStatus(65, 'mg/dL') // 'low'
 * labelGlucoseStatus(100, 'mg/dL') // 'normal'
 * labelGlucoseStatus(200, 'mg/dL') // 'high'
 */
export function labelGlucoseStatus(
  value: number,
  unit: GlucoseUnit
): 'low' | 'normal' | 'high' {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }
  if (!allowedGlucoseUnits.includes(unit)) {
    throw new Error(`Invalid glucose unit: ${unit}`)
  }

  // Convert mmol/L to mg/dL for consistent comparison
  const mgdlValue = unit === 'mmol/L' ? value * 18.0182 : value

  if (mgdlValue < GLUCOSE_RANGES.low) return 'low'
  if (mgdlValue > GLUCOSE_RANGES.high) return 'high'
  return 'normal'
}
