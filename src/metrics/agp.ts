/**
 * @file src/metrics/agp.ts
 *
 * Aggregate Ambulatory Glucose Profile (AGP) metrics calculator.
 *
 * Computes a comprehensive set of standardized CGM metrics in a single call,
 * returning an object with all Tier 1 metrics from the iglu reference set.
 *
 * @see https://cran.r-project.org/web/packages/iglu/vignettes/metrics_list.html
 */

import type { GlucoseReading } from '../types'
import { MGDL_MMOLL_CONVERSION, MG_DL } from '../constants'
import { glucoseLBGI, glucoseHBGI } from './bgi'
import { calculateADRR } from './adrr'
import { calculateGRADE, type GRADEResult } from './grade'
import { calculateGRI, type GRIInput, type GRIResult } from './gri'
import { calculateJIndex } from './jindex'
import { calculateMODD, type MODDOptions } from './modd'
import { calculateCONGA, type CONGAOptions } from './conga'
import { calculateActivePercent, type ActivePercentResult, type ActivePercentOptions } from './active-percent'
import { calculateEnhancedTIR } from '../tir-enhanced'
import { glucoseStandardDeviation, glucoseCoefficientOfVariation } from '../variability'

/** Options for the aggregate AGP metrics calculation. */
export interface AGPMetricsOptions {
  /** MODD tolerance configuration */
  readonly modd?: MODDOptions
  /** CONGA configuration (hours, tolerance) */
  readonly conga?: CONGAOptions
  /** Active percent configuration (expected interval) */
  readonly activePercent?: ActivePercentOptions
}

/** Comprehensive AGP metrics result. */
export interface AGPMetricsResult {
  /** Mean glucose in mg/dL */
  readonly meanGlucose: number
  /** Standard deviation in mg/dL */
  readonly sd: number
  /** Coefficient of variation (%) */
  readonly cv: number
  /** Low Blood Glucose Index */
  readonly lbgi: number
  /** High Blood Glucose Index */
  readonly hbgi: number
  /** Average Daily Risk Range */
  readonly adrr: number
  /** GRADE score and partitioned components */
  readonly grade: GRADEResult
  /** Glycemia Risk Index */
  readonly gri: GRIResult
  /** J-Index */
  readonly jIndex: number
  /** Mean of Daily Differences (mg/dL) */
  readonly modd: number
  /** Continuous Overall Net Glycemic Action (mg/dL) */
  readonly conga: number
  /** CGM active percent / wear time */
  readonly activePercent: ActivePercentResult
  /** Number of valid readings used */
  readonly totalReadings: number
}

/**
 * Calculates a comprehensive set of AGP metrics from glucose readings.
 *
 * This is a convenience function that computes all Tier 1 metrics in a
 * single call. Individual metric functions are also available for
 * selective computation.
 *
 * @param readings - Array of GlucoseReading objects with timestamps
 * @param options - Optional configuration for individual metrics
 * @returns Comprehensive AGP metrics result
 * @throws {Error} If readings array is empty
 */
export function calculateAGPMetrics(
  readings: GlucoseReading[],
  options?: AGPMetricsOptions
): AGPMetricsResult {
  if (readings.length === 0) {
    throw new Error('Cannot calculate AGP metrics: readings array is empty')
  }

  const mgdlValues = readings.map((r) =>
    r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
  ).filter((v) => Number.isFinite(v) && v > 0)

  /* c8 ignore start -- defensive fallbacks for edge cases where all values filter out */
  const meanGlucose = mgdlValues.length > 0
    ? Math.round((mgdlValues.reduce((s, v) => s + v, 0) / mgdlValues.length) * 10) / 10
    : NaN
  /* c8 ignore stop */

  const sd = glucoseStandardDeviation(mgdlValues)
  const cv = glucoseCoefficientOfVariation(mgdlValues)

  const tir = calculateEnhancedTIR(readings)
  const griInput: GRIInput = {
    veryLowPercent: tir.veryLow.percentage,
    lowPercent: tir.low.percentage,
    highPercent: tir.high.percentage,
    veryHighPercent: tir.veryHigh.percentage,
  }

  return {
    meanGlucose,
    /* c8 ignore start -- sd/cv are always finite when mgdlValues.length >= 2 */
    sd: Number.isFinite(sd) ? Math.round(sd * 10) / 10 : NaN,
    cv: Number.isFinite(cv) ? Math.round(cv * 10) / 10 : NaN,
    /* c8 ignore stop */
    lbgi: glucoseLBGI(mgdlValues),
    hbgi: glucoseHBGI(mgdlValues),
    adrr: calculateADRR(readings),
    grade: calculateGRADE(mgdlValues),
    gri: calculateGRI(griInput),
    jIndex: calculateJIndex(mgdlValues),
    modd: calculateMODD(readings, options?.modd),
    conga: calculateCONGA(readings, options?.conga),
    activePercent: calculateActivePercent(readings, options?.activePercent),
    totalReadings: mgdlValues.length,
  }
}
