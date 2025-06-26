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
 * Checks if a glucose value is clinically hypoglycemic for the given unit.
 * Used for detecting low glucose events in clinical analytics and reporting.
 * @param val - Glucose value (number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L'), default: 'mg/dL'
 * @param thresholds - Optional custom thresholds ({ mgdl?: number; mmoll?: number })
 * @returns True if value is below clinical hypoglycemia threshold
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export function isHypo(
  val: number,
  unit: GlucoseUnit = MG_DL,
  thresholds?: { mgdl?: number; mmoll?: number }
): boolean {
  const hypoMgdl = thresholds?.mgdl ?? HYPO_THRESHOLD_MGDL
  const hypoMmoll = thresholds?.mmoll ?? HYPO_THRESHOLD_MMOLL
  return unit === MG_DL ? val < hypoMgdl : val < hypoMmoll
}

/**
 * Checks if a glucose value is clinically hyperglycemic for the given unit.
 * Used for detecting high glucose events in clinical analytics and reporting.
 * @param val - Glucose value (number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L'), default: 'mg/dL'
 * @param thresholds - Optional custom thresholds ({ mgdl?: number; mmoll?: number })
 * @returns True if value is above clinical hyperglycemia threshold
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export function isHyper(
  val: number,
  unit: GlucoseUnit = MG_DL,
  thresholds?: { mgdl?: number; mmoll?: number }
): boolean {
  const hyperMgdl = thresholds?.mgdl ?? HYPER_THRESHOLD_MGDL
  const hyperMmoll = thresholds?.mmoll ?? HYPER_THRESHOLD_MMOLL
  return unit === MG_DL ? val > hyperMgdl : val > hyperMmoll
}

/**
 * Returns a clinical glucose status label ('low', 'normal', or 'high') based on thresholds for the given unit.
 * Used for clinical charting, alerts, and reporting.
 * @param val - Glucose value (number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L'), default: 'mg/dL'
 * @param thresholds - Optional custom thresholds for hypo/hyper ({ hypo?: { mgdl?: number; mmoll?: number }, hyper?: { mgdl?: number; mmoll?: number } })
 * @returns 'low', 'normal', or 'high' based on clinical thresholds
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export function getGlucoseLabel(
  val: number,
  unit: GlucoseUnit = MG_DL,
  thresholds?: {
    hypo?: { mgdl?: number; mmoll?: number }
    hyper?: { mgdl?: number; mmoll?: number }
  }
): 'low' | 'normal' | 'high' {
  if (isHypo(val, unit, thresholds?.hypo)) return 'low'
  if (isHyper(val, unit, thresholds?.hyper)) return 'high'
  return 'normal'
}

/**
 * Parses a clinical glucose string (e.g., "100 mg/dL", "5.5 mmol/L") into value and unit.
 * Used for robust input validation and clinical data ingestion.
 * @param input - String in the format "value unit" (e.g., "100 mg/dL")
 * @returns Object with numeric value and validated unit
 * @throws {Error} If input string is invalid or not in expected format
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
 * Validates a clinical glucose value and unit.
 * Ensures value is a positive finite number and unit is supported for analytics.
 * @param value - Glucose value to validate
 * @param unit - Glucose unit to validate
 * @returns True if value and unit are clinically valid
 */
export function isValidGlucoseValue(value: unknown, unit: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    (unit === MG_DL || unit === MMOL_L)
  )
}
