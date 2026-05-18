/**
 * @file src/connectors/index.ts
 *
 * CGM vendor data normalization adapters.
 * Pure transformation helpers that map vendor payloads into a canonical
 * NormalizedCGMReading type compatible with all diabetic-utils analytics.
 */

export * from './types'
export * from './dexcom'
export * from './libre'
export * from './nightscout'
