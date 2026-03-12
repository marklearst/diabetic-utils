/**
 * @file src/metrics/gri.ts
 *
 * Glycemia Risk Index (GRI).
 *
 * The GRI is a composite CGM metric that captures both hypo- and
 * hyperglycemia risk in a single 0-100 score. It is derived from four
 * TIR zone percentages using the formula from Klonoff et al. (2023).
 *
 * Formula:
 *   GRI = (3.0 * VLow) + (2.4 * Low) + (1.6 * VHigh) + (0.8 * High)
 *   clamped to [0, 100]
 *
 * Where:
 *   VLow  = % time < 54 mg/dL  (TBR Level 2)
 *   Low   = % time 54-69 mg/dL (TBR Level 1)
 *   VHigh = % time > 250 mg/dL (TAR Level 2)
 *   High  = % time 181-250 mg/dL (TAR Level 1)
 *
 * Risk zones:
 *   A (lowest risk): GRI <= 20
 *   B: 20 < GRI <= 40
 *   C: 40 < GRI <= 60
 *   D: 60 < GRI <= 80
 *   E (highest risk): GRI > 80
 *
 * @see https://doi.org/10.1177/19322968221085273  Klonoff et al. (2023)
 */

/** Input percentages for GRI calculation. */
export interface GRIInput {
  /** % time < 54 mg/dL */
  readonly veryLowPercent: number
  /** % time 54-69 mg/dL */
  readonly lowPercent: number
  /** % time 181-250 mg/dL */
  readonly highPercent: number
  /** % time > 250 mg/dL */
  readonly veryHighPercent: number
}

/** GRI result with numeric score and risk zone. */
export interface GRIResult {
  readonly score: number
  readonly zone: 'A' | 'B' | 'C' | 'D' | 'E'
  readonly hypoComponent: number
  readonly hyperComponent: number
}

/**
 * Calculates the Glycemia Risk Index (GRI) from TIR zone percentages.
 *
 * @param input - Percentages for each out-of-range zone
 * @returns GRI result with composite score and risk zone
 * @see https://doi.org/10.1177/19322968221085273
 */
export function calculateGRI(input: GRIInput): GRIResult {
  const hypoComponent = 3.0 * input.veryLowPercent + 2.4 * input.lowPercent
  const hyperComponent = 1.6 * input.veryHighPercent + 0.8 * input.highPercent
  const raw = hypoComponent + hyperComponent
  const score = Math.min(100, Math.max(0, Math.round(raw * 10) / 10))

  let zone: GRIResult['zone']
  if (score <= 20) zone = 'A'
  else if (score <= 40) zone = 'B'
  else if (score <= 60) zone = 'C'
  else if (score <= 80) zone = 'D'
  else zone = 'E'

  return {
    score,
    zone,
    hypoComponent: Math.round(hypoComponent * 10) / 10,
    hyperComponent: Math.round(hyperComponent * 10) / 10,
  }
}
