/**
 * @file src/align.ts
 *
 * Uniform-grid resampling. CGM feeds are irregular (jitter, dropouts,
 * backfill); metrics like MODD/CONGA and day-over-day comparisons want
 * readings on a fixed grid. `alignToGrid` snaps readings to the nearest slot,
 * linearly interpolates slots inside small gaps (flagged `interpolated`), and
 * leaves genuine sensor gaps as holes rather than inventing data.
 *
 * Pure and dependency-free.
 */

import type { GlucoseReading, GlucoseUnit } from './types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'

/** A resampled grid point. */
export interface GridPoint {
  /** ISO 8601 timestamp of the grid slot. */
  readonly timestamp: string
  /** Glucose value in the output unit. */
  readonly value: number
  /** True when the value was linearly interpolated rather than observed. */
  readonly interpolated: boolean
}

/** Options for {@link alignToGrid}. */
export interface AlignOptions {
  /** Grid interval in minutes (default 5). */
  readonly intervalMin?: number
  /** Interpolate only across gaps up to this many minutes (default 15). */
  readonly maxInterpolateGapMin?: number
  /** Output unit (default 'mg/dL'). Input units are normalized. */
  readonly unit?: GlucoseUnit
}

/**
 * Resamples readings onto a fixed time grid.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Interval, interpolation window, and output unit
 * @returns Grid points from the first to the last reading; genuine gaps are holes
 *
 * @example
 * ```ts
 * const grid = alignToGrid(readings) // 5-min slots, gaps ≤15 min interpolated
 * ```
 *
 * @category Time series
 * @public
 */
export function alignToGrid(
  readings: GlucoseReading[],
  options?: AlignOptions
): GridPoint[] {
  const intervalMin = options?.intervalMin ?? 5
  const maxGap = options?.maxInterpolateGapMin ?? 15
  const unit = options?.unit ?? MG_DL

  const points: { t: number; v: number }[] = []
  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    const v = unit === MG_DL ? mgdl : mgdl / MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(v) || v <= 0) continue
    const ms = Date.parse(r.timestamp)
    if (Number.isNaN(ms)) continue
    points.push({ t: ms / 60000, v })
  }
  points.sort((a, b) => a.t - b.t)
  if (points.length < 2) return []

  const intervalMs = intervalMin * 60000
  const startSlot = Math.round((points[0].t * 60000) / intervalMs) * intervalMs
  const endSlot = Math.round((points[points.length - 1].t * 60000) / intervalMs) * intervalMs

  const grid: GridPoint[] = []
  const tolerance = intervalMin / 2
  let cursor = 0 // index of the last point at-or-before the slot

  for (let slotMs = startSlot; slotMs <= endSlot; slotMs += intervalMs) {
    const slotMin = slotMs / 60000
    while (cursor + 1 < points.length && points[cursor + 1].t <= slotMin) cursor++

    const before = points[cursor]
    const after = cursor + 1 < points.length ? points[cursor + 1] : undefined

    // Nearest observed reading within tolerance → snap, not interpolate.
    const candidates = [before, after].filter(
      (p): p is { t: number; v: number } => p !== undefined && Math.abs(p.t - slotMin) <= tolerance
    )
    if (candidates.length > 0) {
      const nearest = candidates.reduce((a, b) =>
        Math.abs(a.t - slotMin) <= Math.abs(b.t - slotMin) ? a : b
      )
      grid.push({
        timestamp: new Date(slotMs).toISOString(),
        value: Math.round(nearest.v * 10) / 10,
        interpolated: false,
      })
      continue
    }

    // Interpolate only inside a bracketing pair closer than maxGap.
    if (after !== undefined && before.t < slotMin && after.t - before.t <= maxGap) {
      const frac = (slotMin - before.t) / (after.t - before.t)
      grid.push({
        timestamp: new Date(slotMs).toISOString(),
        value: Math.round((before.v + frac * (after.v - before.v)) * 10) / 10,
        interpolated: true,
      })
    }
    // Otherwise: a genuine gap — leave a hole.
  }
  return grid
}
