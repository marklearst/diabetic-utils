/**
 * @file src/connectors/dexcom.ts
 *
 * Pure transformation adapter for Dexcom Share API payloads.
 * Maps raw Dexcom entries into NormalizedCGMReading objects.
 * Does NOT handle authentication — use with any Dexcom Share client library.
 *
 * @see https://github.com/brettfarrow/cgm.js
 * @see https://www.npmjs.com/package/@diakem/dexcom-api-client
 */

import { MG_DL } from '../constants'
import type {
  DexcomShareEntry,
  DexcomTrendString,
  NormalizedCGMReading,
  CGMTrend,
} from './types'

const DEXCOM_TREND_MAP: Record<DexcomTrendString, CGMTrend> = {
  DoubleUp: 'rapidRising',
  SingleUp: 'rising',
  FortyFiveUp: 'slightlyRising',
  Flat: 'flat',
  FortyFiveDown: 'slightlyFalling',
  SingleDown: 'falling',
  DoubleDown: 'rapidFalling',
  None: 'unknown',
  NotComputable: 'unknown',
  RateOutOfRange: 'unknown',
}

/**
 * Parses a Dexcom date string into an ISO 8601 string.
 *
 * Dexcom Share returns dates in the format `"Date(epochMs)"` or
 * `"/Date(epochMs)/"`. This helper handles both, plus plain ISO strings.
 */
export function parseDexcomDate(raw: string): string {
  const epochMatch = raw.match(/Date\((\d+)\)/)
  if (epochMatch) {
    return new Date(Number(epochMatch[1])).toISOString()
  }
  const parsed = Date.parse(raw)
  if (isNaN(parsed)) {
    throw new Error(`Unable to parse Dexcom date: ${raw}`)
  }
  return new Date(parsed).toISOString()
}

/**
 * Normalizes a Dexcom Share trend string into a canonical CGMTrend.
 */
export function normalizeDexcomTrend(
  trend: DexcomTrendString | (string & {}) | null | undefined
): CGMTrend {
  if (trend == null) {
    return 'unknown'
  }
  return DEXCOM_TREND_MAP[trend as DexcomTrendString] ?? 'unknown'
}

/**
 * Converts a single Dexcom Share entry into a NormalizedCGMReading.
 *
 * @param entry - Raw Dexcom Share entry
 * @returns Normalized reading compatible with all diabetic-utils analytics functions
 * @throws {Error} If the date string cannot be parsed
 */
export function normalizeDexcomEntry(
  entry: DexcomShareEntry
): NormalizedCGMReading {
  return {
    value: entry.Value,
    unit: MG_DL,
    timestamp: parseDexcomDate(entry.WT),
    trend: normalizeDexcomTrend(entry.Trend),
    source: 'dexcom',
    vendorId: entry.ST ?? entry.DT,
  }
}

/**
 * Converts an array of Dexcom Share entries into NormalizedCGMReadings.
 *
 * @param entries - Raw Dexcom Share entries from any Dexcom client library
 * @returns Array of normalized readings, sorted chronologically
 */
export function normalizeDexcomEntries(
  entries: DexcomShareEntry[]
): NormalizedCGMReading[] {
  return entries
    .map(normalizeDexcomEntry)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
}
