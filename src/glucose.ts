// @file src/glucose.ts

import { GlucoseUnit } from './types'
import {
  HYPO_THRESHOLD_MGDL,
  HYPO_THRESHOLD_MMOLL,
  HYPER_THRESHOLD_MGDL,
  HYPER_THRESHOLD_MMOLL,
  MG_DL,
  MMOL_L,
} from './constants'

import { isValidGlucoseString } from './guards'

/**
 * Checks if a glucose value is below hypoglycemia threshold.
 * @param val - Glucose value
 * @param unit - Unit of measurement
 * @returns true if hypo
 */
export function isHypo(val: number, unit: GlucoseUnit = MG_DL): boolean {
  return unit === MG_DL ? val < HYPO_THRESHOLD_MGDL : val < HYPO_THRESHOLD_MMOLL
}

/**
 * Checks if a glucose value is above hyperglycemia threshold.
 * @param val - Glucose value
 * @param unit - Unit of measurement
 * @returns true if hyper
 */
export function isHyper(val: number, unit: GlucoseUnit = MG_DL): boolean {
  return unit === MG_DL
    ? val > HYPER_THRESHOLD_MGDL
    : val > HYPER_THRESHOLD_MMOLL
}

/**
 * Returns a glucose status label.
 * @param val - Glucose value
 * @param unit - Unit of measurement
 * @returns 'low' | 'normal' | 'high'
 */
export function getGlucoseLabel(
  val: number,
  unit: GlucoseUnit = MG_DL
): 'low' | 'normal' | 'high' {
  if (isHypo(val, unit)) return 'low'
  if (isHyper(val, unit)) return 'high'
  return 'normal'
}

/**
 * Parses a glucose string like "100 mg/dL" or "5.5 mmol/L" into a value and unit.
 *
 * @param input - A string in the format "value unit"
 * @returns An object with numeric `value` and validated `unit`
 * @throws If the input string is invalid or not in the expected format
 *
 * @example
 * parseGlucoseString("100 mg/dL") → { value: 100, unit: "mg/dL" }
 *
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
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
  const [, rawValue, rawUnit] = match!

  return {
    value: parseFloat(rawValue),
    unit: rawUnit.toLowerCase() === 'mg/dl' ? MG_DL : MMOL_L,
  }
}

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
    (unit === MG_DL || unit === MMOL_L)
  )
}
