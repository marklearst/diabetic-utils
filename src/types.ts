// @file src/types.ts
// Unused interfaces (A1CReading, TIROptions, A1CResult, GMIResult, GlucoseStatsOptions, GlucoseStats) were removed in v1.1.0 cleanup. Restore from v1.1.0 if needed in the future.

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
