// @file src/formatters.ts

import { GlucoseUnit } from './types'

/**
 * Formats a clinical glucose value with unit and optional rounding.
 * Used for clinical reporting, charting, and data export.
 * @param val - Glucose value (number)
 * @param unit - Glucose unit ('mg/dL' or 'mmol/L')
 * @param options - Formatting options: { digits?: number; suffix?: boolean } (default: { digits: 0, suffix: true })
 * @returns Formatted glucose string (e.g., '5.5 mmol/L', '120 mg/dL')
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
 * Formats a value as a clinical percentage string (e.g., '85.0%').
 * Used for reporting TIR, CV, and other clinical metrics.
 * @param val - Value to format (fraction or percent)
 * @param digits - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., '85.0%')
 */
export function formatPercentage(val: number, digits = 1): string {
  return `${val.toFixed(digits)}%`
}

/**
 * Formats a UTC ISO 8601 timestamp to a local-readable date/time string.
 * Used for clinical charting, logs, and reports. Supports optional IANA time zone.
 * @param iso - ISO 8601 timestamp string (e.g., '2024-03-20T10:00:00Z')
 * @param timeZone - Optional IANA time zone (e.g., 'America/New_York')
 * @returns Localized date/time string (e.g., 'Mar 20, 2024, 06:00 AM')
 * @throws {RangeError} If the ISO string is invalid or cannot be parsed
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
