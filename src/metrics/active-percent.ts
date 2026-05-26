/**
 * @file src/metrics/active-percent.ts
 *
 * Active Percent (CGM Wear Time).
 *
 * Active percent measures the proportion of expected CGM readings that
 * were actually captured during a time period. Clinical guidelines
 * recommend >= 70% active time for meaningful CGM analysis.
 *
 * Formula (Danne et al. 2017):
 *   active% = (actual_readings / expected_readings) * 100
 *   expected_readings = time_span / expected_interval
 *
 * @see https://doi.org/10.2337/dc17-1600  Danne et al. (2017)
 */

import type { GlucoseReading } from '../types'

/** Options for active percent calculation. */
export interface ActivePercentOptions {
  /** Expected interval between readings in minutes (default: 5 for CGM) */
  readonly expectedIntervalMinutes?: number
}

/** Result of the active percent calculation. */
export interface ActivePercentResult {
  /** Percentage of expected readings that were captured (0-100) */
  readonly activePercent: number
  /** Number of actual readings in the dataset */
  readonly actualReadings: number
  /** Number of expected readings based on time span and interval */
  readonly expectedReadings: number
  /** Total time span covered in minutes */
  readonly totalMinutes: number
  /** Whether the active percent meets the clinical minimum (>= 70%) */
  readonly meetsClinicalMinimum: boolean
}

/**
 * Calculates the CGM active percent (wear time).
 *
 * @param readings - Array of GlucoseReading objects with timestamps
 * @param options - Expected interval configuration
 * @returns Active percent result, or result with NaN if insufficient data
 * @see https://doi.org/10.2337/dc17-1600
 */
export function calculateActivePercent(
  readings: GlucoseReading[],
  options?: ActivePercentOptions
): ActivePercentResult {
  const intervalMin = options?.expectedIntervalMinutes ?? 5

  if (readings.length < 2) {
    return {
      activePercent: NaN,
      actualReadings: readings.length,
      expectedReadings: 0,
      totalMinutes: 0,
      meetsClinicalMinimum: false,
    }
  }

  const timestamps = readings
    .map((r) => new Date(r.timestamp).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b)

  if (timestamps.length < 2) {
    return {
      activePercent: NaN,
      actualReadings: timestamps.length,
      expectedReadings: 0,
      totalMinutes: 0,
      meetsClinicalMinimum: false,
    }
  }

  const spanMs = timestamps[timestamps.length - 1] - timestamps[0]
  const totalMinutes = spanMs / (1000 * 60)
  const expectedReadings = Math.floor(totalMinutes / intervalMin) + 1
  const actualReadings = timestamps.length

  /* c8 ignore start -- expectedReadings is always >= 1 when timestamps.length >= 2 */
  const activePercent =
    expectedReadings > 0
      ? Math.min(100, Math.round((actualReadings / expectedReadings) * 1000) / 10)
      : NaN
  /* c8 ignore stop */

  return {
    activePercent,
    actualReadings,
    expectedReadings,
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    meetsClinicalMinimum: Number.isFinite(activePercent) && activePercent >= 70,
  }
}
