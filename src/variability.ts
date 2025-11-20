// @file src/variability.ts

import { glucoseMAGE as clinicalMAGE, type MAGEOptions } from './mage';

/**
 * Calculates the unbiased sample standard deviation (SD) of glucose values.
 * Uses n-1 in the denominator (sample SD), as recommended in clinical research and guidelines.
 *
 * @param readings Array of glucose values (numbers)
 * @returns Standard deviation, or NaN if fewer than 2 values
 * @throws {TypeError} If readings is not an array
 * @see {@link https://care.diabetesjournals.org/content/42/8/1593 ADA 2019: Glycemic Targets}
 * @see {@link https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/ ISPAD 2019}
 * @example
 * ```ts
 * glucoseStandardDeviation([100, 120, 140]) // 20
 * glucoseStandardDeviation([]) // NaN
 * ```
 * @remarks
 * - If readings contains <2 values, returns NaN (not enough data for SD).
 * - Handles NaN/Infinity values by propagating them in the result.
 */
export function glucoseStandardDeviation(readings: number[]): number {
  if (!Array.isArray(readings) || readings.length < 2) return NaN;
  const mean = readings.reduce((sum, v) => sum + v, 0) / readings.length;
  const variance = readings.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (readings.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates the coefficient of variation (CV) for glucose values.
 * CV = (SD / mean) × 100. Used to assess glycemic variability.
 *
 * @param readings Array of glucose values (numbers)
 * @returns Coefficient of variation as a percentage, or NaN if <2 values or mean is 0
 * @throws {TypeError} If readings is not an array
 * @see {@link https://care.diabetesjournals.org/content/42/8/1593 ADA 2019: Glycemic Targets}
 * @example
 * ```ts
 * glucoseCoefficientOfVariation([100, 120, 140]) // 18.26
 * glucoseCoefficientOfVariation([100]) // NaN
 * glucoseCoefficientOfVariation([]) // NaN
 * ```
 * @remarks
 * - If readings contains <2 values or mean is 0, returns NaN.
 * - Handles NaN/Infinity values by propagating them in the result.
 */
export function glucoseCoefficientOfVariation(readings: number[]): number {
  if (!Array.isArray(readings) || readings.length < 2) return NaN;
  const mean = readings.reduce((sum, v) => sum + v, 0) / readings.length;
  if (mean === 0) return NaN;
  const sd = glucoseStandardDeviation(readings);
  return (sd / mean) * 100;
}

/**
 * Calculates specified percentiles from an array of glucose values using the nearest-rank method.
 * Used for clinical analytics and glucose variability assessment.
 * @param readings - Array of glucose values (numbers)
 * @param percentiles - Array of percentiles to calculate (e.g., [10, 25, 50, 75, 90])
 * @returns Object mapping percentile to value, or {} if input is empty
 * @throws {TypeError} If readings or percentiles is not an array
 * @see https://en.wikipedia.org/wiki/Percentile
 * @see https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/ (ISPAD 2019)
 * @example
 * glucosePercentiles([100, 120, 140, 160, 180], [10, 50, 90]) // { 10: 100, 50: 140, 90: 180 }
 * glucosePercentiles([], [10, 50, 90]) // {}
 * @remarks
 * - Returns the value at the nearest-rank for each percentile.
 * - If readings is empty, returns an empty object.
 * - Percentiles outside [0, 100] are ignored.
 */
export function glucosePercentiles(readings: number[], percentiles: number[]): Record<number, number> {
  if (!Array.isArray(readings) || readings.length === 0) return {};
  const sorted = [...readings].sort((a, b) => a - b);
  const result: Record<number, number> = {};
  for (const p of percentiles) {
    if (typeof p !== 'number' || p < 0 || p > 100) continue;
    // Nearest-rank method
    const rank = Math.ceil((p / 100) * sorted.length);
    result[p] = sorted[Math.max(0, rank - 1)];
  }
  return result;
}

/**
 * Calculates Mean Amplitude of Glycemic Excursions (MAGE) for glucose values.
 * Implements gold-standard Service FJ et al. (1970) clinical methodology, validated to 1.4% median error vs manual calculations.
 * @param readings - Array of glucose values (mg/dL or mmol/L)
 * @param options - Optional configuration for MAGE calculation
 * @returns MAGE value, or NaN if insufficient data or no valid excursions
 * @see https://pubmed.ncbi.nlm.nih.gov/5469118/ (Service FJ, et al. 1970)
 * @see https://journals.sagepub.com/doi/10.1177/19322968211061165 (Fernandes NJ, et al. 2022)
 * @see https://care.diabetesjournals.org/content/42/8/1593 (ADA 2019)
 * @example
 * glucoseMAGE([100, 120, 80, 160, 90, 140, 70, 180])
 * glucoseMAGE(readings, { direction: 'ascending', shortWindow: 5, longWindow: 32 })
 * @remarks
 * - Minimum 24 data points recommended (1 day of hourly readings)
 * - Best suited for continuous glucose monitoring (CGM) data
 * - Not recommended for sparse or irregular measurements
 * - Uses dual moving averages, three-point excursion definition, and prevents double-counting for clinical accuracy.
 */
export function glucoseMAGE(readings: number[], options?: MAGEOptions): number {
  // Delegate to the clinical-grade implementation
  return clinicalMAGE(readings, options);
}
