type GlucoseUnit = 'mg/dL' | 'mmol/L'

/**
 * Estimates A1C from average glucose.
 * @param avgGlucose - Average glucose over a period (e.g. 30/60/90 days)
 * @param unit - Unit of measurement ('mg/dL' or 'mmol/L'), default is 'mg/dL'
 * @returns Estimated A1C percentage
 */
export function estimateA1CFromAverage(
  avgGlucose: number,
  unit: GlucoseUnit = 'mg/dL'
): number {
  const glucoseMgdl = unit === 'mmol/L' ? avgGlucose * 18 : avgGlucose
  return +((glucoseMgdl + 46.7) / 28.7).toFixed(2)
}
