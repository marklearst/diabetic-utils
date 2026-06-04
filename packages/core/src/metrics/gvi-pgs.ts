/**
 * @file src/metrics/gvi-pgs.ts
 *
 * Glucose Variability Index (GVI) and Patient Glycemic Status (PGS), matching
 * the Nightscout implementation for parity.
 *
 *   GVI = L_actual / L_ideal
 *     L_actual = Σ √(Δt² + Δg²) over reading pairs within maxGap (minutes, mg/dL)
 *     L_ideal  = √(T² + ⌊g_first − g_last⌋²),  T = total included minutes
 *   PGS = GVI × MG × (1 − PTIR)
 *     MG   = ⌊mean glucose over readings that begin a valid step⌋ (mg/dL)
 *     PTIR = in-range fraction over all readings, in-range = [low, high)
 *
 * Pure and dependency-free. Computed in mg/dL.
 *
 * @see https://doi.org/10.1089/dia.2008.0132  Rodbard (2009)
 * @see https://github.com/nightscout/cgm-remote-monitor  Nightscout GVI/PGS
 */

import type { GlucoseReading, GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/** Nightscout maxGap: 310000 ms. */
const DEFAULT_MAX_GAP_MIN = 310000 / 60000

/** Options for {@link calculateGVIPGS}. */
export interface GVIPGSOptions {
  /** Unit of input readings (default 'mg/dL'); 'mmol/L' is converted to mg/dL. */
  readonly unit?: GlucoseUnit
  /** In-range lower bound, mg/dL, inclusive (default 70). */
  readonly targetLow?: number
  /** In-range upper bound, mg/dL, exclusive (default 180). */
  readonly targetHigh?: number
  /** Maximum minutes between readings to count a step (default ~5.17). */
  readonly maxGapMinutes?: number
}

/** Result of {@link calculateGVIPGS}. */
export interface GVIPGSResult {
  /** Glucose Variability Index (actual path length / ideal). */
  readonly gvi: number
  /** Patient Glycemic Status. */
  readonly pgs: number
  /** Mean glucose used (mg/dL, floored). */
  readonly meanGlucose: number
  /** Time-in-range fraction used (PTIR). */
  readonly timeInRangeFraction: number
}

/**
 * Calculates GVI and PGS from glucose readings (Nightscout algorithm).
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Unit, target range, and max gap
 * @returns GVI, PGS, the mean glucose, and PTIR; NaN when there are no valid steps
 * @category Variability
 * @public
 */
export function calculateGVIPGS(
  readings: GlucoseReading[],
  options?: GVIPGSOptions
): GVIPGSResult {
  const unit = options?.unit ?? MG_DL
  const targetLow = options?.targetLow ?? 70
  const targetHigh = options?.targetHigh ?? 180
  const maxGap = options?.maxGapMinutes ?? DEFAULT_MAX_GAP_MIN

  const points: { t: number; g: number }[] = []
  for (const r of readings) {
    const g = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(g) || g <= 0) continue
    const ms = Date.parse(r.timestamp)
    if (Number.isNaN(ms)) continue
    points.push({ t: ms / 60000, g })
  }
  points.sort((a, b) => a.t - b.t)

  const invalid: GVIPGSResult = { gvi: NaN, pgs: NaN, meanGlucose: NaN, timeInRangeFraction: NaN }
  if (points.length < 2) return invalid

  let lActual = 0
  let totalMinutes = 0
  let mgSum = 0
  let steps = 0
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t
    if (dt <= 0 || dt > maxGap) continue
    const dg = Math.abs(points[i].g - points[i - 1].g)
    lActual += Math.sqrt(dt * dt + dg * dg)
    totalMinutes += dt
    mgSum += points[i - 1].g
    steps++
  }
  if (steps === 0) return invalid

  const gFirst = points[0].g
  const gLast = points[points.length - 1].g
  const lIdeal = Math.sqrt(totalMinutes * totalMinutes + Math.floor(gFirst - gLast) ** 2)
  const gvi = Math.round((lActual / lIdeal) * 100) / 100

  const meanGlucose = Math.floor(mgSum / steps)

  let inRange = 0
  for (const p of points) {
    if (p.g >= targetLow && p.g < targetHigh) inRange++
  }
  const ptir = Math.round((inRange / points.length) * 1000) / 10 / 100

  const pgs = Math.round(gvi * meanGlucose * (1 - ptir) * 100) / 100

  return { gvi, pgs, meanGlucose, timeInRangeFraction: ptir }
}
