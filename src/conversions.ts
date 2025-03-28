// @file src/conversions.ts

import { A1C_TO_EAG_MULTIPLIER, A1C_TO_EAG_CONSTANT } from './constants'
import type { EstimateGMIOptions, GlucoseUnit } from './types'
import { isEstimateGMIOptions } from './guards'
import { parseGlucoseString } from './glucose'

/**
 * Converts average glucose (mg/dL) to estimated A1C.
 */
export function estimateA1CFromAvgGlucose(avgMgDl: number): number {
  return +((avgMgDl + A1C_TO_EAG_CONSTANT) / A1C_TO_EAG_MULTIPLIER).toFixed(2)
}

/**
 * Converts A1C value to estimated average glucose (mg/dL).
 */
export function estimateAvgGlucoseFromA1C(a1c: number): number {
  return Math.round(a1c * A1C_TO_EAG_MULTIPLIER - A1C_TO_EAG_CONSTANT)
}

/**
 * Converts A1C to Glycemia Management Indicator (GMI).
 */
export function a1cToGMI(a1c: number): number {
  return +(3.31 + 0.02392 * a1c).toFixed(2)
}

/**
 * Estimates A1C from average glucose.
 */
export function estimateA1CFromAverage(
  avgGlucose: number,
  unit: GlucoseUnit = 'mg/dL'
): number {
  const glucoseMgdl = unit === 'mmol/L' ? avgGlucose * 18 : avgGlucose
  return +((glucoseMgdl + 46.7) / 28.7).toFixed(2)
}

/**
 * Estimates the average glucose (eAG) from A1C using the ADA/ADAG standard formula.
 */
export function estimateEAG(a1c: number): number {
  if (typeof a1c !== 'number' || !Number.isFinite(a1c) || a1c <= 0) {
    throw new Error('A1C must be a positive, finite number')
  }
  const eAG = Number((28.7 * a1c - 46.7).toFixed(10))
  return Math.round(eAG)
}

/**
 * Estimate Glucose Management Indicator (GMI) from average glucose.
 */
export function estimateGMI(
  valueOrOptions: number | string | EstimateGMIOptions,
  unit?: GlucoseUnit
): number {
  const allowedUnits: GlucoseUnit[] = ['mg/dL', 'mmol/L']

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

  if (!allowedUnits.includes(resolvedUnit)) {
    throw new Error(`Unsupported glucose unit: ${resolvedUnit}`)
  }

  if (value <= 0 || !Number.isFinite(value)) {
    throw new Error('Glucose value must be a positive number.')
  }

  const gmi =
    resolvedUnit === 'mmol/L' ? 1.57 * value + 3.5 : 0.03 * value + 2.4

  return parseFloat(gmi.toFixed(1))
}

/**
 * Converts mg/dL to mmol/L.
 */
export function mgDlToMmolL(val: number): number {
  return +(val / 18).toFixed(1)
}

/**
 * Converts mmol/L to mg/dL.
 */
export function mmolLToMgDl(val: number): number {
  return Math.round(val * 18)
}

/**
 * Converts glucose value between mg/dL and mmol/L.
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
  if (!['mg/dL', 'mmol/L'].includes(unit)) throw new Error('Invalid unit')
  if (unit === 'mg/dL')
    return { value: +(value / 18.0182).toFixed(2), unit: 'mmol/L' }
  return { value: +(value * 18.0182).toFixed(0), unit: 'mg/dL' }
}
