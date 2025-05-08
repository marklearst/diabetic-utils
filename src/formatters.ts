// @file src/formatters.ts

import { GlucoseUnit } from './types'
import { MGDL_MMOLL_CONVERSION } from './constants'

/**
 * Formats glucose with unit and optional rounding.
 * @param val - Glucose value
 * @param unit - Unit of measurement
 * @param options - digits and suffix options
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
 * Formats a number as percentage.
 * @param val - Decimal or percent number
 * @param digits - Decimal places
 */
export function formatPercentage(val: number, digits = 1): string {
  return `${val.toFixed(digits)}%`
}

/**
 * Formats a UTC ISO timestamp to local-readable string.
 * @param iso - ISO timestamp
 * @param timeZone - Optional timezone
 */
export function formatDate(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
