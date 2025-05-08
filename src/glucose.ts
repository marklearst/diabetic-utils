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
 * Determines if a glucose value is below the hypoglycemia threshold for the given unit.
 * @param val - Glucose value to check.
 * @param unit - Unit of measurement (mg/dL or mmol/L). Defaults to mg/dL.
 * @returns True if the value is below the hypoglycemia threshold, otherwise false.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export function isHypo(val: number, unit: GlucoseUnit = MG_DL): boolean {
  return unit === MG_DL ? val < HYPO_THRESHOLD_MGDL : val < HYPO_THRESHOLD_MMOLL
}

/**
 * Determines if a glucose value is above the hyperglycemia threshold for the given unit.
 * @param val - Glucose value to check.
 * @param unit - Unit of measurement (mg/dL or mmol/L). Defaults to mg/dL.
 * @returns True if the value is above the hyperglycemia threshold, otherwise false.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export function isHyper(val: number, unit: GlucoseUnit = MG_DL): boolean {
  return unit === MG_DL
    ? val > HYPER_THRESHOLD_MGDL
    : val > HYPER_THRESHOLD_MMOLL
}

/**
 * Returns a glucose status label ('low', 'normal', or 'high') based on thresholds for the given unit.
 * @param val - Glucose value to label.
 * @param unit - Unit of measurement (mg/dL or mmol/L). Defaults to mg/dL.
 * @returns 'low' if below hypo threshold, 'high' if above hyper threshold, otherwise 'normal'.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
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
 * @param input - A string in the format "value unit" (e.g., "100 mg/dL").
 * @returns An object with numeric `value` and validated `unit`.
 * @throws {Error} If the input string is invalid or not in the expected format.
 * @example
 * parseGlucoseString("100 mg/dL") // { value: 100, unit: "mg/dL" }
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
 * @param value - Glucose value to validate.
 * @param unit - Glucose unit to validate.
 * @returns True if the value is a positive finite number and the unit is supported, otherwise false.
 */
export function isValidGlucoseValue(value: unknown, unit: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    (unit === MG_DL || unit === MMOL_L)
  )
}
