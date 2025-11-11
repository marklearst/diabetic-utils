// @file src/tir-enhanced.ts

import type {
  GlucoseReading,
  EnhancedTIRResult,
  EnhancedTIROptions,
  RangeMetrics,
  TargetAssessment,
  TIRSummary,
  TIRPopulation,
  TIRAssessment,
  PregnancyTIRResult,
  PregnancyTIROptions,
} from './types'

import {
  TIR_VERY_LOW_THRESHOLD_MGDL,
  TIR_LOW_THRESHOLD_MGDL,
  TIR_HIGH_THRESHOLD_MGDL,
  TIR_VERY_HIGH_THRESHOLD_MGDL,
  TIR_GOAL_STANDARD,
  TBR_LEVEL1_GOAL,
  TBR_LEVEL2_GOAL,
  TAR_LEVEL1_GOAL,
  TAR_LEVEL2_GOAL,
  TIR_GOAL_OLDER_ADULTS,
  TBR_LEVEL1_GOAL_OLDER_ADULTS,
  TBR_LEVEL2_GOAL_OLDER_ADULTS,
  PREGNANCY_TARGET_LOW_MGDL,
  PREGNANCY_TARGET_HIGH_MGDL,
  PREGNANCY_TARGET_LOW_MMOLL,
  PREGNANCY_TARGET_HIGH_MMOLL,
  MGDL_MMOLL_CONVERSION,
  MG_DL,
} from './constants'

/**
 * Offset for exclusive boundary classification.
 * Used to ensure boundary values are correctly excluded from ranges.
 */
const BOUNDARY_EPSILON = 0.01

/**
 * Glucose reading with normalized value in target unit.
 *
 * @internal
 */
type NormalizedReading = GlucoseReading & { normalizedValue: number }

/**
 * Calculates Enhanced Time-in-Range metrics per International Consensus 2019.
 *
 * Provides detailed breakdown of glucose readings across five clinical ranges:
 * - Very Low (<54 mg/dL / 3.0 mmol/L): Level 2 Hypoglycemia
 * - Low (54-69 mg/dL / 3.0-3.8 mmol/L): Level 1 Hypoglycemia
 * - In Range (70-180 mg/dL / 3.9-10.0 mmol/L): Target Range
 * - High (181-250 mg/dL / 10.1-13.9 mmol/L): Level 1 Hyperglycemia
 * - Very High (>250 mg/dL / >13.9 mmol/L): Level 2 Hyperglycemia
 *
 * @param readings - Array of glucose readings with timestamp, value, and unit
 * @param options - Optional configuration for thresholds and population type
 * @returns Enhanced TIR result with detailed metrics and target assessment
 *
 * @example
 * ```typescript
 * const readings: GlucoseReading[] = [
 *   { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
 *   { value: 95, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
 *   // ... more readings
 * ];
 * const result = calculateEnhancedTIR(readings);
 * console.log(`TIR: ${result.inRange.percentage}%`);
 * console.log(`Meets targets: ${result.meetsTargets.tirMeetsGoal}`);
 * ```
 *
 * @throws {Error} If readings array is empty
 * @throws {Error} If readings contain invalid glucose values
 *
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 *
 * @remarks
 * - Requires minimum 24 hours of data for meaningful results
 * - Clinical targets: TIR ≥70%, TBR Level 1 <4%, TBR Level 2 <1%, TAR Level 1 <25%, TAR Level 2 <5%
 * - For clinical use, verify data quality and sensor accuracy
 * - Readings are assumed to be evenly distributed for duration calculations
 *
 * @category Enhanced TIR
 * @public
 */
export function calculateEnhancedTIR(
  readings: GlucoseReading[],
  options?: EnhancedTIROptions
): EnhancedTIRResult {
  // Validate input
  if (readings.length === 0) {
    throw new Error('Cannot calculate Enhanced TIR: readings array is empty')
  }

  const population: TIRPopulation = options?.population ?? 'standard'

  const veryLowThreshold =
    options?.veryLowThreshold ?? TIR_VERY_LOW_THRESHOLD_MGDL
  const lowThreshold = options?.lowThreshold ?? TIR_LOW_THRESHOLD_MGDL
  const highThreshold = options?.highThreshold ?? TIR_HIGH_THRESHOLD_MGDL
  const veryHighThreshold =
    options?.veryHighThreshold ?? TIR_VERY_HIGH_THRESHOLD_MGDL

  // Convert all readings to mg/dL for consistent thresholding
  const normalizedReadings: NormalizedReading[] = readings.map((reading) => {
    const value =
      reading.unit === MG_DL
        ? reading.value
        : reading.value * MGDL_MMOLL_CONVERSION
    return { ...reading, normalizedValue: value }
  })

  // Validate glucose values
  validateNormalizedReadings(normalizedReadings, 600)

  // Calculate metrics for each range
  // Note: Upper bounds are INCLUSIVE for correct boundary classification
  const veryLow = calculateRangeMetrics(
    normalizedReadings,
    0,
    veryLowThreshold
  )
  const low = calculateRangeMetrics(
    normalizedReadings,
    veryLowThreshold,
    lowThreshold
  )
  const inRange = calculateRangeMetrics(
    normalizedReadings,
    lowThreshold,
    highThreshold,
    true // inclusive upper bound
  )
  const high = calculateRangeMetrics(
    normalizedReadings,
    highThreshold + BOUNDARY_EPSILON, // exclusive lower bound
    veryHighThreshold,
    true // inclusive upper bound
  )
  const veryHigh = calculateRangeMetrics(
    normalizedReadings,
    veryHighThreshold + BOUNDARY_EPSILON, // exclusive lower bound
    Infinity,
    true
  )

  // Calculate summary
  const summary = calculateSummary(readings)

  // Assess targets
  const meetsTargets = assessTargets(
    { veryLow, low, inRange, high, veryHigh },
    population
  )

  return {
    veryLow,
    low,
    inRange,
    high,
    veryHigh,
    meetsTargets,
    summary,
  }
}

/**
 * Calculates Pregnancy-specific Time-in-Range metrics per ADA 2024 guidelines.
 *
 * Uses tighter target range for pregnancy: 63-140 mg/dL (3.5-7.8 mmol/L).
 * Clinical targets: TIR >70%, TBR <4% (Level 1) and <1% (Level 2), TAR <25%.
 *
 * @param readings - Array of glucose readings with timestamp, value, and unit
 * @param options - Optional configuration for glucose unit
 * @returns Pregnancy TIR result with target assessment and recommendations
 *
 * @example
 * ```typescript
 * const readings: GlucoseReading[] = [
 *   { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
 *   // ... more readings
 * ];
 * const result = calculatePregnancyTIR(readings);
 * console.log(`TIR: ${result.inRange.percentage}%`);
 * console.log(`Meets pregnancy targets: ${result.meetsPregnancyTargets}`);
 * ```
 *
 * @throws {Error} If readings array is empty
 * @throws {Error} If readings contain invalid glucose values
 *
 * @see {@link https://diabetesjournals.org/care/article/47/Supplement_1/S282 | ADA Standards of Care (2024)}
 *
 * @remarks
 * - Target range: 63-140 mg/dL (3.5-7.8 mmol/L)
 * - Tighter targets reduce risk of maternal and fetal complications
 * - Should be used in conjunction with clinical assessment
 * - Applies to Type 1, Type 2, and gestational diabetes during pregnancy
 *
 * @category Pregnancy TIR
 * @public
 */
export function calculatePregnancyTIR(
  readings: GlucoseReading[],
  options?: PregnancyTIROptions
): PregnancyTIRResult {
  // Validate input
  if (readings.length === 0) {
    throw new Error('Cannot calculate Pregnancy TIR: readings array is empty')
  }

  // Determine thresholds based on either supplied unit preference or predominant unit
  const preferredUnit = options?.unit
  const mgdlCount = readings.filter((r) => r.unit === MG_DL).length
  const useMgdlThresholds = preferredUnit
    ? preferredUnit === MG_DL
    : mgdlCount >= readings.length / 2

  // Use unit-specific thresholds to avoid floating point conversion issues
  const lowThreshold = useMgdlThresholds
    ? PREGNANCY_TARGET_LOW_MGDL
    : PREGNANCY_TARGET_LOW_MMOLL
  const highThreshold = useMgdlThresholds
    ? PREGNANCY_TARGET_HIGH_MGDL
    : PREGNANCY_TARGET_HIGH_MMOLL

  // Convert all readings to the appropriate unit for thresholding
  const normalizedReadings: NormalizedReading[] = readings.map((reading) => {
    let normalizedValue: number
    if (useMgdlThresholds) {
      normalizedValue =
        reading.unit === MG_DL
          ? reading.value
          : reading.value * MGDL_MMOLL_CONVERSION
    } else {
      normalizedValue =
        reading.unit === MG_DL
          ? reading.value / MGDL_MMOLL_CONVERSION
          : reading.value
    }
    return { ...reading, normalizedValue }
  })

  // Validate glucose values
  const maxValue = useMgdlThresholds ? 600 : 33.3
  validateNormalizedReadings(normalizedReadings, maxValue)

  // Calculate metrics for pregnancy ranges using unit-specific thresholds
  const belowRange = calculateRangeMetrics(
    normalizedReadings,
    0,
    lowThreshold
  )
  const inRange = calculateRangeMetrics(
    normalizedReadings,
    lowThreshold,
    highThreshold,
    true // inclusive upper bound
  )
  const aboveRange = calculateRangeMetrics(
    normalizedReadings,
    highThreshold + BOUNDARY_EPSILON, // exclusive lower bound
    Infinity,
    true
  )

  // Calculate summary
  const summary = calculateSummary(readings)

  // Assess pregnancy targets
  const meetsPregnancyTargets =
    inRange.percentage >= TIR_GOAL_STANDARD && // TIR >70%
    belowRange.percentage < TBR_LEVEL1_GOAL && // TBR <4%
    aboveRange.percentage < TAR_LEVEL1_GOAL // TAR <25%

  // Generate recommendations
  const recommendations = generatePregnancyRecommendations({
    belowRange,
    inRange,
    aboveRange,
  })

  return {
    belowRange,
    inRange,
    aboveRange,
    meetsPregnancyTargets,
    recommendations,
    summary,
  }
}

/**
 * Validates normalized glucose values are within acceptable range.
 *
 * @param readings - Normalized readings to validate
 * @param maxValue - Maximum acceptable value (600 mg/dL or 33.3 mmol/L)
 * @throws {Error} If any reading is invalid
 *
 * @internal
 */
function validateNormalizedReadings(
  readings: NormalizedReading[],
  maxValue: number
): void {
  for (const reading of readings) {
    if (
      reading.normalizedValue < 0 ||
      reading.normalizedValue > maxValue ||
      !Number.isFinite(reading.normalizedValue)
    ) {
      const unitSuffix = maxValue === 600 ? ' mg/dL' : ''
      throw new Error(
        `Invalid glucose value: ${reading.value} ${reading.unit} (normalized: ${reading.normalizedValue}${unitSuffix})`
      )
    }
  }
}

/**
 * Estimates average interval between readings in minutes.
 *
 * @param readings - Array of glucose readings
 * @returns Average interval in minutes (defaults to 5 for CGM standard)
 *
 * @internal
 */
function estimateReadingInterval(readings: GlucoseReading[]): number {
  if (readings.length < 2) {
    return 5 // Default: 5-minute intervals (CGM standard)
  }

  const timestamps = readings.map((r) => new Date(r.timestamp).getTime())
  const intervals: number[] = []

  for (let i = 1; i < Math.min(10, timestamps.length); i++) {
    intervals.push(timestamps[i] - timestamps[i - 1])
  }

  const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return avgIntervalMs / (1000 * 60)
}

/**
 * Calculates detailed metrics for a specific glucose range.
 *
 * @param readings - Normalized glucose readings with value in mg/dL
 * @param lowerBound - Lower bound of range (mg/dL, inclusive)
 * @param upperBound - Upper bound of range (mg/dL)
 * @param inclusiveUpper - Whether upper bound is inclusive (default: false)
 * @returns Range metrics with percentage, duration, count, and average
 *
 * @internal
 */
function calculateRangeMetrics(
  readings: NormalizedReading[],
  lowerBound: number,
  upperBound: number,
  inclusiveUpper = false
): RangeMetrics {
  // Filter readings in this range
  const inRange = readings.filter((r) => {
    const aboveLower = r.normalizedValue >= lowerBound
    const belowUpper = inclusiveUpper
      ? r.normalizedValue <= upperBound
      : r.normalizedValue < upperBound
    return aboveLower && belowUpper
  })

  const readingCount = inRange.length
  const percentage = (readingCount / readings.length) * 100

  // Calculate duration (assumes evenly distributed readings)
  const avgIntervalMinutes = estimateReadingInterval(readings)
  const duration = readingCount * avgIntervalMinutes

  // Calculate average value in this range
  const averageValue =
    readingCount > 0
      ? inRange.reduce((sum, r) => sum + r.normalizedValue, 0) / readingCount
      : null

  return {
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    duration: Math.round(duration),
    readingCount,
    averageValue: averageValue ? Math.round(averageValue) : null,
  }
}

/**
 * Calculates summary statistics for TIR result.
 *
 * @param readings - Array of glucose readings
 * @returns Summary with total readings, duration, and data quality
 *
 * @internal
 */
function calculateSummary(readings: GlucoseReading[]): TIRSummary {
  const totalReadings = readings.length

  // Calculate total duration
  const avgIntervalMinutes = estimateReadingInterval(readings)
  const totalDuration = totalReadings * avgIntervalMinutes

  // Assess data quality based on number of days
  const daysOfData = totalDuration / (60 * 24)
  let dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
  if (daysOfData >= 14) {
    dataQuality = 'excellent'
  } else if (daysOfData >= 7) {
    dataQuality = 'good'
  } else if (daysOfData >= 3) {
    dataQuality = 'fair'
  } else {
    dataQuality = 'poor'
  }

  return {
    totalReadings,
    totalDuration: Math.round(totalDuration),
    dataQuality,
  }
}

/**
 * Selects population-specific clinical goals.
 *
 * @param population - Population type
 * @returns Object with TIR and TBR goals for the population
 *
 * @internal
 */
function getPopulationGoals(population: TIRPopulation) {
  const isStandard = population === 'standard'
  return {
    tirGoal: isStandard ? TIR_GOAL_STANDARD : TIR_GOAL_OLDER_ADULTS,
    tbrLevel1Goal: isStandard ? TBR_LEVEL1_GOAL : TBR_LEVEL1_GOAL_OLDER_ADULTS,
    tbrLevel2Goal: isStandard ? TBR_LEVEL2_GOAL : TBR_LEVEL2_GOAL_OLDER_ADULTS,
  }
}

/**
 * Assesses whether TIR metrics meet clinical targets.
 *
 * @param ranges - Calculated range metrics
 * @param population - Population type for target selection
 * @returns Target assessment with goals and recommendations
 *
 * @internal
 */
function assessTargets(
  ranges: {
    veryLow: RangeMetrics
    low: RangeMetrics
    inRange: RangeMetrics
    high: RangeMetrics
    veryHigh: RangeMetrics
  },
  population: TIRPopulation
): TargetAssessment {
  // Select goals based on population
  const { tirGoal, tbrLevel1Goal, tbrLevel2Goal } = getPopulationGoals(population)

  // Assess each metric
  const tirMeetsGoal = ranges.inRange.percentage >= tirGoal
  const tbrLevel1Safe = ranges.low.percentage < tbrLevel1Goal
  const tbrLevel2Safe = ranges.veryLow.percentage < tbrLevel2Goal
  const tarLevel1Acceptable = ranges.high.percentage < TAR_LEVEL1_GOAL
  const tarLevel2Acceptable = ranges.veryHigh.percentage < TAR_LEVEL2_GOAL

  // Determine overall assessment
  let overallAssessment: TIRAssessment
  const criticalIssues = !tbrLevel2Safe || !tarLevel2Acceptable

  // TAR Level 1 slightly over (26-30%) is a minor issue, not major
  const minorTARIssue = !tarLevel1Acceptable && ranges.high.percentage <= 30

  // Major issues: hypoglycemia or poor TIR (but not minor TAR overage)
  const majorIssues = !tbrLevel1Safe || !tirMeetsGoal

  if (criticalIssues) {
    overallAssessment = 'concerning'
  } else if (majorIssues) {
    overallAssessment = 'needs improvement'
  } else if (
    ranges.inRange.percentage >= tirGoal + 10 &&
    ranges.veryLow.percentage < 0.5
  ) {
    overallAssessment = 'excellent'
  } else if (minorTARIssue && tirMeetsGoal && tbrLevel1Safe) {
    // Minor TAR overage (25-30%) but TIR good and no hypos - still "good"
    overallAssessment = 'good'
  } else {
    overallAssessment = 'good'
  }

  // Generate recommendations
  const recommendations = generateRecommendations({
    ranges,
    tirMeetsGoal,
    tbrLevel1Safe,
    tbrLevel2Safe,
    tarLevel1Acceptable,
    tarLevel2Acceptable,
    population,
  })

  return {
    tirMeetsGoal,
    tbrLevel1Safe,
    tbrLevel2Safe,
    tarLevel1Acceptable,
    tarLevel2Acceptable,
    overallAssessment,
    recommendations,
  }
}

/**
 * Generates clinical recommendations based on TIR metrics.
 *
 * @param params - Assessment parameters
 * @returns Array of clinical recommendations
 *
 * @internal
 */
function generateRecommendations(params: {
  ranges: {
    veryLow: RangeMetrics
    low: RangeMetrics
    inRange: RangeMetrics
    high: RangeMetrics
    veryHigh: RangeMetrics
  }
  tirMeetsGoal: boolean
  tbrLevel1Safe: boolean
  tbrLevel2Safe: boolean
  tarLevel1Acceptable: boolean
  tarLevel2Acceptable: boolean
  population: TIRPopulation
}): readonly string[] {
  const recommendations: string[] = []

  // Critical recommendations first
  if (!params.tbrLevel2Safe) {
    recommendations.push(
      `CRITICAL: Level 2 hypoglycemia (${params.ranges.veryLow.percentage.toFixed(
        1
      )}%) exceeds safe limit. Consult healthcare provider immediately to reduce hypoglycemia risk.`
    )
  }

  if (!params.tarLevel2Acceptable) {
    recommendations.push(
      `URGENT: Level 2 hyperglycemia (${params.ranges.veryHigh.percentage.toFixed(
        1
      )}%) exceeds acceptable limit. Review treatment plan with healthcare provider.`
    )
  }

  // Important recommendations (check these AFTER critical issues)
  if (!params.tbrLevel1Safe && params.tbrLevel2Safe) {
    recommendations.push(
      `Level 1 hypoglycemia (${params.ranges.low.percentage.toFixed(
        1
      )}%) is elevated. Consider adjusting insulin doses or carbohydrate intake.`
    )
  }

  if (!params.tarLevel1Acceptable && params.tarLevel2Acceptable) {
    recommendations.push(
      `Level 1 hyperglycemia (${params.ranges.high.percentage.toFixed(
        1
      )}%) is elevated. Review meal planning and medication timing.`
    )
  }

  if (!params.tirMeetsGoal && params.tbrLevel1Safe && params.tbrLevel2Safe) {
    recommendations.push(
      `Time-in-range (${params.ranges.inRange.percentage.toFixed(
        1
      )}%) is below target. Work with healthcare team to optimize glycemic control.`
    )
  }

  // Positive feedback (if no critical issues)
  if (
    params.tirMeetsGoal &&
    params.tbrLevel1Safe &&
    params.tbrLevel2Safe &&
    params.tarLevel1Acceptable &&
    params.tarLevel2Acceptable
  ) {
    recommendations.push(
      'Excellent glycemic control! All metrics meet clinical targets. Continue current management plan.'
    )
    /* c8 ignore start -- defensive fallback when no recommendations were generated */
  } else if (
    params.tbrLevel2Safe &&
    params.tarLevel2Acceptable &&
    recommendations.length === 0
  ) {
    recommendations.push(
      'Glycemic control shows room for improvement. Work with healthcare team to optimize management.'
    )
  }
  /* c8 ignore stop */

  // Population-specific guidance
  if (
    params.population === 'older-adults' ||
    params.population === 'high-risk'
  ) {
    recommendations.push(
      'For older/high-risk populations, hypoglycemia prevention is prioritized. Lower TIR targets are acceptable.'
    )
  }

  return recommendations
}

/**
 * Generates pregnancy-specific recommendations.
 *
 * @param ranges - Pregnancy range metrics
 * @returns Array of pregnancy-specific recommendations
 *
 * @internal
 */
function generatePregnancyRecommendations(ranges: {
  belowRange: RangeMetrics
  inRange: RangeMetrics
  aboveRange: RangeMetrics
}): readonly string[] {
  const recommendations: string[] = []

  // Critical hypoglycemia
  if (ranges.belowRange.percentage >= TBR_LEVEL1_GOAL) {
    recommendations.push(
      `CRITICAL: Time below range (${ranges.belowRange.percentage.toFixed(
        1
      )}%) exceeds safe limit for pregnancy. Contact healthcare provider immediately.`
    )
  }

  // Hyperglycemia
  if (ranges.aboveRange.percentage >= TAR_LEVEL1_GOAL) {
    recommendations.push(
      `URGENT: Time above range (${ranges.aboveRange.percentage.toFixed(
        1
      )}%) exceeds acceptable limit for pregnancy. Review treatment plan.`
    )
  }

  // TIR below goal
  if (ranges.inRange.percentage < TIR_GOAL_STANDARD) {
    recommendations.push(
      `Time-in-range (${ranges.inRange.percentage.toFixed(
        1
      )}%) is below pregnancy target of 70%. Work with healthcare team to optimize control.`
    )
  }

  // Meeting targets
  if (
    ranges.inRange.percentage >= TIR_GOAL_STANDARD &&
    ranges.belowRange.percentage < TBR_LEVEL1_GOAL &&
    ranges.aboveRange.percentage < TAR_LEVEL1_GOAL
  ) {
    recommendations.push(
      'Excellent glycemic control for pregnancy! All metrics meet clinical targets. Continue current management.'
    )
    /* c8 ignore start -- defensive fallback when no recommendations were generated */
  } else if (recommendations.length === 0) {
    recommendations.push(
      'Work with healthcare team to optimize glycemic control for pregnancy.'
    )
  }
  /* c8 ignore stop */

  // General pregnancy guidance (always include)
  recommendations.push(
    'Pregnancy requires tighter glucose control. Target range is 63-140 mg/dL (3.5-7.8 mmol/L).'
  )

  return recommendations
}
