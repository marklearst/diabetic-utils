// @file src/types.ts

import { MG_DL, MMOL_L } from './constants'

/**
 * Supported clinical glucose units.
 * Used for all clinical analytics and conversions.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export type GlucoseUnit = typeof MG_DL | typeof MMOL_L

/**
 * List of allowed clinical glucose units.
 * Used for input validation and unit conversion.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const AllowedGlucoseUnits: GlucoseUnit[] = [MG_DL, MMOL_L]

/**
 * Single clinical glucose reading.
 * Includes value, unit, and ISO 8601 timestamp for clinical analytics.
 * @see https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/
 */
export interface GlucoseReading {
  readonly value: number
  readonly unit: GlucoseUnit
  readonly timestamp: string // ISO 8601
}

/**
 * Result object for clinical Time-in-Range (TIR) analytics.
 * Percentages for in-range, below-range, and above-range readings.
 * @see https://care.diabetesjournals.org/content/42/8/1593
 */
export interface TIRResult {
  inRange: number
  belowRange: number
  aboveRange: number
}

/**
 * Options for clinical GMI (Glucose Management Indicator) estimation.
 * Used to standardize GMI calculation input.
 * @see https://diatribe.org/glucose-management-indicator-gmi
 */
export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}

/**
 * Result of glucose unit conversion.
 * Provides converted value and new unit for clinical interoperability.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export interface ConversionResult {
  /** Converted glucose value */
  readonly value: number
  /** New glucose unit after conversion */
  readonly unit: GlucoseUnit
}

/**
 * Options for clinical Time-in-Range (TIR) analytics.
 */
export interface TIROptions {
  readings: GlucoseReading[]
  unit: GlucoseUnit
  range: [number, number]
}

/**
 * Single clinical A1C reading (value and ISO date).
 */
export interface A1CReading {
  value: number
  date: string // ISO 8601 date string
}

/**
 * Options for clinical glucose statistics analytics.
 * Controls which metrics are calculated and reported.
 */
export interface GlucoseStatsOptions {
  readings: GlucoseReading[]
  unit: GlucoseUnit
  range: [number, number]
  gmi?: boolean
  a1c?: boolean
  tir?: boolean
  tirRange?: [number, number]
  tirPercent?: boolean
  tirPercentBelow?: boolean
  tirPercentAbove?: boolean
  tirPercentInRange?: boolean
  tirPercentBelowRounded?: boolean
  tirPercentAboveRounded?: boolean
  tirPercentInRangeRounded?: boolean
}

// ============================================================================
// Enhanced Time-in-Range (TIR) Types
// Per International Consensus on Time in Range (Battelino et al. 2019)
// ============================================================================

/**
 * Population type for TIR target assessment.
 * Different populations have different clinical goals.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export type TIRPopulation = 'standard' | 'older-adults' | 'high-risk'

/**
 * Overall glycemic control assessment based on TIR metrics.
 */
export type TIRAssessment = 'excellent' | 'good' | 'needs improvement' | 'concerning'

/**
 * Detailed metrics for a single glucose range.
 * Provides percentage, duration, count, and average value for clinical analysis.
 */
export interface RangeMetrics {
  /** Percentage of readings in this range (0-100) */
  readonly percentage: number
  /** Total duration in this range (minutes) */
  readonly duration: number
  /** Count of readings in this range */
  readonly readingCount: number
  /** Average glucose value in this range (mg/dL or mmol/L) */
  readonly averageValue: number | null
}

/**
 * Assessment of whether TIR metrics meet clinical targets.
 * Based on International Consensus on Time in Range (2019).
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export interface TargetAssessment {
  /** TIR ≥70% for standard population, ≥50% for older adults */
  readonly tirMeetsGoal: boolean
  /** TBR Level 1 <4% for standard, <1% for older adults */
  readonly tbrLevel1Safe: boolean
  /** TBR Level 2 <1% for standard, <0.5% for older adults */
  readonly tbrLevel2Safe: boolean
  /** TAR Level 1 <25% (all populations) */
  readonly tarLevel1Acceptable: boolean
  /** TAR Level 2 <5% (all populations) */
  readonly tarLevel2Acceptable: boolean
  /** Overall assessment of glycemic control */
  readonly overallAssessment: TIRAssessment
  /** Clinical recommendations based on metrics */
  readonly recommendations: readonly string[]
}

/**
 * Summary statistics for TIR calculation.
 */
export interface TIRSummary {
  /** Total number of glucose readings analyzed */
  readonly totalReadings: number
  /** Total duration of data analyzed (minutes) */
  readonly totalDuration: number
  /** Data quality assessment */
  readonly dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

/**
 * Complete Enhanced Time-in-Range result.
 * Provides detailed breakdown across five clinical glucose ranges per International Consensus 2019.
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */
export interface EnhancedTIRResult {
  /** Very Low: <54 mg/dL (3.0 mmol/L) - Level 2 Hypoglycemia */
  readonly veryLow: RangeMetrics
  /** Low: 54-69 mg/dL (3.0-3.8 mmol/L) - Level 1 Hypoglycemia */
  readonly low: RangeMetrics
  /** In Range: 70-180 mg/dL (3.9-10.0 mmol/L) - Target Range */
  readonly inRange: RangeMetrics
  /** High: 181-250 mg/dL (10.1-13.9 mmol/L) - Level 1 Hyperglycemia */
  readonly high: RangeMetrics
  /** Very High: >250 mg/dL (>13.9 mmol/L) - Level 2 Hyperglycemia */
  readonly veryHigh: RangeMetrics
  /** Assessment against clinical targets */
  readonly meetsTargets: TargetAssessment
  /** Summary statistics */
  readonly summary: TIRSummary
}

/**
 * Options for Enhanced TIR calculation.
 * Allows customization for different clinical populations and use cases.
 */
export interface EnhancedTIROptions {
  /** Population type for target assessment (default: 'standard') */
  readonly population?: TIRPopulation
  /** Glucose unit for input validation (default: 'mg/dL') */
  readonly unit?: GlucoseUnit
  /** Override for the very low threshold (<54 mg/dL). Value must be provided in mg/dL. */
  readonly veryLowThreshold?: number
  /** Override for the low threshold (54-69 mg/dL). Value must be provided in mg/dL. */
  readonly lowThreshold?: number
  /** Override for the high threshold (181-250 mg/dL). Value must be provided in mg/dL. */
  readonly highThreshold?: number
  /** Override for the very high threshold (>250 mg/dL). Value must be provided in mg/dL. */
  readonly veryHighThreshold?: number
}

/**
 * Pregnancy-specific Time-in-Range result.
 * Uses tighter target range per ADA 2024 guidelines for pregnancy.
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 */
export interface PregnancyTIRResult {
  /** In Range: 63-140 mg/dL (3.5-7.8 mmol/L) */
  readonly inRange: RangeMetrics
  /** Below Range: <63 mg/dL (3.5 mmol/L) */
  readonly belowRange: RangeMetrics
  /** Above Range: >140 mg/dL (7.8 mmol/L) */
  readonly aboveRange: RangeMetrics
  /** Whether metrics meet pregnancy-specific targets (TIR >70%, TBR <4%, TAR <25%) */
  readonly meetsPregnancyTargets: boolean
  /** Clinical recommendations */
  readonly recommendations: readonly string[]
  /** Summary statistics */
  readonly summary: TIRSummary
}

/**
 * Options for Pregnancy TIR calculation.
 */
export interface PregnancyTIROptions {
  /** Glucose unit for input validation (default: 'mg/dL') */
  readonly unit?: GlucoseUnit
}
