import { parseGlucoseString } from '@src/utils/parseGlucoseString'
import { isEstimateGMIOptions } from '@src/utils/guards/isEstimateGMIOptions'
import type { EstimateGMIOptions, GlucoseUnit } from '@src/a1c/types'

/**
 * Estimate Glucose Management Indicator (GMI) from average glucose.
 *
 * GMI provides an estimated A1C-like percentage based on average glucose (from CGM data).
 * It is useful for observing trends but is not a clinical A1C replacement.
 *
 * @see https://diatribe.org/diabetes-technology/using-gmi-estimate-your-a1c-how-accurate-it
 *
 * @param valueOrOptions - Glucose input as:
 *   - number with unit
 *   - string in format "100 mg/dL" or "5.5 mmol/L"
 *   - object: { value, unit }
 * @param unit - Required if first param is number. Must be 'mg/dL' or 'mmol/L'.
 * @returns Estimated GMI as a number (e.g. 5.4)
 *
 * @example
 * estimateGMI(100, 'mg/dL') // 5.4
 * estimateGMI('5.5 mmol/L') // ~12.1
 * estimateGMI({ value: 100, unit: 'mg/dL' }) // 5.4
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
