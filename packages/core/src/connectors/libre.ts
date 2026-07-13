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

import { MG_DL, MMOL_L } from '../constants'
import { TimestampError } from '../errors'
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
 *
 * Accepts the raw API value (which may be null/undefined or out of range)
 * and returns 'unknown' for any invalid or unmapped values.
 */
export function normalizeLibreTrend(
  trend: number | null | undefined
): CGMTrend {
  if (trend == null) {
    return 'unknown'
  }

  // LibreTrendValue is defined as 1–5; anything else is treated as unknown.
  if (trend < 1 || trend > 5) {
    return 'unknown'
  }

  return LIBRE_TREND_MAP[trend as LibreTrendValue] ?? 'unknown'
}

/**
 * Converts a single Libre LinkUp entry into a NormalizedCGMReading.
 *
 * @param entry - Raw Libre LinkUp entry
 * @returns Normalized reading compatible with all `@glucoseiq/core` analytics functions
 * @throws {Error} If the timestamp cannot be parsed
 */
export function normalizeLibreEntry(
  entry: LibreLinkUpEntry
): NormalizedCGMReading {
  const parsed = Date.parse(entry.Timestamp)
  if (isNaN(parsed)) {
    throw new TimestampError(`Unable to parse Libre timestamp: ${entry.Timestamp}`)
  }

  const timestamp = new Date(parsed).toISOString()

  // Unit handling: prefer the explicit mg/dL field; otherwise honor the
  // account's display-unit flag (0 = mmol/L). Legacy payloads with neither
  // field remain mg/dL for backward compatibility.
  const nativeIsMmol = entry.GlucoseUnits === 0
  if (entry.ValueInMgPerDl !== undefined) {
    return {
      value: entry.ValueInMgPerDl,
      unit: MG_DL,
      ...(nativeIsMmol ? { nativeUnit: MMOL_L } : {}),
      timestamp,
      trend: normalizeLibreTrend(entry.TrendArrow),
      source: 'libre',
      dedupKey: `libre:${timestamp}`,
    }
  }
  return {
    value: entry.Value,
    unit: nativeIsMmol ? MMOL_L : MG_DL,
    timestamp,
    trend: normalizeLibreTrend(entry.TrendArrow),
    source: 'libre',
    dedupKey: `libre:${timestamp}`,
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
