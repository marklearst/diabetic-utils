/**
 * @file src/metrics/m-value.ts
 *
 * Schlichtkrull M-value — a classic index of glycemic control and variability,
 * weighting deviations from an ideal reference glucose (default 120 mg/dL) with
 * a cubic term that penalizes hypoglycemia more steeply.
 *
 *   M*_i = |10 · log10(x_i / index)|^3         (the factor 10 is INSIDE the cube)
 *   M    = mean(M*_i)  [+ W]     where W = (max − min) / 20
 *
 * The W amplitude correction is part of the original 1965 definition (default
 * on); the "EasyGV"/CGM variant omits it.
 *
 * Pure and dependency-free. Values are computed in mg/dL.
 *
 * @see https://pubmed.ncbi.nlm.nih.gov/14163158/  Schlichtkrull et al. (1965)
 */

import type { GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/** Options for {@link glucoseMValue}. */
export interface MValueOptions {
  /** Unit of the input values (default 'mg/dL'); 'mmol/L' is converted to mg/dL. */
  readonly unit?: GlucoseUnit
  /** Ideal reference glucose in mg/dL (default 120). */
  readonly index?: number
  /** Add the W = range/20 correction term (default true, per the 1965 manuscript). */
  readonly includeCorrection?: boolean
}

/**
 * Calculates the Schlichtkrull M-value for a glucose series.
 *
 * @param readings - Glucose values (mg/dL by default)
 * @param options - Unit, reference index, and whether to add the W correction
 * @returns The M-value, or NaN if there are no valid (finite, > 0) readings
 * @see https://pubmed.ncbi.nlm.nih.gov/14163158/
 * @category Variability
 * @public
 */
export function glucoseMValue(readings: number[], options?: MValueOptions): number {
  const unit = options?.unit ?? MG_DL
  const index = options?.index ?? 120
  const includeCorrection = options?.includeCorrection ?? true

  const mgdl = (
    unit === MG_DL ? readings : readings.map((v) => v * MGDL_MMOLL_CONVERSION)
  ).filter((v) => Number.isFinite(v) && v > 0)
  if (mgdl.length === 0) return NaN

  let sum = 0
  for (const x of mgdl) {
    sum += Math.abs(10 * Math.log10(x / index)) ** 3
  }
  let m = sum / mgdl.length

  if (includeCorrection) {
    let min = mgdl[0]
    let max = mgdl[0]
    for (const v of mgdl) {
      if (v < min) min = v
      if (v > max) max = v
    }
    m += (max - min) / 20
  }

  return Math.round(m * 100) / 100
}
