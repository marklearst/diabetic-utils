/**
 * @file src/live.ts
 *
 * Live / real-time glucose helpers: rate-of-change, trend derivation, and
 * latest-reading / staleness utilities for CGM home screens, dashboards, and
 * watch complications.
 *
 * All functions here are *descriptive of past readings* — rate-of-change is
 * computed from observed values, not projected forward. Short-horizon
 * forecasting is intentionally kept out of the zero-dep core (see the
 * @glucoseiq/forecast sibling) to avoid implying a predictive medical-device
 * function.
 *
 * @see {@link https://www.dexcom.com | Dexcom trend-arrow rate thresholds}
 */

import type { GlucoseReading } from './types'
import type { CGMTrend } from './connectors/types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'

/** Default trailing window for rate-of-change (minutes). */
const DEFAULT_WINDOW_MIN = 15

/** Options for {@link computeGlucoseTrend}. */
export interface GlucoseTrendOptions {
  /** Trailing window in minutes over which rate-of-change is fit (default 15). */
  readonly windowMin?: number
}

/** Result of {@link computeGlucoseTrend}. */
export interface GlucoseTrendResult {
  /** Rate-of-change in mg/dL per minute (NaN when not computable). */
  readonly rocPerMin: number
  /** Derived CGM trend (or 'unknown' when not computable). */
  readonly trend: CGMTrend
  /** Trailing window used (minutes). */
  readonly windowMinutes: number
  /** Number of readings used in the fit. */
  readonly readingsUsed: number
}

/** Normalizes a reading to mg/dL. @internal */
function toMgdl(reading: GlucoseReading): number {
  return reading.unit === MG_DL
    ? reading.value
    : reading.value * MGDL_MMOLL_CONVERSION
}

/** Parses a timestamp-ish value to epoch ms (NaN if invalid). @internal */
function parseMs(value: string | number | Date): number {
  return new Date(value).getTime()
}

/**
 * Classifies a rate-of-change (mg/dL per minute) into a CGM trend using
 * Dexcom-style thresholds: <1 flat, 1–2 slight, 2–3 single, ≥3 rapid.
 *
 * @param rocPerMin - Rate of change in mg/dL per minute
 * @returns The corresponding {@link CGMTrend}
 * @category Live
 * @public
 */
export function classifyGlucoseTrend(rocPerMin: number): CGMTrend {
  const magnitude = Math.abs(rocPerMin)
  if (magnitude < 1) return 'flat'
  const rising = rocPerMin > 0
  if (magnitude >= 3) return rising ? 'rapidRising' : 'rapidFalling'
  if (magnitude >= 2) return rising ? 'rising' : 'falling'
  return rising ? 'slightlyRising' : 'slightlyFalling'
}

/**
 * Computes glucose rate-of-change and derives a trend from recent readings.
 *
 * Fits a least-squares slope over readings in the trailing window, normalizing
 * mixed units to mg/dL. Useful for feeding a live trend arrow, and for
 * back-filling a trend when a feed (e.g. Nightscout) does not provide one.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Trailing window configuration
 * @returns Rate-of-change (mg/dL/min) and derived trend
 *
 * @example
 * ```ts
 * const { rocPerMin, trend } = computeGlucoseTrend(readings)
 * // rocPerMin: 2.1, trend: 'rising'
 * ```
 *
 * @category Live
 * @public
 */
export function computeGlucoseTrend(
  readings: GlucoseReading[],
  options?: GlucoseTrendOptions
): GlucoseTrendResult {
  const windowMinutes = options?.windowMin ?? DEFAULT_WINDOW_MIN
  const unknown: GlucoseTrendResult = {
    rocPerMin: NaN,
    trend: 'unknown',
    windowMinutes,
    readingsUsed: 0,
  }

  const points: { t: number; mgdl: number }[] = []
  for (const r of readings) {
    const mgdl = toMgdl(r)
    if (!Number.isFinite(mgdl) || mgdl <= 0) continue
    const ms = parseMs(r.timestamp)
    if (Number.isNaN(ms)) continue
    points.push({ t: ms / 60000, mgdl })
  }
  if (points.length < 2) return unknown

  points.sort((a, b) => a.t - b.t)
  const latest = points[points.length - 1].t
  const windowStart = latest - windowMinutes
  const win = points.filter((p) => p.t >= windowStart)
  if (win.length < 2) return { ...unknown, readingsUsed: win.length }

  const n = win.length
  const meanT = win.reduce((s, p) => s + p.t, 0) / n
  const meanG = win.reduce((s, p) => s + p.mgdl, 0) / n
  let num = 0
  let den = 0
  for (const p of win) {
    const dt = p.t - meanT
    num += dt * (p.mgdl - meanG)
    den += dt * dt
  }
  if (den === 0) return { ...unknown, readingsUsed: n }

  const rocPerMin = num / den
  return {
    rocPerMin: Math.round(rocPerMin * 1000) / 1000,
    trend: classifyGlucoseTrend(rocPerMin),
    windowMinutes,
    readingsUsed: n,
  }
}

/**
 * Returns the most recent reading by timestamp (readings need not be sorted).
 *
 * @param readings - Glucose readings
 * @returns The latest reading, or `null` if none have a valid timestamp
 * @category Live
 * @public
 */
export function latestReading(readings: GlucoseReading[]): GlucoseReading | null {
  let best: GlucoseReading | null = null
  let bestMs = -Infinity
  for (const r of readings) {
    const ms = parseMs(r.timestamp)
    if (Number.isNaN(ms)) continue
    if (ms >= bestMs) {
      bestMs = ms
      best = r
    }
  }
  return best
}

/**
 * Returns minutes elapsed since the most recent reading (sensor staleness).
 *
 * @param readings - Glucose readings
 * @param now - Reference time (ISO string, epoch ms, or Date); defaults to the current time
 * @returns Minutes since the latest reading, or `null` if there are none
 * @category Live
 * @public
 */
export function minutesSinceLastReading(
  readings: GlucoseReading[],
  now?: string | number | Date
): number | null {
  const latest = latestReading(readings)
  if (latest === null) return null
  const nowMs = now === undefined ? Date.now() : parseMs(now)
  return (nowMs - parseMs(latest.timestamp)) / 60000
}
