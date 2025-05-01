// @file src/formatters.ts

import { GlucoseUnit } from './types'

/**
 * Formats a glucose value with its unit and optional rounding.
 * @param val - Glucose value to format.
 * @param unit - Unit of measurement (mg/dL or mmol/L).
 * @param options - Formatting options: number of digits and whether to include the unit suffix (default: { digits: 0, suffix: true }).
 * @returns Formatted glucose string, e.g., '5.5 mmol/L' or '120 mg/dL'.
 * @see https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
 */
export function formatGlucose(
  val: number,
  unit: GlucoseUnit,
  options: { digits?: number; suffix?: boolean } = {}
): string {
  const digits = options.digits ?? 0
  const suffix = options.suffix ?? true
  const value = val.toFixed(digits)
  return suffix ? `${value} ${unit}` : value
}

/**
 * Formats a number as a percentage string.
 * @param val - Value to format as a percentage (e.g., 0.85 or 85).
 * @param digits - Number of decimal places (default: 1).
 * @returns Formatted percentage string, e.g., '85.0%'.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
 */
export function formatPercentage(val: number, digits = 1): string {
  return `${val.toFixed(digits)}%`
}

/**
 * Formats a UTC ISO timestamp to a local-readable string.
 * @param iso - ISO 8601 timestamp string (e.g., '2024-03-20T10:00:00Z').
 * @param timeZone - Optional IANA time zone name (e.g., 'America/New_York').
 * @returns Localized date and time string, e.g., 'Mar 20, 2024, 06:00 AM'.
 * @throws {RangeError} If the ISO string is invalid or cannot be parsed by Date.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export function formatDate(iso: string, timeZone?: string): string {
  if (isNaN(Date.parse(iso))) {
    throw new RangeError('Invalid ISO timestamp')
  }
  return new Date(iso).toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
