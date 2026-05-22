/**
 * @file src/connectors/types.ts
 *
 * Canonical types for CGM vendor data normalization.
 * All connector adapters map vendor-specific payloads into these types,
 * which are compatible with the existing GlucoseReading interface.
 */

import type { GlucoseReading } from '../types'

/**
 * Trend direction reported by CGM devices.
 * Normalized across vendors into a common set.
 *
 * @see Dexcom: DoubleUp, SingleUp, FortyFiveUp, Flat, FortyFiveDown, SingleDown, DoubleDown
 * @see Libre: 1-5 numeric scale
 */
export type CGMTrend =
  | 'rapidRising'
  | 'rising'
  | 'slightlyRising'
  | 'flat'
  | 'slightlyFalling'
  | 'falling'
  | 'rapidFalling'
  | 'unknown'

/** Known CGM data source vendors. */
export type CGMSource = 'dexcom' | 'libre' | 'nightscout' | 'unknown'

/**
 * Extended glucose reading that preserves vendor metadata.
 * Superset of GlucoseReading — can be passed directly to all analytics functions.
 */
export interface NormalizedCGMReading extends GlucoseReading {
  /** Trend direction from the CGM device */
  readonly trend: CGMTrend
  /** Data source vendor */
  readonly source: CGMSource
  /** Original vendor-specific identifier, if available */
  readonly vendorId?: string
}

// ---------------------------------------------------------------------------
// Dexcom Share types (vendor payload shape)
// ---------------------------------------------------------------------------

/** Trend strings returned by the Dexcom Share API. */
export type DexcomTrendString =
  | 'DoubleUp'
  | 'SingleUp'
  | 'FortyFiveUp'
  | 'Flat'
  | 'FortyFiveDown'
  | 'SingleDown'
  | 'DoubleDown'
  | 'None'
  | 'NotComputable'
  | 'RateOutOfRange'

/**
 * Raw glucose entry returned by the Dexcom Share service.
 * Matches the shape of `@diakem/dexcom-api-client` and `dexcom-share-client` responses.
 */
export interface DexcomShareEntry {
  /** Glucose value in mg/dL */
  Value: number
  /** Dexcom trend string */
  Trend: DexcomTrendString
  /** Dexcom date string, e.g. "Date(1700000000000)" or ISO 8601 */
  WT: string
  /** Optional: Dexcom device serial or record id */
  DT?: string
  /** Stable record identifier */
  ST?: string
}

// ---------------------------------------------------------------------------
// Libre LinkUp types (vendor payload shape)
// ---------------------------------------------------------------------------

/** Trend values returned by Libre LinkUp (numeric 1-5). */
export type LibreTrendValue = 1 | 2 | 3 | 4 | 5

/**
 * Raw glucose entry from the Libre LinkUp API.
 * Matches the shape of `librelinkup-api-client` and `libre-client` responses.
 */
export interface LibreLinkUpEntry {
  /** Glucose value (mg/dL) */
  Value: number
  /** Trend arrow (1=falling fast, 2=falling, 3=stable, 4=rising, 5=rising fast) */
  TrendArrow: LibreTrendValue
  /** ISO 8601 timestamp string */
  Timestamp: string
  /** Measurement color (vendor-specific) */
  MeasurementColor?: number
  /** Factory timestamp */
  FactoryTimestamp?: string
}

// ---------------------------------------------------------------------------
// Nightscout types (vendor payload shape)
// ---------------------------------------------------------------------------

/**
 * Nightscout direction string for trend arrows.
 */
export type NightscoutDirection =
  | 'DoubleUp'
  | 'SingleUp'
  | 'FortyFiveUp'
  | 'Flat'
  | 'FortyFiveDown'
  | 'SingleDown'
  | 'DoubleDown'
  | 'NONE'
  | 'NOT COMPUTABLE'
  | 'RATE OUT OF RANGE'
  | (string & {})

/**
 * Nightscout SGV (Sensor Glucose Value) entry.
 * Matches the `/api/v1/entries` response shape.
 *
 * @see https://nightscout.github.io/nightscout/setup_variables/#api
 */
export interface NightscoutEntry {
  /** Sensor glucose value in mg/dL */
  sgv: number
  /** Epoch timestamp in milliseconds */
  date: number
  /** ISO 8601 date string */
  dateString?: string
  /** Trend direction */
  direction?: NightscoutDirection
  /** Entry type (usually "sgv") */
  type?: string
  /** Nightscout record _id */
  _id?: string
}
