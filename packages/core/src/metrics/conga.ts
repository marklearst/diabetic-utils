/**
 * @file src/metrics/conga.ts
 *
 * Continuous Overall Net Glycemic Action (CONGA).
 *
 * CONGA(n) measures intra-day glucose variability by computing the standard
 * deviation of the differences between glucose values separated by n hours.
 *
 * Formula (McDonnell et al. 2005):
 *   D_t = G(t) - G(t - n_hours)
 *   CONGA(n) = SD(D_t) over all valid pairs
 *
 * Pairs are matched by finding the closest reading within a tolerance
 * window of the target time offset.
 *
 * @see https://doi.org/10.1089/dia.2005.7.253  McDonnell et al. (2005)
 */

import type { GlucoseReading } from '../types'
import { MGDL_MMOLL_CONVERSION, MG_DL } from '../constants'

/** Options for CONGA calculation. */
export interface CONGAOptions {
  /** Number of hours for the time lag (default: 1) */
  readonly hours?: number
  /** Tolerance window in minutes for matching readings (default: 15) */
  readonly toleranceMinutes?: number
}

/**
 * Calculates CONGA (Continuous Overall Net Glycemic Action).
 *
 * @param readings - Array of GlucoseReading objects with timestamps
 * @param options - Time lag (hours) and tolerance configuration
 * @returns CONGA value in mg/dL, or NaN if insufficient matched pairs
 * @see https://doi.org/10.1089/dia.2005.7.253
 */
export function calculateCONGA(
  readings: GlucoseReading[],
  options?: CONGAOptions
): number {
  if (readings.length < 2) return NaN

  const hours = options?.hours ?? 1
  const toleranceMs = (options?.toleranceMinutes ?? 15) * 60 * 1000
  const lagMs = hours * 60 * 60 * 1000

  const sorted = readings
    .map((r) => ({
      time: new Date(r.timestamp).getTime(),
      value: r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION,
    }))
    .filter((r) => Number.isFinite(r.time) && Number.isFinite(r.value) && r.value > 0)
    .sort((a, b) => a.time - b.time)

  if (sorted.length < 2) return NaN

  const differences: number[] = []

  for (let i = 0; i < sorted.length; i++) {
    const targetTime = sorted[i].time - lagMs
    if (targetTime < sorted[0].time) continue

    let bestIdx = -1
    let bestDist = Infinity
    let lo = 0
    let hi = i - 1

    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const dist = Math.abs(sorted[mid].time - targetTime)
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = mid
      }
      if (sorted[mid].time < targetTime) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    if (bestIdx !== -1 && bestDist <= toleranceMs) {
      differences.push(sorted[i].value - sorted[bestIdx].value)
    }
  }

  if (differences.length < 2) return NaN

  const mean = differences.reduce((s, d) => s + d, 0) / differences.length
  const variance =
    differences.reduce((s, d) => s + (d - mean) ** 2, 0) /
    (differences.length - 1)

  return Math.round(Math.sqrt(variance) * 10) / 10
}
