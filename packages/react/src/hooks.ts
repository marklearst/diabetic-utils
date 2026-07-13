/**
 * @file src/hooks.ts
 *
 * Memoized React hooks over the @glucoseiq/core engine. Each hook is a thin
 * useMemo around the corresponding pure function — SSR-safe, no effects except
 * the opt-in live clock in useGlucoseLive.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  analyzeGlucose,
  buildAGPProfile,
  glucoseIQScore,
  analyzeMealResponse,
  computeGlucoseTrend,
  latestReading,
  minutesSinceLastReading,
  type GlucoseReading,
  type AnalyzeGlucoseOptions,
  type AnalyzeGlucoseResult,
  type AGPProfileOptions,
  type AGPProfileResult,
  type GlucoseIQOptions,
  type GlucoseIQScore,
  type MealResponseOptions,
  type MealResponseResult,
  type GlucoseTrendOptions,
  type GlucoseTrendResult,
} from '@glucoseiq/core'

/** Memoized one-call clinical report. */
export function useGlucoseAnalysis(
  readings: GlucoseReading[],
  options?: AnalyzeGlucoseOptions
): AnalyzeGlucoseResult {
  return useMemo(() => analyzeGlucose(readings, options), [readings, options])
}

/** Memoized AGP percentile-band series. */
export function useAGPProfile(
  readings: GlucoseReading[],
  options?: AGPProfileOptions
): AGPProfileResult {
  return useMemo(() => buildAGPProfile(readings, options), [readings, options])
}

/** Memoized Glucose IQ score. */
export function useGlucoseIQScore(
  readings: GlucoseReading[],
  options?: GlucoseIQOptions
): GlucoseIQScore {
  return useMemo(() => glucoseIQScore(readings, options), [readings, options])
}

/** Memoized meal-response analysis. */
export function useMealResponse(
  readings: GlucoseReading[],
  mealTime: string,
  options?: MealResponseOptions
): MealResponseResult {
  return useMemo(
    () => analyzeMealResponse(readings, mealTime, options),
    [readings, mealTime, options]
  )
}

/** Options for {@link useGlucoseLive}. */
export interface GlucoseLiveOptions extends GlucoseTrendOptions {
  /** Re-evaluate staleness every N ms (default: off). */
  readonly refreshMs?: number
}

/** Live view-model for a current-glucose surface. */
export interface GlucoseLive {
  /** Most recent reading, or null. */
  readonly latest: GlucoseReading | null
  /** Derived trend + rate of change. */
  readonly trend: GlucoseTrendResult
  /** Minutes since the last reading (staleness), or null. */
  readonly minutesSince: number | null
}

/**
 * Live current-glucose view-model: latest reading, derived trend, and
 * staleness. Pass `refreshMs` to re-evaluate staleness on an interval (the
 * trend arrow updates when `readings` changes).
 */
export function useGlucoseLive(
  readings: GlucoseReading[],
  options?: GlucoseLiveOptions
): GlucoseLive {
  const refreshMs = options?.refreshMs
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!refreshMs) return
    const id = setInterval(() => setTick((t) => t + 1), refreshMs)
    return () => clearInterval(id)
  }, [refreshMs])

  const latest = useMemo(() => latestReading(readings), [readings])
  const trend = useMemo(
    () => computeGlucoseTrend(readings, options),
    [readings, options]
  )
  // Intentionally NOT memoized on readings alone: recomputes each render,
  // which the refresh interval drives while the sensor is quiet.
  const minutesSince = minutesSinceLastReading(readings)

  return { latest, trend, minutesSince }
}
