// @file src/constants.ts

/**
 * Denominator constant for HOMA-IR calculation.
 * HOMA-IR = (glucose [mg/dL] × insulin [µIU/mL]) / HOMA_IR_DENOMINATOR
 * @see https://www.ncbi.nlm.nih.gov/books/NBK279396/
 */
export const HOMA_IR_DENOMINATOR = 405

/**
 * Interpretation cutoffs for HOMA-IR (insulin resistance assessment).
 * These are general clinical categories, not diagnostic.
 */
export const HOMA_IR_CUTOFFS = {
  VERY_SENSITIVE: 1,
  NORMAL: 2,
  EARLY_RESISTANCE: 2.9,
}


/**
 * Clinical hypoglycemia threshold (mg/dL).
 * Used for detecting low glucose events in analytics and reporting.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPO_THRESHOLD_MGDL = 70

/**
 * Clinical hyperglycemia threshold (mg/dL).
 * Used for detecting high glucose events in clinical analytics.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPER_THRESHOLD_MGDL = 180

/**
 * Clinical hypoglycemia threshold (mmol/L).
 * Used for low glucose detection in international/metric contexts.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPO_THRESHOLD_MMOLL = 3.9

/**
 * Clinical hyperglycemia threshold (mmol/L).
 * Used for high glucose detection in international/metric contexts.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPER_THRESHOLD_MMOLL = 10

/**
 * Clinical multiplier for converting A1C to estimated average glucose (eAG).
 * Used in eAG calculation per CDC/ADA guidelines.
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export const A1C_TO_EAG_MULTIPLIER = 28.7

/**
 * Clinical constant for converting A1C to estimated average glucose (eAG).
 * Used in eAG calculation per CDC/ADA guidelines.
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export const A1C_TO_EAG_CONSTANT = 46.7

/**
 * Clinical conversion factor between mg/dL and mmol/L.
 * Used for unit conversion in all clinical analytics.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const MGDL_MMOLL_CONVERSION = 18.0182

/**
 * Clinical string literal for mg/dL glucose unit.
 * Used for clinical data interoperability and formatting.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const MG_DL = 'mg/dL' as const

/**
 * String literal for mmol/L unit.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const MMOL_L = 'mmol/L' as const


/**
 * Color codes for glucose zones.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const GLUCOSE_COLOR_LOW = '#D32F2F' // Red (low)
export const GLUCOSE_COLOR_NORMAL = '#388E3C' // Green (steady normal)
export const GLUCOSE_COLOR_NORMAL_UP = '#4CAF50' // Lighter Green (normal, trending up)
export const GLUCOSE_COLOR_NORMAL_DOWN = '#2E7D32' // Darker Green (normal, trending down)
export const GLUCOSE_COLOR_ELEVATED = '#FBC02D' // Yellow (over 140)
export const GLUCOSE_COLOR_HIGH = '#F57C00' // Orange (over 180)

/**
 * Glucose zone color mapping for different statuses and trends.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const GLUCOSE_ZONE_COLORS = {
  LOW: GLUCOSE_COLOR_LOW, // Red
  NORMAL: GLUCOSE_COLOR_NORMAL, // Green
  ELEVATED: GLUCOSE_COLOR_ELEVATED, // Yellow
  HIGH: GLUCOSE_COLOR_HIGH, // Orange
  // Colors for trending normal up and down
  NORMAL_UP: GLUCOSE_COLOR_NORMAL_UP, // Lighter Green
  NORMAL_DOWN: GLUCOSE_COLOR_NORMAL_DOWN, // Darker Green
}

/**
 * Unicode arrows for glucose trend indication.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const TREND_ARROWS = {
  STEADY: '→',
  RISING: '↗',
  FALLING: '↘',
  RAPIDRISE: '↑',
  RAPIDFALL: '↓',
}
