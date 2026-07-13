/**
 * @file src/metrics/meal.ts
 *
 * Meal / postprandial glucose-response analysis: baseline, peak, delta,
 * time-to-peak, return-to-baseline, and incremental AUC over a window after a
 * meal. This is the "what did that meal do to me?" primitive behind consumer
 * CGM meal cards (Levels, Nutrisense, Signos, Lingo).
 *
 * Pure and dependency-free.
 *
 * @see https://pubmed.ncbi.nlm.nih.gov/2379513/  Wolever & Jenkins (1986)
 */

import type { GlucoseReading, GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'
import { incrementalAUC } from './auc'

/** Default postprandial window (minutes). */
const DEFAULT_WINDOW_MIN = 120

/** Options for {@link analyzeMealResponse}. */
export interface MealResponseOptions {
  /** Minutes after the meal to analyze (default 120). */
  readonly windowMin?: number
  /** Output unit for values (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
}

/** Result of {@link analyzeMealResponse}. */
export interface MealResponseResult {
  /** Pre-meal baseline value (output unit). */
  readonly baseline: number
  /** Peak glucose value in the window (output unit). */
  readonly peakValue: number
  /** Peak minus baseline (output unit). */
  readonly delta: number
  /** Minutes from the meal to the peak. */
  readonly timeToPeakMin: number
  /** Minutes from the meal until glucose first returns to baseline after the peak, or null. */
  readonly returnToBaselineMin: number | null
  /** Incremental AUC above baseline (output unit × minutes). */
  readonly iAUC: number
  /** Window analyzed (minutes). */
  readonly windowMinutes: number
  /** Number of readings in the window. */
  readonly readingCount: number
  /** Whether a response could be computed. */
  readonly valid: boolean
}

/** Rounds to one decimal place. @internal */
function round1(v: number): number {
  return Math.round(v * 10) / 10
}

/**
 * Analyzes the glucose response to a meal.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param mealTime - ISO 8601 timestamp of the meal (t=0)
 * @param options - Window length and output unit
 * @returns Meal-response metrics; `valid: false` if the window has fewer than two readings
 *
 * @example
 * ```ts
 * const r = analyzeMealResponse(readings, '2024-01-01T12:30:00Z')
 * // { baseline: 98, peakValue: 162, delta: 64, timeToPeakMin: 45, ... }
 * ```
 *
 * @category Meal
 * @public
 */
export function analyzeMealResponse(
  readings: GlucoseReading[],
  mealTime: string,
  options?: MealResponseOptions
): MealResponseResult {
  const windowMinutes = options?.windowMin ?? DEFAULT_WINDOW_MIN
  const unit = options?.unit ?? MG_DL
  const invalid: MealResponseResult = {
    baseline: NaN,
    peakValue: NaN,
    delta: NaN,
    timeToPeakMin: NaN,
    returnToBaselineMin: null,
    iAUC: NaN,
    windowMinutes,
    readingCount: 0,
    valid: false,
  }

  const mealMs = Date.parse(mealTime)
  if (Number.isNaN(mealMs)) return invalid

  const items: { ms: number; v: number; reading: GlucoseReading }[] = []
  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    const v = unit === MG_DL ? mgdl : mgdl / MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(v) || v <= 0) continue
    const ms = Date.parse(r.timestamp)
    if (Number.isNaN(ms)) continue
    items.push({ ms, v, reading: r })
  }
  items.sort((a, b) => a.ms - b.ms)

  const windowEnd = mealMs + windowMinutes * 60000
  const windowItems = items.filter((i) => i.ms >= mealMs && i.ms <= windowEnd)
  if (windowItems.length < 2) return { ...invalid, readingCount: windowItems.length }

  const preMeal = items.filter((i) => i.ms <= mealMs)
  const baseline =
    preMeal.length > 0 ? preMeal[preMeal.length - 1].v : windowItems[0].v

  let peak = windowItems[0]
  for (const it of windowItems) {
    if (it.v > peak.v) peak = it
  }

  let returnToBaselineMin: number | null = null
  for (const it of windowItems) {
    if (it.ms > peak.ms && it.v <= baseline) {
      returnToBaselineMin = (it.ms - mealMs) / 60000
      break
    }
  }

  const iAUC = incrementalAUC(
    windowItems.map((i) => i.reading),
    baseline,
    { unit }
  )

  return {
    baseline: round1(baseline),
    peakValue: round1(peak.v),
    delta: round1(peak.v - baseline),
    timeToPeakMin: (peak.ms - mealMs) / 60000,
    returnToBaselineMin,
    iAUC: round1(iAUC),
    windowMinutes,
    readingCount: windowItems.length,
    valid: true,
  }
}
