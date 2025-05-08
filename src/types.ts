// @file src/types.ts

import { MG_DL, MMOL_L } from './constants'

/**
 * Supported glucose units.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export type GlucoseUnit = typeof MG_DL | typeof MMOL_L

/**
 * All allowed glucose units.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export const AllowedGlucoseUnits: GlucoseUnit[] = [MG_DL, MMOL_L]

/**
 * Represents a single glucose reading with value, unit, and timestamp.
 * @see https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/
 */
export interface GlucoseReading {
  readonly value: number
  readonly unit: GlucoseUnit
  readonly timestamp: string // ISO 8601
}

/**
 * Result of a Time-in-Range (TIR) calculation.
 * @see https://care.diabetesjournals.org/content/42/8/1593
 */
export interface TIRResult {
  inRange: number
  belowRange: number
  aboveRange: number
}

/**
 * Options for estimating GMI (Glucose Management Indicator).
 * @see https://diatribe.org/glucose-management-indicator-gmi
 */
export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}

/**
 * Options for Time-in-Range (TIR) calculations.
 */
export interface TIROptions {
  readings: GlucoseReading[]
  unit: GlucoseUnit
  range: [number, number]
}

/**
 * Represents a single A1C reading with value and date.
 */
export interface A1CReading {
  value: number
  date: string // ISO 8601 date string
}

/**
 * Options for calculating glucose statistics.
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
