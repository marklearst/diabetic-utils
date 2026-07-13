/**
 * @file src/timeseries.ts
 *
 * Time-series plumbing for CGM dashboards: sensor-gap detection and day/night
 * splitting. Pure and dependency-free.
 */

import type { GlucoseReading } from './types'

/** A detected gap between consecutive readings. */
export interface GlucoseGap {
  /** ISO 8601 timestamp of the reading before the gap. */
  readonly start: string
  /** ISO 8601 timestamp of the reading after the gap. */
  readonly end: string
  /** Gap duration in minutes. */
  readonly durationMinutes: number
}

/** Options for {@link detectGaps}. */
export interface GapDetectionOptions {
  /** A gap is any interval longer than this many minutes (default 15). */
  readonly maxGapMinutes?: number
}

/**
 * Finds gaps (sensor dropouts) between consecutive readings.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Gap threshold
 * @returns Gaps in chronological order (empty if none)
 * @category Time series
 * @public
 */
export function detectGaps(
  readings: GlucoseReading[],
  options?: GapDetectionOptions
): GlucoseGap[] {
  const maxGap = options?.maxGapMinutes ?? 15

  const sorted = readings
    .map((r) => ({ r, ms: Date.parse(r.timestamp) }))
    .filter((x) => !Number.isNaN(x.ms))
    .sort((a, b) => a.ms - b.ms)

  const gaps: GlucoseGap[] = []
  for (let i = 1; i < sorted.length; i++) {
    const minutes = (sorted[i].ms - sorted[i - 1].ms) / 60000
    if (minutes > maxGap) {
      gaps.push({
        start: sorted[i - 1].r.timestamp,
        end: sorted[i].r.timestamp,
        durationMinutes: Math.round(minutes * 10) / 10,
      })
    }
  }
  return gaps
}

/** Options for {@link splitDayNight}. */
export interface DayNightOptions {
  /** IANA time zone used to classify each reading's local hour (default 'UTC'). */
  readonly timeZone?: string
  /** Hour the night window begins (default 0). */
  readonly nightStartHour?: number
  /** Hour the night window ends, exclusive (default 6). */
  readonly nightEndHour?: number
}

/** Result of {@link splitDayNight}. */
export interface DayNightSplit {
  readonly day: GlucoseReading[]
  readonly night: GlucoseReading[]
}

/**
 * Splits readings into daytime and nighttime by local hour. The night window
 * may wrap past midnight (e.g. 22:00–06:00).
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Time zone and night window
 * @returns Readings partitioned into `day` and `night`
 * @throws {Error} If the time zone is invalid
 * @category Time series
 * @public
 */
export function splitDayNight(
  readings: GlucoseReading[],
  options?: DayNightOptions
): DayNightSplit {
  const timeZone = options?.timeZone ?? 'UTC'
  const nightStart = options?.nightStartHour ?? 0
  const nightEnd = options?.nightEndHour ?? 6

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
  })

  const day: GlucoseReading[] = []
  const night: GlucoseReading[] = []
  for (const r of readings) {
    if (Number.isNaN(Date.parse(r.timestamp))) continue
    const hour = Number(formatter.formatToParts(new Date(r.timestamp)).find((p) => p.type === 'hour')!.value)
    const isNight =
      nightStart <= nightEnd
        ? hour >= nightStart && hour < nightEnd
        : hour >= nightStart || hour < nightEnd
    if (isNight) night.push(r)
    else day.push(r)
  }
  return { day, night }
}
