/**
 * @file src/metrics/curve.ts
 *
 * Curve-shape glucose-variability metrics:
 * - MAG: Mean Absolute Glucose change rate (total absolute change per hour).
 * - GVP: Glycemic Variability Percentage (excess trace length vs. a flat line).
 *
 * Pure and dependency-free. Both normalize mixed mg/dL and mmol/L input to
 * mg/dL and return NaN when there is insufficient data or no time span.
 *
 * @see https://doi.org/10.1186/cc9002  Hermanides et al. (2010) — MAG
 * @see https://doi.org/10.1089/dia.2017.0187  Peyser et al. (2018) — GVP
 */

import type { GlucoseReading } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/** Normalizes readings to sorted (minute, mg/dL) points, dropping invalid ones. @internal */
function toPoints(readings: GlucoseReading[]): { t: number; v: number }[] {
  const points: { t: number; v: number }[] = []
  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(mgdl) || mgdl <= 0) continue
    const ms = Date.parse(r.timestamp)
    if (Number.isNaN(ms)) continue
    points.push({ t: ms / 60000, v: mgdl })
  }
  points.sort((a, b) => a.t - b.t)
  return points
}

/**
 * Mean Absolute Glucose change rate (MAG): total absolute glucose change
 * divided by total elapsed time, in mg/dL per hour.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @returns MAG in mg/dL per hour, or NaN if < 2 readings or no time span
 * @see https://doi.org/10.1186/cc9002
 * @category Variability
 * @public
 */
export function glucoseMAG(readings: GlucoseReading[]): number {
  const points = toPoints(readings)
  if (points.length < 2) return NaN

  const totalHours = (points[points.length - 1].t - points[0].t) / 60
  if (totalHours <= 0) return NaN

  let absChange = 0
  for (let i = 1; i < points.length; i++) {
    absChange += Math.abs(points[i].v - points[i - 1].v)
  }
  return Math.round((absChange / totalHours) * 10) / 10
}

/**
 * Glycemic Variability Percentage (GVP): the percentage by which the length of
 * the glucose trace exceeds the length of a flat line over the same time.
 *
 * `GVP = (L / L0 − 1) × 100`, where `L = Σ √(Δt² + Δglucose²)` and `L0 = Σ Δt`
 * (Δt in minutes, Δglucose in mg/dL).
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @returns GVP as a percentage, or NaN if < 2 readings or no time span
 * @see https://doi.org/10.1089/dia.2017.0187
 * @category Variability
 * @public
 */
export function glucoseGVP(readings: GlucoseReading[]): number {
  const points = toPoints(readings)
  if (points.length < 2) return NaN

  let traceLength = 0
  let timeLength = 0
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t
    const dy = points[i].v - points[i - 1].v
    traceLength += Math.sqrt(dt * dt + dy * dy)
    timeLength += dt
  }
  if (timeLength <= 0) return NaN

  return Math.round((traceLength / timeLength - 1) * 100 * 10) / 10
}
