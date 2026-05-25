/**
 * @file src/metrics/modd.ts
 *
 * Mean of Daily Differences (MODD).
 *
 * MODD quantifies day-to-day glucose variability by comparing glucose values
 * at matching times on consecutive days. It measures how consistently glucose
 * behaves across days — lower values indicate more predictable patterns.
 *
 * Formula (Service & Nelson, 1980):
 *   MODD = mean(|G(t) - G(t - 24h)|) for all t where both values exist
 *
 * Readings are matched across days by finding the closest timestamp within
 * a configurable tolerance window (default: 15 minutes).
 *
 * @see https://doi.org/10.2337/diacare.3.1.58  Service & Nelson (1980)
 */

import type { GlucoseReading } from '../types'
import { MGDL_MMOLL_CONVERSION, MG_DL } from '../constants'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DEFAULT_TOLERANCE_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Options for MODD calculation.
 */
export interface MODDOptions {
  /** Tolerance window in minutes for matching readings across days (default: 15) */
  readonly toleranceMinutes?: number
}

/**
 * Calculates Mean of Daily Differences (MODD).
 *
 * @param readings - Array of GlucoseReading objects with timestamps
 * @param options - Optional tolerance configuration
 * @returns MODD value in mg/dL, or NaN if insufficient matched pairs
 * @see https://doi.org/10.2337/diacare.3.1.58
 */
export function calculateMODD(
  readings: GlucoseReading[],
  options?: MODDOptions
): number {
  if (readings.length < 2) return NaN

  const toleranceMs =
    options?.toleranceMinutes !== undefined
      ? options.toleranceMinutes * 60 * 1000
      : DEFAULT_TOLERANCE_MS

  // Convert to timestamped mg/dL values and sort chronologically
  const sorted = readings
    .map((r) => ({
      time: new Date(r.timestamp).getTime(),
      value: r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION,
    }))
    .filter(
      (r) =>
        Number.isFinite(r.time) && Number.isFinite(r.value) && r.value > 0
    )
    .sort((a, b) => a.time - b.time)

  if (sorted.length < 2) return NaN

  const differences: number[] = []

  for (let i = 0; i < sorted.length; i++) {
    const targetTime = sorted[i].time + MS_PER_DAY

    // Binary search for closest reading ~24h later
    let lo = i + 1
    let hi = sorted.length - 1
    let bestIdx = -1
    let bestDist = Infinity

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
      differences.push(Math.abs(sorted[bestIdx].value - sorted[i].value))
    }
  }

  if (differences.length === 0) return NaN

  return (
    Math.round(
      (differences.reduce((s, d) => s + d, 0) / differences.length) * 10
    ) / 10
  )
}
