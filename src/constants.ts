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
} as const


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
 * GMI (Glucose Management Indicator) calculation coefficients.
 * Used for estimating GMI from average glucose values.
 * @see https://diatribe.org/glucose-management-indicator-gmi
 */
export const GMI_COEFFICIENTS = {
  /** Slope for mmol/L to GMI conversion */
  MMOL_L_SLOPE: 1.57,
  /** Intercept for mmol/L to GMI conversion */
  MMOL_L_INTERCEPT: 3.5,
  /** Slope for mg/dL to GMI conversion */
  MG_DL_SLOPE: 0.03,
  /** Intercept for mg/dL to GMI conversion */
  MG_DL_INTERCEPT: 2.4,
  /** Slope for A1C to GMI conversion */
  A1C_SLOPE: 0.02392,
  /** Intercept for A1C to GMI conversion */
  A1C_INTERCEPT: 3.31,
} as const

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
} as const

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
} as const

// ============================================================================
// Enhanced Time-in-Range (TIR) Constants
// Per International Consensus on Time in Range (Battelino et al. 2019)
// ============================================================================

/**
 * Level 2 hypoglycemia threshold (mg/dL).
 * Readings below this value indicate clinically significant hypoglycemia.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_VERY_LOW_THRESHOLD_MGDL = 54

/**
 * Level 1 hypoglycemia threshold (mg/dL).
 * Target range begins at this value.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_LOW_THRESHOLD_MGDL = 70

/**
 * Level 1 hyperglycemia threshold (mg/dL).
 * Target range ends at this value.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_HIGH_THRESHOLD_MGDL = 180

/**
 * Level 2 hyperglycemia threshold (mg/dL).
 * Readings above this value indicate clinically significant hyperglycemia.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_VERY_HIGH_THRESHOLD_MGDL = 250

/**
 * Level 2 hypoglycemia threshold (mmol/L).
 * Readings below this value indicate clinically significant hypoglycemia.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_VERY_LOW_THRESHOLD_MMOLL = 3.0

/**
 * Level 1 hypoglycemia threshold (mmol/L).
 * Target range begins at this value.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_LOW_THRESHOLD_MMOLL = 3.9

/**
 * Level 1 hyperglycemia threshold (mmol/L).
 * Target range ends at this value.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_HIGH_THRESHOLD_MMOLL = 10.0

/**
 * Level 2 hyperglycemia threshold (mmol/L).
 * Readings above this value indicate clinically significant hyperglycemia.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_VERY_HIGH_THRESHOLD_MMOLL = 13.9

// ============================================================================
// Pregnancy-Specific TIR Constants
// Per ADA Standards of Care in Diabetes (2024, 2025)
// ============================================================================

/**
 * Lower bound of target glucose range during pregnancy (mg/dL).
 * Applies to Type 1, Type 2, and gestational diabetes.
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 */
export const PREGNANCY_TARGET_LOW_MGDL = 63

/**
 * Upper bound of target glucose range during pregnancy (mg/dL).
 * Applies to Type 1, Type 2, and gestational diabetes.
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 */
export const PREGNANCY_TARGET_HIGH_MGDL = 140

/**
 * Lower bound of target glucose range during pregnancy (mmol/L).
 * Applies to Type 1, Type 2, and gestational diabetes.
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 */
export const PREGNANCY_TARGET_LOW_MMOLL = 3.5

/**
 * Upper bound of target glucose range during pregnancy (mmol/L).
 * Applies to Type 1, Type 2, and gestational diabetes.
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 */
export const PREGNANCY_TARGET_HIGH_MMOLL = 7.8

// ============================================================================
// Clinical TIR Goals (percentages)
// Per International Consensus on Time in Range (Battelino et al. 2019)
// ============================================================================

/**
 * Target percentage for time-in-range (70-180 mg/dL).
 * Clinical goal: ≥70% of readings in target range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_GOAL_STANDARD = 70

/**
 * Maximum acceptable percentage for Level 1 hypoglycemia (54-69 mg/dL).
 * Clinical goal: <4% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TBR_LEVEL1_GOAL = 4

/**
 * Maximum acceptable percentage for Level 2 hypoglycemia (<54 mg/dL).
 * Clinical goal: <1% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TBR_LEVEL2_GOAL = 1

/**
 * Maximum acceptable percentage for Level 1 hyperglycemia (181-250 mg/dL).
 * Clinical goal: <25% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TAR_LEVEL1_GOAL = 25

/**
 * Maximum acceptable percentage for Level 2 hyperglycemia (>250 mg/dL).
 * Clinical goal: <5% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TAR_LEVEL2_GOAL = 5

/**
 * Target percentage for time-in-range for older/high-risk adults.
 * More lenient goal: ≥50% of readings in target range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TIR_GOAL_OLDER_ADULTS = 50

/**
 * Maximum acceptable percentage for Level 1 hypoglycemia for older/high-risk adults.
 * More stringent goal: <1% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TBR_LEVEL1_GOAL_OLDER_ADULTS = 1

/**
 * Maximum acceptable percentage for Level 2 hypoglycemia for older/high-risk adults.
 * More stringent goal: <0.5% of readings in this range.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export const TBR_LEVEL2_GOAL_OLDER_ADULTS = 0.5
