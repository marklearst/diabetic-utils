/**
 * @file src/metrics/bgi.ts
 *
 * Low Blood Glucose Index (LBGI) and High Blood Glucose Index (HBGI).
 *
 * These risk indices quantify the risk of hypo- and hyperglycemia from a
 * series of glucose readings. They are asymmetric transforms that weight
 * low values more heavily (LBGI) or high values more heavily (HBGI).
 *
 * Formula (Kovatchev et al. 2006):
 *   f(G) = 1.509 * (ln(G)^1.084 - 5.381)
 *   rl(G) = 10 * f(G)^2   if f(G) < 0, else 0   (low risk)
 *   rh(G) = 10 * f(G)^2   if f(G) > 0, else 0   (high risk)
 *   LBGI = mean(rl)
 *   HBGI = mean(rh)
 *
 * Values <= 0 are skipped. Input defaults to mg/dL; pass `unit: 'mmol/L'`
 * to have mmol/L readings converted to mg/dL before the (mg/dL-calibrated)
 * transform is applied.
 *
 * @see https://doi.org/10.2337/dc06-1085  Kovatchev et al. (2006)
 */

import type { GlucoseUnit } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'

/**
 * Normalizes a readings array to mg/dL for the mg/dL-calibrated risk transforms.
 * @internal
 */
function toMgdl(readings: number[], unit: GlucoseUnit): number[] {
  return unit === MG_DL
    ? readings
    : readings.map((v) => v * MGDL_MMOLL_CONVERSION)
}

/**
 * Computes the blood glucose symmetry function f(G).
 * Used by LBGI, HBGI, and ADRR calculations.
 * @internal
 */
export function fbg(glucoseMgDl: number): number {
  return 1.509 * (Math.pow(Math.log(glucoseMgDl), 1.084) - 5.381)
}

/**
 * Calculates the Low Blood Glucose Index (LBGI).
 *
 * Quantifies the risk and extent of hypoglycemia from a glucose trace.
 * Higher values indicate greater hypoglycemia risk.
 *
 * Risk categories (Kovatchev 2006):
 *  - < 1.1: low risk
 *  - 1.1 - 2.5: moderate risk
 *  - > 2.5: high risk
 *
 * @param readings - Array of glucose values (mg/dL by default)
 * @param unit - Unit of `readings` (default 'mg/dL'); 'mmol/L' is converted to mg/dL first
 * @returns LBGI value, or NaN if no valid readings
 * @see https://doi.org/10.2337/dc06-1085
 */
export function glucoseLBGI(readings: number[], unit: GlucoseUnit = MG_DL): number {
  const valid = toMgdl(readings, unit).filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length === 0) return NaN

  let sum = 0
  for (const g of valid) {
    const f = fbg(g)
    if (f < 0) {
      sum += 10 * f * f
    }
  }
  return sum / valid.length
}

/**
 * Calculates the High Blood Glucose Index (HBGI).
 *
 * Quantifies the risk and extent of hyperglycemia from a glucose trace.
 * Higher values indicate greater hyperglycemia risk.
 *
 * Risk categories (Kovatchev 2006):
 *  - < 4.5: low risk
 *  - 4.5 - 9.0: moderate risk
 *  - > 9.0: high risk
 *
 * @param readings - Array of glucose values (mg/dL by default)
 * @param unit - Unit of `readings` (default 'mg/dL'); 'mmol/L' is converted to mg/dL first
 * @returns HBGI value, or NaN if no valid readings
 * @see https://doi.org/10.2337/dc06-1085
 */
export function glucoseHBGI(readings: number[], unit: GlucoseUnit = MG_DL): number {
  const valid = toMgdl(readings, unit).filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length === 0) return NaN

  let sum = 0
  for (const g of valid) {
    const f = fbg(g)
    if (f > 0) {
      sum += 10 * f * f
    }
  }
  return sum / valid.length
}
