// @file src/conversions.ts

import {
  A1C_TO_EAG_MULTIPLIER,
  A1C_TO_EAG_CONSTANT,
  MGDL_MMOLL_CONVERSION,
  MG_DL,
  MMOL_L,
} from './constants'
import { GlucoseUnit } from './types'
import type { EstimateGMIOptions } from './types'
import { isEstimateGMIOptions } from './guards'
import { parseGlucoseString } from './glucose'

/**
 * Converts clinical average glucose (mg/dL) to estimated A1C (percentage).
 * Used for clinical analytics and patient reporting.
 * @param avgMgDl - Average glucose in mg/dL
 * @returns Estimated A1C value (percentage)
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export function estimateA1CFromAvgGlucose(avgMgDl: number): number {
  return +((avgMgDl + A1C_TO_EAG_CONSTANT) / A1C_TO_EAG_MULTIPLIER).toFixed(2)
}

/**
 * Converts clinical A1C value (percentage) to estimated average glucose (mg/dL).
 * Used for clinical analytics and patient reporting.
 * @param a1c - A1C value (percentage)
 * @returns Estimated average glucose in mg/dL
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export function estimateAvgGlucoseFromA1C(a1c: number): number {
  return Math.round(a1c * A1C_TO_EAG_MULTIPLIER - A1C_TO_EAG_CONSTANT)
}

/**
 * Estimates eAG (estimated average glucose, mg/dL) from clinical A1C value.
 * Throws if input is negative. Used for clinical and research reporting.
 * @param a1c - A1C value (percentage)
 * @returns Estimated average glucose (mg/dL)
 * @throws {Error} If a1c is negative
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export function estimateEAG(a1c: number): number {
  if (a1c < 0) throw new Error('A1C must be positive')
  const eAG = Number(
    (a1c * A1C_TO_EAG_MULTIPLIER - A1C_TO_EAG_CONSTANT).toFixed(10)
  )
  return Math.round(eAG)
}

/**
 * Estimates A1C from average glucose.
 * @param avgGlucose - Average glucose value
 * @param unit - Glucose unit (mg/dL or mmol/L)
 * @returns Estimated A1C
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export function estimateA1CFromAverage(
  avgGlucose: number,
  unit: GlucoseUnit = MG_DL
): number {
  const glucoseMgdl =
    unit === MMOL_L ? avgGlucose * MGDL_MMOLL_CONVERSION : avgGlucose
  return +((glucoseMgdl + 46.7) / 28.7).toFixed(2)
}

/**
 * Converts A1C to Glucose Management Indicator (GMI).
 * @param a1c - A1C value
 * @returns GMI value
 * @see https://diatribe.org/glucose-management-indicator-gmi
 */
export function a1cToGMI(a1c: number): number {
  return +(3.31 + 0.02392 * a1c).toFixed(2)
}

/**
 * Estimate Glucose Management Indicator (GMI) from average glucose.
 * @param valueOrOptions - Glucose value, string, or options object
 * @param unit - Glucose unit (if value is a number)
 * @returns GMI value
 * @throws {Error} If unit is required but not provided when input is a number.
 * @throws {Error} If the glucose unit is unsupported.
 * @throws {Error} If the glucose value is not a positive number.
 * @see https://diatribe.org/glucose-management-indicator-gmi
 */
export function estimateGMI(
  valueOrOptions: number | string | EstimateGMIOptions,
  unit?: GlucoseUnit
): number {
  let value: number
  let resolvedUnit: GlucoseUnit

  if (isEstimateGMIOptions(valueOrOptions)) {
    value = valueOrOptions.value
    resolvedUnit = valueOrOptions.unit
  } else if (typeof valueOrOptions === 'string') {
    const parsed = parseGlucoseString(valueOrOptions)
    value = parsed.value
    resolvedUnit = parsed.unit
  } else {
    if (!unit) throw new Error('Unit is required when input is a number.')
    value = valueOrOptions
    resolvedUnit = unit
  }

  if (![MG_DL, MMOL_L].includes(resolvedUnit)) {
    throw new Error(`Unsupported glucose unit: ${resolvedUnit}`)
  }

  if (value <= 0 || !Number.isFinite(value)) {
    throw new Error('Glucose value must be a positive number.')
  }

  const gmi = resolvedUnit === MMOL_L ? 1.57 * value + 3.5 : 0.03 * value + 2.4

  return parseFloat(gmi.toFixed(1))
}

/**
 * Converts clinical glucose value from mg/dL to mmol/L.
 * Used for international interoperability and reporting.
 * @param val - Glucose value in mg/dL
 * @returns Value in mmol/L
 * @throws {Error} If val is not a finite number or is negative/zero
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function mgDlToMmolL(val: number): number {
  if (!Number.isFinite(val) || val <= 0)
    throw new Error('Invalid glucose value')
  return +(val / MGDL_MMOLL_CONVERSION).toFixed(1)
}

/**
 * Converts clinical glucose value from mmol/L to mg/dL.
 * Used for international interoperability and reporting.
 * @param val - Glucose value in mmol/L
 * @returns Value in mg/dL
 * @throws {Error} If val is not a finite number or is negative/zero
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function mmolLToMgDl(val: number): number {
  if (!Number.isFinite(val) || val <= 0)
    throw new Error('Invalid glucose value')
  return Math.round(val * MGDL_MMOLL_CONVERSION)
}

/**
 * Converts clinical glucose value between mg/dL and mmol/L.
 * Used for clinical interoperability and analytics.
 * @param value - Glucose value (number)
 * @param unit - Current glucose unit ('mg/dL' or 'mmol/L')
 * @returns Object with converted value and new unit
 * @throws {Error} If value is not a finite number or is negative/zero
 * @throws {Error} If unit is not a supported glucose unit
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function convertGlucoseUnit({
  value,
  unit,
}: {
  value: number
  unit: GlucoseUnit
}): { value: number; unit: GlucoseUnit } {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error('Invalid glucose value')
  if (![MG_DL, MMOL_L].includes(unit)) throw new Error('Invalid unit')
  if (unit === MG_DL)
    return {
      value: Math.round((value / MGDL_MMOLL_CONVERSION) * 10) / 10,
      unit: MMOL_L,
    }
  return {
    value: Math.round(value * MGDL_MMOLL_CONVERSION),
    unit: MG_DL,
  }
}
