/**
 * @file src/alignment.ts
 *
 * Clinical utility functions for evaluating glycemic alignment using A1C, fasting glucose, and insulin.
 * These functions are provided for informational and educational purposes only. They do not constitute
 * medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider before making
 * medical decisions or interpreting laboratory results.
 */
import { isValidA1C } from './a1c'
import { isValidGlucoseValue } from './glucose'
import { isValidInsulin } from './validators'
import {
  HOMA_IR_DENOMINATOR,
  HOMA_IR_CUTOFFS,
  A1C_TO_EAG_MULTIPLIER,
  A1C_TO_EAG_CONSTANT,
  MG_DL,
} from './constants'

/**
 * Calculates HOMA-IR (Homeostatic Model Assessment for Insulin Resistance) from fasting glucose and insulin.
 *
 * Formula: HOMA-IR = (fasting glucose [mg/dL] × fasting insulin [µIU/mL]) / 405
 *
 * Used for estimating insulin resistance in clinical analytics and research. Not a diagnostic tool—interpret with clinical context.
 *
 * @param glucose - Fasting glucose value in mg/dL. Must be a positive finite number.
 * @param insulin - Fasting insulin value in µIU/mL. Must be a positive finite number.
 * @returns Object with numeric HOMA-IR value and clinical interpretation label.
 * @throws {Error} If glucose or insulin are invalid (non-finite, zero, or negative).
 * @see https://pubmed.ncbi.nlm.nih.gov/3899825/ (Original HOMA-IR publication)
 * @see https://diabetesjournals.org/care/article/26/1/118/22567/Prevalence-and-Concomitants-of-Glucose-Intolerance (ADA: Glucose Intolerance and HOMA-IR context)
 */
export function calculateHOMAIR(glucose: number, insulin: number) {
  if (!isValidGlucoseValue(glucose, MG_DL)) {
    throw new Error(
      'Invalid fasting glucose value (must be a positive number in mg/dL)'
    )
  }
  if (!isValidInsulin(insulin)) {
    throw new Error(
      'Invalid fasting insulin value (must be a positive number in µIU/mL)'
    )
  }
  const score = (glucose * insulin) / HOMA_IR_DENOMINATOR
  return {
    value: score,
    interpretation: interpretHOMAIR(score),
  }
}

/**
 * Interprets a numeric HOMA-IR score into a clinical insulin sensitivity/resistance category.
 *
 * Categories:
 *   - Very insulin sensitive: < 1.0
 *   - Normal insulin sensitivity: 1.0–2.0
 *   - Early insulin resistance: 2.0–2.9
 *   - Significant insulin resistance: ≥ 2.9
 *
 * Cutoffs are conventional and may vary by population and lab; not diagnostic.
 *
 * @param score - HOMA-IR numeric value
 * @returns Clinical interpretation string
 */
function interpretHOMAIR(score: number): string {
  if (score < HOMA_IR_CUTOFFS.VERY_SENSITIVE) return 'Very insulin sensitive'
  if (score >= HOMA_IR_CUTOFFS.VERY_SENSITIVE && score < HOMA_IR_CUTOFFS.NORMAL)
    return 'Normal insulin sensitivity'
  if (
    score >= HOMA_IR_CUTOFFS.NORMAL &&
    score < HOMA_IR_CUTOFFS.EARLY_RESISTANCE
  )
    return 'Early insulin resistance'
  return 'Significant insulin resistance'
}

/**
 * Checks clinical consistency among A1C, fasting glucose, and fasting insulin markers.
 *
 * Returns:
 *   - Estimated average glucose (mg/dL), calculated per CDC formula
 *   - HOMA-IR result (value and interpretation)
 *   - Flags for potential inconsistencies
 *   - Educational recommendation and disclaimer
 *
 * Used for high-level clinical insight and trend alignment, not for diagnosis.
 *
 * @param a1c - A1C value (percentage). Must be a positive finite number.
 * @param glucose - Fasting glucose value in mg/dL. Must be a positive finite number.
 * @param insulin - Fasting insulin value in µIU/mL. Must be a positive finite number.
 * @returns Object with estimated average glucose (mg/dL), HOMA-IR result object, flags array, recommendation string, and disclaimer.
 * @throws {Error} If any input value is invalid (non-finite, zero, or negative).
 * @see https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html (CDC: eAG formula)
 */
export function checkGlycemicAlignment(
  a1c: number,
  glucose: number,
  insulin: number
) {
  if (!isValidA1C(a1c)) {
    throw new Error('Invalid A1C value (must be a positive number < 20%)')
  }
  if (!isValidGlucoseValue(glucose, MG_DL)) {
    throw new Error(
      'Invalid fasting glucose value (must be a positive number in mg/dL)'
    )
  }
  if (!isValidInsulin(insulin)) {
    throw new Error(
      'Invalid fasting insulin value (must be a positive number in µIU/mL)'
    )
  }

  const estimatedAvg = A1C_TO_EAG_MULTIPLIER * a1c - A1C_TO_EAG_CONSTANT
  const homaResult = calculateHOMAIR(glucose, insulin)

  const flags: string[] = []

  if (glucose > estimatedAvg + 20) {
    flags.push(
      'Fasting glucose is higher than estimated average glucose from A1C.'
    )
  }

  if (insulin < 2 && glucose > 110) {
    flags.push(
      'Low insulin with high glucose may indicate reduced insulin secretion.'
    )
  }

  return {
    estimatedAverageGlucose: estimatedAvg,
    homaIR: homaResult,
    flags,
    recommendation: flags.length
      ? 'Some inconsistencies were detected in your markers. This may occur for various reasons including diet, stress, or lab variability. Always consult your healthcare provider for interpretation and guidance.'
      : 'Your markers appear consistent based on this informational analysis. This does not replace professional medical advice. Always consult your healthcare provider for interpretation and guidance.',
    disclaimer:
      'This tool is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment.',
  }
}
