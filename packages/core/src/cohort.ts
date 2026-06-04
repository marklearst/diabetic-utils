/**
 * @file src/cohort.ts
 *
 * Cohort / population aggregation — summarize per-patient glucose metrics across
 * many patients (the distribution of TIR, GMI, CV, and mean glucose over a
 * study population). Pure and dependency-free; a differentiator for research
 * workflows that no single-series metric can provide.
 */

import type { GlucoseReading, GlucoseUnit } from './types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'
import { calculateEnhancedTIR } from './tir-enhanced'
import { glucoseCoefficientOfVariation } from './variability'
import { estimateGMI } from './conversions'

/** Distribution of a metric across a cohort. */
export interface DistributionStats {
  readonly mean: number
  readonly median: number
  readonly min: number
  readonly max: number
  readonly p25: number
  readonly p75: number
}

/** Options for {@link aggregateCohort}. */
export interface CohortOptions {
  /** Unit for TIR validation (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
}

/** Result of {@link aggregateCohort}. */
export interface CohortResult {
  /** Number of patients with at least one valid reading. */
  readonly patientCount: number
  /** Distribution of in-range % across patients. */
  readonly tir: DistributionStats
  /** Distribution of GMI across patients. */
  readonly gmi: DistributionStats
  /** Distribution of CV% across patients. */
  readonly cv: DistributionStats
  /** Distribution of mean glucose (mg/dL) across patients. */
  readonly meanGlucose: DistributionStats
}

function round1(v: number): number {
  return Math.round(v * 10) / 10
}

function distribution(values: number[]): DistributionStats {
  const v = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (v.length === 0) {
    return { mean: NaN, median: NaN, min: NaN, max: NaN, p25: NaN, p75: NaN }
  }
  const mean = v.reduce((s, x) => s + x, 0) / v.length
  const pct = (p: number): number => v[Math.ceil((p / 100) * v.length) - 1]
  return {
    mean: round1(mean),
    median: round1(pct(50)),
    min: round1(v[0]),
    max: round1(v[v.length - 1]),
    p25: round1(pct(25)),
    p75: round1(pct(75)),
  }
}

/**
 * Aggregates per-patient glucose metrics across a cohort.
 *
 * @param patients - One reading array per patient
 * @param options - Unit for TIR validation
 * @returns Distributions of TIR, GMI, CV, and mean glucose across the cohort
 *
 * @example
 * ```ts
 * const cohort = aggregateCohort([patientA, patientB, patientC])
 * cohort.tir.median // 68.5 — median in-range % across the population
 * ```
 *
 * @category Cohort
 * @public
 */
export function aggregateCohort(
  patients: GlucoseReading[][],
  options?: CohortOptions
): CohortResult {
  const tirs: number[] = []
  const gmis: number[] = []
  const cvs: number[] = []
  const means: number[] = []
  let patientCount = 0

  for (const readings of patients) {
    const mgdl: number[] = []
    const clean: GlucoseReading[] = []
    for (const r of readings) {
      const v = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
      if (!Number.isFinite(v) || v <= 0 || v > 600) continue
      mgdl.push(v)
      clean.push(r)
    }
    if (clean.length === 0) continue

    patientCount++
    const mean = mgdl.reduce((s, v) => s + v, 0) / mgdl.length
    means.push(mean)
    gmis.push(estimateGMI(mean, MG_DL))
    cvs.push(glucoseCoefficientOfVariation(mgdl))
    tirs.push(calculateEnhancedTIR(clean, { unit: options?.unit }).inRange.percentage)
  }

  return {
    patientCount,
    tir: distribution(tirs),
    gmi: distribution(gmis),
    cv: distribution(cvs),
    meanGlucose: distribution(means),
  }
}
