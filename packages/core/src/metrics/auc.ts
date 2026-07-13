/**
 * @file src/metrics/auc.ts
 *
 * Area-under-the-curve helpers for glucose time-series, including the
 * incremental AUC (iAUC) used to quantify meal / postprandial responses.
 *
 * iAUC follows the Wolever & Jenkins convention: only area *above* the baseline
 * is counted, and segments that cross the baseline contribute only the
 * above-baseline triangle. This is the definition used for glycemic-response
 * and glycemic-index work, and is the piece naive trapezoid implementations
 * get wrong.
 *
 * Pure and dependency-free.
 *
 * @see https://pubmed.ncbi.nlm.nih.gov/2379513/  Wolever & Jenkins (1986)
 */

import type { GlucoseReading, GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/** Options for AUC helpers. */
export interface AUCOptions {
  /** Output unit for values (default 'mg/dL'); area is expressed in this unit × minutes. */
  readonly unit?: GlucoseUnit
}

/**
 * Normalizes readings to `unit`, drops invalid points, and sorts by time.
 * @internal
 */
function timedPoints(
  readings: GlucoseReading[],
  unit: GlucoseUnit
): { t: number; v: number }[] {
  const points: { t: number; v: number }[] = []
  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    const v = unit === MG_DL ? mgdl : mgdl / MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(v) || v <= 0) continue
    const ms = Date.parse(r.timestamp)
    if (Number.isNaN(ms)) continue
    points.push({ t: ms / 60000, v })
  }
  points.sort((a, b) => a.t - b.t)
  return points
}

/**
 * Total area under the glucose-time curve (trapezoidal rule).
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Output unit
 * @returns Area in (unit × minutes), or NaN if fewer than two valid readings
 *
 * @example
 * ```ts
 * glucoseAUC(readings) // e.g. 18240 (mg/dL·min)
 * ```
 *
 * @category AUC
 * @public
 */
export function glucoseAUC(readings: GlucoseReading[], options?: AUCOptions): number {
  const unit = options?.unit ?? MG_DL
  const points = timedPoints(readings, unit)
  if (points.length < 2) return NaN

  let area = 0
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t
    area += ((points[i].v + points[i - 1].v) / 2) * dt
  }
  return area
}

/**
 * Incremental area under the curve above a baseline (Wolever iAUC).
 *
 * Only above-baseline area is counted; a segment crossing the baseline
 * contributes only its above-baseline triangle, and fully-below segments
 * contribute zero. For a meal response, pass the pre-meal value as `baseline`.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param baseline - Baseline value in the output unit (e.g. the pre-meal reading)
 * @param options - Output unit (must match the unit of `baseline`)
 * @returns Incremental area in (unit × minutes), or NaN if fewer than two valid readings
 *
 * @example
 * ```ts
 * incrementalAUC(readings, preMealValue) // e.g. 4120 (mg/dL·min above baseline)
 * ```
 *
 * @category AUC
 * @public
 */
export function incrementalAUC(
  readings: GlucoseReading[],
  baseline: number,
  options?: AUCOptions
): number {
  const unit = options?.unit ?? MG_DL
  const points = timedPoints(readings, unit)
  if (points.length < 2) return NaN

  let area = 0
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t
    const a = points[i - 1].v - baseline
    const b = points[i].v - baseline
    if (a >= 0 && b >= 0) {
      area += ((a + b) / 2) * dt
    } else if (a >= 0) {
      // Falling through baseline (b < 0 is guaranteed here): above-baseline triangle only.
      area += ((a * a) / (a - b) / 2) * dt
    } else if (b >= 0) {
      // Rising through baseline (a < 0 is guaranteed here): above-baseline triangle only.
      area += ((b * b) / (b - a) / 2) * dt
    }
    // Both below baseline: contributes nothing.
  }
  return area
}
