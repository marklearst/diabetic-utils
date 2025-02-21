/**
 * Estimate Glucose Management Indicator (GMI) from average glucose.
 *
 * GMI is calculated from CGM data and provides an estimated A1C-like percentage.
 * It is not a replacement for lab-tested A1C, but offers a useful projection.
 *
 * @see https://diatribe.org/diabetes-technology/using-gmi-estimate-your-a1c-how-accurate-it
 *
 * @param valueOrOptions - Glucose value as a number, string (e.g. "100 mg/dL"), or object { value, unit }
 * @param unit - Unit of the glucose value, either 'mg/dL' or 'mmol/L' (required if first param is a number)
 * @returns Estimated GMI percentage as a number (e.g. 5.4)
 *
 * @example
 * estimateGMI(100, 'mg/dL');   // 5.4
 * estimateGMI('5.5 mmol/L');   // ~12.1
 * estimateGMI({ value: 100, unit: 'mg/dL' }); // 5.4
 */
export type GlucoseUnit = 'mg/dL' | 'mmol/L'
export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}

export function estimateGMI(
  valueOrOptions: number | string | EstimateGMIOptions,
  unit?: GlucoseUnit
): number {
  let value: number
  let resolvedUnit: GlucoseUnit

  if (typeof valueOrOptions === 'object') {
    value = valueOrOptions.value
    resolvedUnit = valueOrOptions.unit
  } else if (typeof valueOrOptions === 'string') {
    const match = valueOrOptions.match(/^([\d.]+)\s*(mg\/dL|mmol\/L)$/i)
    if (!match)
      throw new Error(
        'Invalid glucose string format. Use e.g. "100 mg/dL" or "5.5 mmol/L"'
      )
    value = parseFloat(match[1])
    resolvedUnit = match[2] as GlucoseUnit
  } else {
    if (!unit) throw new Error('Unit must be provided if input is a number')
    value = valueOrOptions
    resolvedUnit = unit
  }

  if (value <= 0 || !Number.isFinite(value)) {
    throw new Error('Glucose value must be a positive number')
  }

  const gmi =
    resolvedUnit === 'mmol/L' ? 1.57 * value + 3.5 : 0.03 * value + 2.4

  return parseFloat(gmi.toFixed(1))
}
