/**
 * @file src/metrics/jindex.ts
 *
 * J-Index: a composite measure of both mean glucose and variability.
 *
 * Formula (Wojcicki 1995):
 *   J = 0.001 * (mean + SD)^2
 *
 * The formula is calibrated for mg/dL. Input defaults to mg/dL; pass
 * `unit: 'mmol/L'` to have readings converted to mg/dL first.
 *
 * @see https://doi.org/10.1055/s-2007-979906  Wojcicki (1995)
 */

import type { GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/**
 * Calculates the J-Index for a glucose trace.
 *
 * The J-Index captures both central tendency and variability in a
 * single score. Higher values indicate worse glycemic control.
 *
 * @param readings - Array of glucose values (mg/dL by default)
 * @param unit - Unit of `readings` (default 'mg/dL'); 'mmol/L' is converted to mg/dL first
 * @returns J-Index value, or NaN if fewer than 2 valid readings
 * @see https://doi.org/10.1055/s-2007-979906
 */
export function calculateJIndex(readings: number[], unit: GlucoseUnit = MG_DL): number {
  const mgdl = unit === MG_DL ? readings : readings.map((v) => v * MGDL_MMOLL_CONVERSION)
  const valid = mgdl.filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length < 2) return NaN

  const mean = valid.reduce((s, v) => s + v, 0) / valid.length
  const variance =
    valid.reduce((s, v) => s + (v - mean) ** 2, 0) / (valid.length - 1)
  const sd = Math.sqrt(variance)

  return Math.round(0.001 * (mean + sd) ** 2 * 100) / 100
}
