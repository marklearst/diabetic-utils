/**
 * @file src/metrics/agp-profile.ts
 *
 * Ambulatory Glucose Profile (AGP) time-of-day percentile-band series.
 *
 * Where {@link calculateAGPMetrics} returns scalar summary metrics, this builds
 * the *visual* AGP series that dashboards actually render: readings are pooled by
 * minute-of-day (in a configurable IANA time zone) across all days, then reduced
 * to per-bin percentile bands (default 5/25/50/75/95). The result is a plain,
 * render-ready structure you can draw with any charting library as two shaded
 * areas (5–95, 25–75) plus a median line.
 *
 * Pure and dependency-free. Descriptive summary of past data only — not a
 * predictive or diagnostic function.
 *
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (Battelino 2019)}
 * @see {@link https://cran.r-project.org/web/packages/iglu/vignettes/agp.html | iglu: AGP}
 */

import type { GlucoseReading, GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'
import { DomainError } from '../errors'

/** Minutes in a 24-hour day. */
const MINUTES_PER_DAY = 1440
/** Default bin width — 5 minutes matches standard CGM sampling (288 bins/day). */
const DEFAULT_BIN_MINUTES = 5
/** Default AGP percentile bands per the 2019 international consensus. */
const DEFAULT_PERCENTILES = [5, 25, 50, 75, 95]

/**
 * Percentile estimation method.
 * - `nearest-rank` (default): matches {@link glucosePercentiles} for reproducibility with existing library outputs.
 * - `linear`: interpolated (type-7) percentiles, an opt-in for smoother bands.
 */
export type PercentileMethod = 'nearest-rank' | 'linear'

/** Options for {@link buildAGPProfile}. */
export interface AGPProfileOptions {
  /** Bin width in minutes (default 5). Integer in [1, 1440]. */
  readonly binMinutes?: number
  /** Percentiles to compute per bin (default [5, 25, 50, 75, 95]). Values outside [0, 100] are ignored. */
  readonly percentiles?: number[]
  /** IANA time zone used to assign readings to a minute-of-day (default 'UTC'). */
  readonly timeZone?: string
  /** Output unit for percentile values (default 'mg/dL'). Input readings are normalized to this unit. */
  readonly unit?: GlucoseUnit
  /** Percentile method (default 'nearest-rank'). */
  readonly method?: PercentileMethod
}

/** A single time-of-day bin in the AGP profile. */
export interface AGPProfileBin {
  /** Minute-of-day at the start of this bin (0–1439). */
  readonly minuteOfDay: number
  /** Percentile value keyed by percentile; `null` when the bin has no readings. */
  readonly percentiles: Record<number, number | null>
  /** Number of pooled readings in this bin. */
  readonly n: number
}

/** Result of {@link buildAGPProfile}. */
export interface AGPProfileResult {
  /** All time-of-day bins across the full day (always present, empty bins included). */
  readonly bins: AGPProfileBin[]
  /** Bin width used (minutes). */
  readonly binMinutes: number
  /** Percentiles computed (sanitized to [0, 100]). */
  readonly percentiles: number[]
  /** Output unit of percentile values. */
  readonly unit: GlucoseUnit
  /** IANA time zone used for bucketing. */
  readonly timeZone: string
  /** Count of valid readings pooled into the profile. */
  readonly totalReadings: number
  /** `false` when no valid readings were available. */
  readonly valid: boolean
}

/**
 * Estimates the p-th percentile of a pre-sorted array.
 *
 * @internal
 */
function quantile(sorted: number[], p: number, method: PercentileMethod): number {
  const n = sorted.length
  if (method === 'linear') {
    const rank = ((n - 1) * p) / 100
    const lo = Math.floor(rank)
    const hi = Math.ceil(rank)
    if (lo === hi) return sorted[lo]
    return sorted[lo] + (rank - lo) * (sorted[hi] - sorted[lo])
  }
  // Nearest-rank — identical formula to glucosePercentiles for reproducibility.
  const rank = Math.ceil((p / 100) * n)
  const idx = rank < 1 ? 0 : rank - 1
  return sorted[idx]
}

/** Rounds to one decimal place. @internal */
function round1(v: number): number {
  return Math.round(v * 10) / 10
}

/**
 * Builds the AGP time-of-day percentile-band series from glucose readings.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Bin width, percentiles, time zone, output unit, and method
 * @returns Render-ready AGP profile (full-day bin grid + per-bin percentiles)
 * @throws {Error} If `binMinutes` is not an integer in [1, 1440]
 * @throws {Error} If `timeZone` is not a valid IANA time zone
 *
 * @example
 * ```ts
 * const profile = buildAGPProfile(readings, { timeZone: 'America/New_York' })
 * // profile.bins[i] = { minuteOfDay, percentiles: { 5, 25, 50, 75, 95 }, n }
 * ```
 *
 * @category AGP
 * @public
 */
export function buildAGPProfile(
  readings: GlucoseReading[],
  options?: AGPProfileOptions
): AGPProfileResult {
  const binMinutes = options?.binMinutes ?? DEFAULT_BIN_MINUTES
  if (!Number.isInteger(binMinutes) || binMinutes < 1 || binMinutes > MINUTES_PER_DAY) {
    throw new DomainError(
      `buildAGPProfile: binMinutes must be an integer in [1, ${MINUTES_PER_DAY}] (received ${binMinutes})`,
      'INVALID_OPTION'
    )
  }

  const unit: GlucoseUnit = options?.unit ?? MG_DL
  const timeZone = options?.timeZone ?? 'UTC'
  const method: PercentileMethod = options?.method ?? 'nearest-rank'
  const percentiles = (options?.percentiles ?? DEFAULT_PERCENTILES).filter(
    (p) => p >= 0 && p <= 100
  )

  // Validating the zone by constructing the formatter (throws RangeError on a bad zone).
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    throw new DomainError(`buildAGPProfile: invalid IANA time zone "${timeZone}"`, 'INVALID_TIMEZONE')
  }

  const binCount = Math.ceil(MINUTES_PER_DAY / binMinutes)
  const buckets: number[][] = Array.from({ length: binCount }, () => [])

  let totalReadings = 0
  for (const reading of readings) {
    const mgdl = reading.unit === MG_DL ? reading.value : reading.value * MGDL_MMOLL_CONVERSION
    const value = unit === MG_DL ? mgdl : mgdl / MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(value) || value <= 0) continue

    const ms = Date.parse(reading.timestamp)
    if (Number.isNaN(ms)) continue

    const parts = formatter.formatToParts(new Date(ms))
    const hour = Number(parts.find((pt) => pt.type === 'hour')!.value)
    const minute = Number(parts.find((pt) => pt.type === 'minute')!.value)
    const minuteOfDay = hour * 60 + minute
    buckets[Math.floor(minuteOfDay / binMinutes)].push(value)
    totalReadings++
  }

  const bins: AGPProfileBin[] = buckets.map((values, i) => {
    const perc: Record<number, number | null> = {}
    if (values.length > 0) {
      const sorted = [...values].sort((a, b) => a - b)
      for (const p of percentiles) perc[p] = round1(quantile(sorted, p, method))
    } else {
      for (const p of percentiles) perc[p] = null
    }
    return { minuteOfDay: i * binMinutes, percentiles: perc, n: values.length }
  })

  return {
    bins,
    binMinutes,
    percentiles,
    unit,
    timeZone,
    totalReadings,
    valid: totalReadings > 0,
  }
}
