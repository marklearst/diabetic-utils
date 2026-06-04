/**
 * @file src/score.ts
 *
 * "Glucose IQ" score — a single, screenshot-friendly 0–100 number derived from
 * the peer-reviewed Glycemia Risk Index (GRI): higher is better (100 − GRI).
 *
 * This is an explicitly configurable WELLNESS HEURISTIC for glanceable
 * feedback, built on a cited base (GRI). It is NOT a diagnostic and does not
 * constitute medical advice.
 *
 * Pure and dependency-free.
 *
 * @see https://doi.org/10.1177/19322968221085273  Klonoff et al. (2023) — GRI
 */

import type { GlucoseReading, GlucoseUnit } from './types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'
import { calculateEnhancedTIR } from './tir-enhanced'
import { calculateGRI, type GRIResult } from './metrics/gri'

/** Qualitative rating derived from the Glucose IQ score. */
export type GlucoseIQRating =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'needs attention'
  | 'insufficient'

/** Options for {@link glucoseIQScore}. */
export interface GlucoseIQOptions {
  /** Unit for TIR validation (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
}

/** Result of {@link glucoseIQScore}. */
export interface GlucoseIQScore {
  /** 0–100 score, higher is better (100 − GRI). */
  readonly score: number
  /** Underlying Glycemia Risk Index. */
  readonly gri: number
  /** GRI risk zone (A best … E worst), or null if not computable. */
  readonly zone: GRIResult['zone'] | null
  /** Qualitative rating. */
  readonly rating: GlucoseIQRating
  /** Whether the score could be computed. */
  readonly valid: boolean
}

/**
 * Computes the Glucose IQ score (100 − GRI) from glucose readings.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Unit for validation
 * @returns Score, underlying GRI, zone, and a qualitative rating
 *
 * @example
 * ```ts
 * glucoseIQScore(readings).score // 82  → 'good'
 * ```
 *
 * @category Score
 * @public
 */
export function glucoseIQScore(
  readings: GlucoseReading[],
  options?: GlucoseIQOptions
): GlucoseIQScore {
  const clean = readings.filter((r) => {
    if (!Number.isFinite(r.value) || r.value <= 0) return false
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (mgdl > 600) return false
    return !Number.isNaN(Date.parse(r.timestamp))
  })

  if (clean.length === 0) {
    return { score: NaN, gri: NaN, zone: null, rating: 'insufficient', valid: false }
  }

  const tir = calculateEnhancedTIR(clean, { unit: options?.unit })
  const gri = calculateGRI({
    veryLowPercent: tir.veryLow.percentage,
    lowPercent: tir.low.percentage,
    highPercent: tir.high.percentage,
    veryHighPercent: tir.veryHigh.percentage,
  })

  const score = Math.max(0, Math.min(100, Math.round(100 - gri.score)))
  const rating: GlucoseIQRating =
    score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'needs attention'

  return { score, gri: gri.score, zone: gri.zone, rating, valid: true }
}
