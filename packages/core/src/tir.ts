// @file src/tir.ts

import { GlucoseReading, TIRResult } from './types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'

/** Options for {@link calculateTITR}. Thresholds are in mg/dL. */
export interface TITROptions {
  /** Lower bound of the tight range (mg/dL, inclusive). Default 70. */
  readonly lowThreshold?: number
  /** Upper bound of the tight range (mg/dL, inclusive). Default 140. */
  readonly highThreshold?: number
  /** Target percentage of readings in the tight range. Default 50. */
  readonly target?: number
}

/** Result of {@link calculateTITR}. */
export interface TITRResult {
  /** Percentage of readings within the tight range (0-100). */
  readonly inRange: number
  /** Percentage of readings below the tight range. */
  readonly belowRange: number
  /** Percentage of readings above the tight range. */
  readonly aboveRange: number
  /** Whether inRange meets the target. */
  readonly meetsTarget: boolean
  /** Target percentage used. */
  readonly target: number
  /** Number of readings analyzed. */
  readonly readingCount: number
}

/**
 * Calculates Time in Tight Range (TITR), the percentage of readings within a
 * tighter 70-140 mg/dL band than standard TIR (70-180). Emerging consensus
 * target is >50%.
 *
 * Unlike {@link calculateTIR}, input readings are normalized to mg/dL first,
 * so mixed-unit series are handled correctly. Thresholds are always mg/dL.
 *
 * @param readings - Glucose readings to analyze
 * @param options - Optional thresholds and target
 * @returns Tight-range breakdown with target assessment
 *
 * @example
 * ```ts
 * calculateTITR(readings).inRange // e.g. 58.3
 * ```
 *
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 * @category Time in Range
 * @public
 */
export function calculateTITR(
  readings: GlucoseReading[],
  options?: TITROptions
): TITRResult {
  const lowThreshold = options?.lowThreshold ?? 70
  const highThreshold = options?.highThreshold ?? 140
  const target = options?.target ?? 50

  if (readings.length === 0) {
    return {
      inRange: 0,
      belowRange: 0,
      aboveRange: 0,
      meetsTarget: false,
      target,
      readingCount: 0,
    }
  }

  let inRange = 0
  let belowRange = 0
  let aboveRange = 0

  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (mgdl < lowThreshold) belowRange++
    else if (mgdl > highThreshold) aboveRange++
    else inRange++
  }

  const total = readings.length
  const inRangePct = +((inRange / total) * 100).toFixed(1)

  return {
    inRange: inRangePct,
    belowRange: +((belowRange / total) * 100).toFixed(1),
    aboveRange: +((aboveRange / total) * 100).toFixed(1),
    meetsTarget: inRangePct >= target,
    target,
    readingCount: total,
  }
}

/**
 * Calculates clinical Time in Range (TIR) metrics for glucose readings.
 * Returns the percentage of readings in, below, and above the specified clinical target range.
 * @param readings - Array of glucose readings to analyze
 * @param target - Object specifying the target range ({ min, max })
 * @returns Object with in-range, below-range, and above-range percentages
 * @see https://care.diabetesjournals.org/content/42/8/1593
 */
export function calculateTIR(
  readings: GlucoseReading[],
  target: { min: number; max: number }
): TIRResult {
  if (readings.length === 0) {
    return {
      inRange: 0.0,
      belowRange: 0.0,
      aboveRange: 0.0,
    }
  }

  let inRange = 0
  let belowRange = 0
  let aboveRange = 0

  for (const r of readings) {
    if (r.value < target.min) belowRange++
    else if (r.value > target.max) aboveRange++
    else inRange++
  }

  const total = readings.length
  return {
    inRange: +((inRange / total) * 100).toFixed(1),
    belowRange: +((belowRange / total) * 100).toFixed(1),
    aboveRange: +((aboveRange / total) * 100).toFixed(1),
  }
}

/**
 * Generates a clinical summary string from a TIRResult object.
 * Used for reporting and visualization of TIR analytics.
 * @param result - TIR result breakdown to summarize
 * @returns String summarizing in-range, below-range, and above-range percentages (e.g., 'In Range: 70%, Below: 10%, Above: 20%')
 */
export function getTIRSummary(result: TIRResult): string {
  return `In Range: ${result.inRange}%, Below: ${result.belowRange}%, Above: ${result.aboveRange}%`
}

/**
 * Groups glucose readings by date (YYYY-MM-DD).
 * @param readings - Array of glucose readings to group.
 * @returns An object mapping each date string to an array of readings for that day.
 */
export function groupByDay(
  readings: GlucoseReading[]
): Record<string, GlucoseReading[]> {
  return readings.reduce((acc, reading) => {
    const day = reading.timestamp.split('T')[0]
    acc[day] = acc[day] || []
    acc[day].push(reading)
    return acc
  }, {} as Record<string, GlucoseReading[]>)
}

/**
 * Calculates the percentage of glucose readings within a specified numeric range.
 * Used for clinical TIR analytics and custom range assessments.
 * @param readings - Array of glucose values (numbers) to analyze
 * @param lower - Lower bound of the target range (inclusive)
 * @param upper - Upper bound of the target range (inclusive)
 * @returns Percentage of readings within the specified range (0-100)
 */
export function calculateTimeInRange(
  readings: number[],
  lower: number,
  upper: number
): number {
  if (readings.length === 0) {
    return 0
  }

  const inRange = readings.filter((r) => r >= lower && r <= upper).length
  return (inRange / readings.length) * 100
}
