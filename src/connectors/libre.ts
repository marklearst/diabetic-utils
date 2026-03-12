/**
 * @file src/connectors/libre.ts
 *
 * Pure transformation adapter for Libre LinkUp API payloads.
 * Maps raw Libre entries into NormalizedCGMReading objects.
 * Does NOT handle authentication — use with any Libre LinkUp client library.
 *
 * @see https://www.npmjs.com/package/librelinkup-api-client
 * @see https://www.npmjs.com/package/libre-client
 */

import { MG_DL } from '../constants'
import type {
  LibreLinkUpEntry,
  LibreTrendValue,
  NormalizedCGMReading,
  CGMTrend,
} from './types'

const LIBRE_TREND_MAP: Record<LibreTrendValue, CGMTrend> = {
  1: 'rapidFalling',
  2: 'falling',
  3: 'flat',
  4: 'rising',
  5: 'rapidRising',
}

/**
 * Normalizes a Libre LinkUp numeric trend value into a canonical CGMTrend.
 */
export function normalizeLibreTrend(trend: LibreTrendValue): CGMTrend {
  return LIBRE_TREND_MAP[trend] ?? 'unknown'
}

/**
 * Converts a single Libre LinkUp entry into a NormalizedCGMReading.
 *
 * @param entry - Raw Libre LinkUp entry
 * @returns Normalized reading compatible with all diabetic-utils analytics functions
 * @throws {Error} If the timestamp cannot be parsed
 */
export function normalizeLibreEntry(
  entry: LibreLinkUpEntry
): NormalizedCGMReading {
  const parsed = Date.parse(entry.Timestamp)
  if (isNaN(parsed)) {
    throw new Error(`Unable to parse Libre timestamp: ${entry.Timestamp}`)
  }

  return {
    value: entry.Value,
    unit: MG_DL,
    timestamp: new Date(parsed).toISOString(),
    trend: normalizeLibreTrend(entry.TrendArrow),
    source: 'libre',
  }
}

/**
 * Converts an array of Libre LinkUp entries into NormalizedCGMReadings.
 *
 * @param entries - Raw Libre LinkUp entries from any Libre client library
 * @returns Array of normalized readings, sorted chronologically
 */
export function normalizeLibreEntries(
  entries: LibreLinkUpEntry[]
): NormalizedCGMReading[] {
  return entries
    .map(normalizeLibreEntry)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
}
