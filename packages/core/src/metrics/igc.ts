/**
 * @file src/metrics/igc.ts
 *
 * Rodbard's Hypoglycemia Index, Hyperglycemia Index, and Index of Glycemic
 * Control (IGC). Each out-of-range reading contributes a power of its distance
 * from the target limit, divided by a scale factor and the TOTAL number of
 * valid readings (in-range readings count toward n but contribute 0). The
 * hypo exponent (2.0) is steeper than the hyper exponent (1.1), penalizing
 * hypoglycemia more.
 *
 *   HypoIdx  = (1 / (n·d)) · Σ_{G < LLTR} (LLTR − G)^b     (LLTR 80, b 2.0, d 30)
 *   HyperIdx = (1 / (n·c)) · Σ_{G > ULTR} (G − ULTR)^a     (ULTR 140, a 1.1, c 30)
 *   IGC      = HypoIdx + HyperIdx
 *
 * Pure and dependency-free. Values are computed in mg/dL.
 *
 * @see https://doi.org/10.1089/dia.2008.0132  Rodbard (2009) + erratum (PMC5910039)
 */

import type { GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/** Options for {@link calculateIGC}. All thresholds are in mg/dL. */
export interface IGCOptions {
  /** Unit of the input values (default 'mg/dL'); 'mmol/L' is converted to mg/dL. */
  readonly unit?: GlucoseUnit
  /** Lower limit of target range (default 80). */
  readonly lltr?: number
  /** Upper limit of target range (default 140). */
  readonly ultr?: number
  /** Hypoglycemia exponent b (default 2.0). */
  readonly hypoExponent?: number
  /** Hyperglycemia exponent a (default 1.1). */
  readonly hyperExponent?: number
  /** Hypoglycemia scale factor d (default 30). */
  readonly hypoScale?: number
  /** Hyperglycemia scale factor c (default 30). */
  readonly hyperScale?: number
}

/** Result of {@link calculateIGC}. */
export interface IGCResult {
  readonly hypoIndex: number
  readonly hyperIndex: number
  readonly igc: number
}

/**
 * Calculates Rodbard's hypo/hyper indices and IGC.
 *
 * @param readings - Glucose values (mg/dL by default)
 * @param options - Unit, target limits, exponents, and scale factors
 * @returns Hypo index, hyper index, and their sum (IGC); NaN fields if no valid readings
 * @see https://doi.org/10.1089/dia.2008.0132
 * @category Variability
 * @public
 */
export function calculateIGC(readings: number[], options?: IGCOptions): IGCResult {
  const unit = options?.unit ?? MG_DL
  const lltr = options?.lltr ?? 80
  const ultr = options?.ultr ?? 140
  const b = options?.hypoExponent ?? 2.0
  const a = options?.hyperExponent ?? 1.1
  const d = options?.hypoScale ?? 30
  const c = options?.hyperScale ?? 30

  const mgdl = (
    unit === MG_DL ? readings : readings.map((v) => v * MGDL_MMOLL_CONVERSION)
  ).filter((v) => Number.isFinite(v) && v > 0)
  const n = mgdl.length
  if (n === 0) return { hypoIndex: NaN, hyperIndex: NaN, igc: NaN }

  let hypoSum = 0
  let hyperSum = 0
  for (const g of mgdl) {
    if (g < lltr) hypoSum += (lltr - g) ** b
    else if (g > ultr) hyperSum += (g - ultr) ** a
  }

  const hypoIndex = hypoSum / (n * d)
  const hyperIndex = hyperSum / (n * c)
  const round4 = (x: number): number => Math.round(x * 10000) / 10000

  return {
    hypoIndex: round4(hypoIndex),
    hyperIndex: round4(hyperIndex),
    igc: round4(hypoIndex + hyperIndex),
  }
}
