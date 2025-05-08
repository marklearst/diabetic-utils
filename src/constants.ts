// @file src/constants.ts

/**
 * Hypoglycemia threshold in mg/dL.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPO_THRESHOLD_MGDL = 70

/**
 * Hyperglycemia threshold in mg/dL.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPER_THRESHOLD_MGDL = 180

/**
 * Hypoglycemia threshold in mmol/L.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPO_THRESHOLD_MMOLL = 3.9

/**
 * Hyperglycemia threshold in mmol/L.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
 */
export const HYPER_THRESHOLD_MMOLL = 10

/**
 * Multiplier for converting A1C to estimated average glucose (eAG).
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export const A1C_TO_EAG_MULTIPLIER = 28.7

/**
 * Constant for converting A1C to estimated average glucose (eAG).
 * @see https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
 */
export const A1C_TO_EAG_CONSTANT = 46.7

/**
 * Conversion factor between mg/dL and mmol/L.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const MGDL_MMOLL_CONVERSION = 18.0182

/**
 * String literal for mg/dL unit.
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
