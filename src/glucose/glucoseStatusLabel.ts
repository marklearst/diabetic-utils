/**
 * Returns a user-friendly label for a glucose value (e.g., 'Low', 'Normal', 'High') based on value and unit.
 * Uses standard clinical ranges and conversion factor of 18.
 *
 * @param value - Glucose value in mg/dL or mmol/L (must be a positive, finite number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @returns 'Low', 'Normal', or 'High'
 * @throws If value is not a positive, finite number or unit is invalid
 *
 * @example
 * glucoseStatusLabel(65, 'mg/dL') // 'Low'
 * glucoseStatusLabel(100, 'mg/dL') // 'Normal'
 * glucoseStatusLabel(200, 'mg/dL') // 'High'
 *
 * @see https://www.diabetes.co.uk/blood-sugar-converter.html#google_vignette
 * @see https://en.wikipedia.org/wiki/Blood_sugar_level
 */
import { GlucoseUnit, allowedGlucoseUnits } from '@src/a1c/types'
import { GLUCOSE_RANGES } from '@src/constants/ranges'

export function glucoseStatusLabel(
  value: number,
  unit: GlucoseUnit
): 'Low' | 'Normal' | 'High' {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Glucose value must be a positive, finite number')
  }
  if (!allowedGlucoseUnits.includes(unit)) {
    throw new Error(`Invalid glucose unit: ${unit}`)
  }
  // Convert mmol/L to mg/dL for consistent comparison
  const mgdlValue = unit === 'mmol/L' ? value * 18 : value
  if (mgdlValue < GLUCOSE_RANGES.low) return 'Low'
  if (mgdlValue > GLUCOSE_RANGES.high) return 'High'
  return 'Normal'
}
