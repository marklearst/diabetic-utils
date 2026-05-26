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
 * Input values must be in mg/dL. Values <= 0 are skipped.
 *
 * @see https://doi.org/10.2337/dc06-1085  Kovatchev et al. (2006)
 */

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
 * @param readings - Array of glucose values in mg/dL
 * @returns LBGI value, or NaN if no valid readings
 * @see https://doi.org/10.2337/dc06-1085
 */
export function glucoseLBGI(readings: number[]): number {
  const valid = readings.filter((v) => Number.isFinite(v) && v > 0)
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
 * @param readings - Array of glucose values in mg/dL
 * @returns HBGI value, or NaN if no valid readings
 * @see https://doi.org/10.2337/dc06-1085
 */
export function glucoseHBGI(readings: number[]): number {
  const valid = readings.filter((v) => Number.isFinite(v) && v > 0)
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
