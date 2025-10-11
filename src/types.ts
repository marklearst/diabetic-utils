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
 * Advanced Time-in-Range (TIR) result with clinical level 1/2 breakdowns.
 * Provides the percentage of readings falling into each ADA-recommended
 * glucose band for nonpregnant adults with type 1 or type 2 diabetes.
 * @see https://care.diabetesjournals.org/content/44/1/17
 */
export interface AdvancedTIRResult {
  veryLow: number
  low: number
  inRange: number
  high: number
  veryHigh: number
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
