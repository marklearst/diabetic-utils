/**
 * @file src/metrics/grade.ts
 *
 * Glycemic Risk Assessment Diabetes Equation (GRADE).
 *
 * GRADE produces a single risk score from a glucose value, and its
 * partitioned variants break down what percentage of the total GRADE
 * score comes from euglycemic, hyperglycemic, and hypoglycemic readings.
 *
 * Formula (Hill et al. 2007):
 *   GRADE(G) = 425 * (log10(log10(G_mmol)) + 0.16)^2
 *   where G_mmol = G_mgdl / 18.0182
 *
 * Input values must be in mg/dL. Values <= 0 are skipped.
 *
 * @see https://doi.org/10.1111/j.1464-5491.2007.02119.x  Hill et al. (2007)
 */

const MGDL_TO_MMOL = 18.0182

/**
 * Computes the GRADE score for a single glucose value (mg/dL).
 * @internal
 */
function gradeScore(mgdl: number): number {
  const mmol = mgdl / MGDL_TO_MMOL
  if (mmol <= 1) return 0
  const inner = Math.log10(mmol)
  /* c8 ignore next -- inner > 0 is guaranteed when mmol > 1 (guarded above) */
  if (inner <= 0) return 0
  const logLog = Math.log10(inner) + 0.16
  return 425 * logLog * logLog
}

/** Result of the partitioned GRADE calculation. */
export interface GRADEResult {
  /** Mean GRADE score across all valid readings */
  readonly grade: number
  /** % of total GRADE contributed by euglycemic readings (70-140 mg/dL) */
  readonly gradeEuglycemia: number
  /** % of total GRADE contributed by hyperglycemic readings (>140 mg/dL) */
  readonly gradeHyperglycemia: number
  /** % of total GRADE contributed by hypoglycemic readings (<70 mg/dL) */
  readonly gradeHypoglycemia: number
}

/**
 * Calculates the GRADE score and its partitioned components.
 *
 * @param readings - Array of glucose values in mg/dL
 * @param hypoThreshold - Upper bound for hypoglycemia (default: 70 mg/dL)
 * @param hyperThreshold - Lower bound for hyperglycemia (default: 140 mg/dL)
 * @returns GRADE result with overall score and percentage breakdown, or NaN fields if no valid data
 * @see https://doi.org/10.1111/j.1464-5491.2007.02119.x
 */
export function calculateGRADE(
  readings: number[],
  hypoThreshold = 70,
  hyperThreshold = 140
): GRADEResult {
  const valid = readings.filter((v) => Number.isFinite(v) && v > 0)
  if (valid.length === 0) {
    return { grade: NaN, gradeEuglycemia: NaN, gradeHyperglycemia: NaN, gradeHypoglycemia: NaN }
  }

  let totalGrade = 0
  let hypoGrade = 0
  let euGrade = 0
  let hyperGrade = 0

  for (const g of valid) {
    const score = gradeScore(g)
    totalGrade += score
    if (g < hypoThreshold) {
      hypoGrade += score
    } else if (g > hyperThreshold) {
      hyperGrade += score
    } else {
      euGrade += score
    }
  }

  const meanGrade = totalGrade / valid.length

  if (totalGrade === 0) {
    return { grade: 0, gradeEuglycemia: 0, gradeHyperglycemia: 0, gradeHypoglycemia: 0 }
  }

  return {
    grade: Math.round(meanGrade * 100) / 100,
    gradeEuglycemia: Math.round((euGrade / totalGrade) * 10000) / 100,
    gradeHyperglycemia: Math.round((hyperGrade / totalGrade) * 10000) / 100,
    gradeHypoglycemia: Math.round((hypoGrade / totalGrade) * 10000) / 100,
  }
}
