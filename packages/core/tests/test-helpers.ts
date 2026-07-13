// @file tests/test-helpers.ts

import type { GlucoseReading, GlucoseUnit } from '../src/types'
import { MG_DL } from '../src/constants'

/**
 * Base timestamp for test data generation.
 * All test timestamps are derived from this value.
 */
export const TEST_TIMESTAMP_BASE = new Date(2024, 0, 1, 8, 0)

/**
 * Time unit constants for test data generation.
 */
export const MINUTE_IN_MS = 60 * 1000
export const HOUR_IN_MS = 60 * MINUTE_IN_MS
export const DAY_IN_MS = 24 * HOUR_IN_MS

/**
 * Common glucose test values for consistent testing across modules.
 */
export const COMMON_TEST_VALUES = {
  /** Normal glucose value in mg/dL */
  NORMAL_GLUCOSE_MGDL: 100,
  /** Normal glucose value in mmol/L */
  NORMAL_GLUCOSE_MMOLL: 5.5,
  /** Hypoglycemic value in mg/dL */
  HYPO_GLUCOSE_MGDL: 60,
  /** Hypoglycemic value in mmol/L */
  HYPO_GLUCOSE_MMOLL: 3.3,
  /** Hyperglycemic value in mg/dL */
  HYPER_GLUCOSE_MGDL: 200,
  /** Hyperglycemic value in mmol/L */
  HYPER_GLUCOSE_MMOLL: 11.1,
  /** Very low glucose (Level 2 hypoglycemia) in mg/dL */
  VERY_LOW_GLUCOSE_MGDL: 50,
  /** Very high glucose (Level 2 hyperglycemia) in mg/dL */
  VERY_HIGH_GLUCOSE_MGDL: 300,
} as const

/**
 * Creates an array of glucose readings for testing.
 *
 * @param values - Array of glucose values
 * @param unit - Glucose unit (default: 'mg/dL')
 * @param intervalMinutes - Interval between readings in minutes (default: 5)
 * @returns Array of glucose readings with sequential timestamps
 *
 * @example
 * ```typescript
 * const readings = createGlucoseReadings([100, 110, 120], 'mg/dL', 5)
 * // Creates 3 readings at 5-minute intervals
 * ```
 */
export function createGlucoseReadings(
  values: number[],
  unit: GlucoseUnit = MG_DL,
  intervalMinutes = 5
): GlucoseReading[] {
  return values.map((value, index) => ({
    value,
    unit,
    timestamp: new Date(
      TEST_TIMESTAMP_BASE.getTime() + index * intervalMinutes * MINUTE_IN_MS
    ).toISOString(),
  }))
}
