/**
 * @file src/connectors/capabilities.ts
 *
 * Connector capability descriptors — declarative metadata about each CGM data
 * source so pipelines can pick poll cadence, gap thresholds, and strictness
 * per source instead of hardcoding vendor quirks.
 */

import type { CGMSource } from './types'

/** How a source's clock relates to the sensor's. */
export type ClockModel = 'direct' | 'relay'

/** How complete a source's trend vocabulary is. */
export type TrendVocabulary = 'full' | 'coarse' | 'none'

/** Declarative capabilities of a CGM data source. */
export interface ConnectorCapabilities {
  /** The source this describes. */
  readonly source: CGMSource
  /** Connector tier: 1 = full-fidelity vendor feed, 2 = community/relay. */
  readonly tier: 1 | 2
  /** Typical seconds between new readings. */
  readonly updateIntervalSec: number
  /** Readings older than this (seconds) should be considered stale. */
  readonly maxFreshnessSec: number
  /** Trend-arrow vocabulary coverage. */
  readonly trendVocabulary: TrendVocabulary
  /** Typical history depth available from the feed, in days. */
  readonly historyDepthDays: number
  /** Whether timestamps come straight from the device or via a relay. */
  readonly clockModel: ClockModel
}

/** Dexcom Share / G7-G8 feeds. */
export const DEXCOM_CAPABILITIES: ConnectorCapabilities = {
  source: 'dexcom',
  tier: 1,
  updateIntervalSec: 300,
  maxFreshnessSec: 600,
  trendVocabulary: 'full',
  historyDepthDays: 1,
  clockModel: 'direct',
}

/** Libre LinkUp feeds. */
export const LIBRE_CAPABILITIES: ConnectorCapabilities = {
  source: 'libre',
  tier: 1,
  updateIntervalSec: 60,
  maxFreshnessSec: 300,
  trendVocabulary: 'coarse',
  historyDepthDays: 14,
  clockModel: 'direct',
}

/** Nightscout community relays. */
export const NIGHTSCOUT_CAPABILITIES: ConnectorCapabilities = {
  source: 'nightscout',
  tier: 2,
  updateIntervalSec: 300,
  maxFreshnessSec: 900,
  trendVocabulary: 'full',
  historyDepthDays: 90,
  clockModel: 'relay',
}
