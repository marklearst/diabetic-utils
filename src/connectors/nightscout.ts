/**
 * @file src/connectors/nightscout.ts
 *
 * Pure transformation adapter for Nightscout API payloads.
 * Maps raw Nightscout SGV entries into NormalizedCGMReading objects.
 * Does NOT handle authentication — use with the Nightscout REST API directly.
 *
 * @see https://nightscout.github.io/nightscout/setup_variables/#api
 * @see https://www.npmjs.com/package/nightscout
 */

import { MG_DL } from '../constants'
import type {
  NightscoutEntry,
  NightscoutDirection,
  NormalizedCGMReading,
  CGMTrend,
} from './types'

const NIGHTSCOUT_DIRECTION_MAP: Record<string, CGMTrend> = {
  DoubleUp: 'rapidRising',
  SingleUp: 'rising',
  FortyFiveUp: 'slightlyRising',
  Flat: 'flat',
  FortyFiveDown: 'slightlyFalling',
  SingleDown: 'falling',
  DoubleDown: 'rapidFalling',
  NONE: 'unknown',
  'NOT COMPUTABLE': 'unknown',
  'RATE OUT OF RANGE': 'unknown',
}

/**
 * Normalizes a Nightscout direction string into a canonical CGMTrend.
 */
export function normalizeNightscoutDirection(
  direction: NightscoutDirection | undefined
): CGMTrend {
  if (!direction) return 'unknown'
  return NIGHTSCOUT_DIRECTION_MAP[direction] ?? 'unknown'
}

/**
 * Converts a single Nightscout SGV entry into a NormalizedCGMReading.
 *
 * @param entry - Raw Nightscout SGV entry
 * @returns Normalized reading compatible with all diabetic-utils analytics functions
 */
export function normalizeNightscoutEntry(
  entry: NightscoutEntry
): NormalizedCGMReading {
  const timestamp = (() => {
    if (entry.dateString) {
      const parsed = Date.parse(entry.dateString)
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toISOString()
      }

      // Fall back to `entry.date` if available and valid
      if (entry.date !== undefined && entry.date !== null) {
        const fallbackDate = new Date(entry.date)
        if (!Number.isNaN(fallbackDate.getTime())) {
          return fallbackDate.toISOString()
        }
      }

      throw new Error(
        `Unable to parse Nightscout timestamp from 'dateString': ${entry.dateString}`
      )
    }

    const date = new Date(entry.date)
    if (Number.isNaN(date.getTime())) {
      throw new Error(
        `Unable to parse Nightscout timestamp from 'date' field: ${String(
          entry.date
        )}`
      )
    }

    return date.toISOString()
  })()
  return {
    value: entry.sgv,
    unit: MG_DL,
    timestamp,
    trend: normalizeNightscoutDirection(entry.direction),
    source: 'nightscout',
    vendorId: entry._id,
  }
}

/**
 * Converts an array of Nightscout SGV entries into NormalizedCGMReadings.
 *
 * @param entries - Raw Nightscout entries from the `/api/v1/entries` endpoint
 * @returns Array of normalized readings, sorted chronologically
 */
export function normalizeNightscoutEntries(
  entries: NightscoutEntry[]
): NormalizedCGMReading[] {
  return entries
    .map(normalizeNightscoutEntry)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
}
