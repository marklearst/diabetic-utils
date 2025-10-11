// @file src/tir.ts

import {
  AdvancedTIRResult,
  GlucoseReading,
  TIRResult,
} from './types'
import { MGDL_MMOLL_CONVERSION, MMOL_L } from './constants'

export const DEFAULT_TYPE2_TIR_THRESHOLDS_MGDL = {
  veryLowMax: 54,
  lowMax: 70,
  inRangeMax: 180,
  highMax: 250,
} as const

export type Type2AdvancedTIRThresholds = typeof DEFAULT_TYPE2_TIR_THRESHOLDS_MGDL

/**
 * Options for {@link calculateType2AdvancedTIR}.
 */
export interface Type2AdvancedTIROptions {
  /**
   * Custom thresholds expressed in mg/dL to override ADA defaults.
   * Values must remain ordered: veryLowMax < lowMax ≤ inRangeMax < highMax.
   */
  thresholdsMgDl?: Partial<Type2AdvancedTIRThresholds>
  /** Number of decimal places to round percentages to. Defaults to 1. */
  precision?: number
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

function resolveType2Thresholds(
  overrides: Partial<Type2AdvancedTIRThresholds> = {}
): Type2AdvancedTIRThresholds {
  const thresholds = {
    ...DEFAULT_TYPE2_TIR_THRESHOLDS_MGDL,
    ...overrides,
  }

  if (
    !(
      thresholds.veryLowMax < thresholds.lowMax &&
      thresholds.lowMax <= thresholds.inRangeMax &&
      thresholds.inRangeMax < thresholds.highMax
    )
  ) {
    throw new Error(
      'Type 2 TIR thresholds must satisfy veryLow < low ≤ inRange < high'
    )
  }

  return thresholds
}

function toMgDl(reading: GlucoseReading): number {
  return reading.unit === MMOL_L
    ? reading.value * MGDL_MMOLL_CONVERSION
    : reading.value
}

function toPercentage(count: number, total: number, precision: number): number {
  if (total === 0) return 0
  return +((count / total) * 100).toFixed(precision)
}

/**
 * Calculates the ADA advanced Time-in-Range breakdown for people with type 2 diabetes.
 * Returns percentages in the five consensus glucose bands (very low, low, in range,
 * high, very high). Internally normalizes readings to mg/dL so mixed-unit datasets
 * are handled transparently.
 * @param readings - Array of glucose readings with timestamps and units
 * @param options - Optional overrides for thresholds (mg/dL) and precision
 * @returns {@link AdvancedTIRResult} representing the percentage in each band
 * @see https://care.diabetesjournals.org/content/44/1/17
 */
export function calculateType2AdvancedTIR(
  readings: GlucoseReading[],
  options: Type2AdvancedTIROptions = {}
): AdvancedTIRResult {
  const { thresholdsMgDl, precision = 1 } = options
  const thresholds = resolveType2Thresholds(thresholdsMgDl)

  if (readings.length === 0) {
    return {
      veryLow: 0,
      low: 0,
      inRange: 0,
      high: 0,
      veryHigh: 0,
    }
  }

  let veryLow = 0
  let low = 0
  let inRange = 0
  let high = 0
  let veryHigh = 0

  for (const reading of readings) {
    const valueMgDl = toMgDl(reading)

    if (valueMgDl < thresholds.veryLowMax) {
      veryLow++
    } else if (valueMgDl < thresholds.lowMax) {
      low++
    } else if (valueMgDl <= thresholds.inRangeMax) {
      inRange++
    } else if (valueMgDl <= thresholds.highMax) {
      high++
    } else {
      veryHigh++
    }
  }

  const total = readings.length

  return {
    veryLow: toPercentage(veryLow, total, precision),
    low: toPercentage(low, total, precision),
    inRange: toPercentage(inRange, total, precision),
    high: toPercentage(high, total, precision),
    veryHigh: toPercentage(veryHigh, total, precision),
  }
}
