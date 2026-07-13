import { describe, it, expect } from 'vitest'
import {
  normalizeLibreEntry,
  safeNormalizeDexcomEntries,
  safeNormalizeLibreEntries,
  safeNormalizeNightscoutEntries,
  DEXCOM_CAPABILITIES,
  LIBRE_CAPABILITIES,
  NIGHTSCOUT_CAPABILITIES,
  normalizeDexcomEntry,
  normalizeNightscoutEntry,
} from '../src/connectors'

describe('Libre unit handling (EU mmol/L fix)', () => {
  it('prefers ValueInMgPerDl when present', () => {
    const r = normalizeLibreEntry({
      Value: 6.7,
      ValueInMgPerDl: 121,
      GlucoseUnits: 0,
      TrendArrow: 3,
      Timestamp: '2024-01-01T08:00:00Z',
    })
    expect(r.value).toBe(121)
    expect(r.unit).toBe('mg/dL')
    expect(r.nativeUnit).toBe('mmol/L')
  })

  it('omits nativeUnit when the account is already mg/dL native', () => {
    const r = normalizeLibreEntry({
      Value: 121,
      ValueInMgPerDl: 121,
      GlucoseUnits: 1,
      TrendArrow: 3,
      Timestamp: '2024-01-01T08:00:00Z',
    })
    expect(r.value).toBe(121)
    expect(r.nativeUnit).toBeUndefined()
  })

  it('respects GlucoseUnits=0 as mmol/L when only Value is present', () => {
    const r = normalizeLibreEntry({
      Value: 6.7,
      GlucoseUnits: 0,
      TrendArrow: 3,
      Timestamp: '2024-01-01T08:00:00Z',
    })
    expect(r.value).toBe(6.7)
    expect(r.unit).toBe('mmol/L')
  })

  it('defaults to mg/dL for legacy payloads (back-compat)', () => {
    const r = normalizeLibreEntry({ Value: 121, TrendArrow: 3, Timestamp: '2024-01-01T08:00:00Z' })
    expect(r.unit).toBe('mg/dL')
    expect(r.nativeUnit).toBeUndefined()
  })
})

describe('dedupKey', () => {
  it('uses vendor ids when available and a deterministic fallback otherwise', () => {
    const dex = normalizeDexcomEntry({ Value: 120, Trend: 'Flat', WT: 'Date(1700000000000)', ST: 'st-1' })
    expect(dex.dedupKey).toBe('dexcom:st-1')
    const libre = normalizeLibreEntry({ Value: 100, TrendArrow: 3, Timestamp: '2024-01-01T08:00:00Z' })
    expect(libre.dedupKey).toBe(`libre:${libre.timestamp}`)
    const ns = normalizeNightscoutEntry({ sgv: 100, date: 1700000000000, _id: 'abc' })
    expect(ns.dedupKey).toBe('nightscout:abc')
  })
})

describe('safeNormalize* (partial success)', () => {
  it('collects per-entry errors instead of discarding the batch', () => {
    const res = safeNormalizeDexcomEntries([
      { Value: 120, Trend: 'Flat', WT: 'Date(1700000000000)' },
      { Value: 130, Trend: 'Flat', WT: 'garbage' },
      { Value: 140, Trend: 'SingleUp', WT: 'Date(1700000600000)' },
    ])
    expect(res.readings).toHaveLength(2)
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].index).toBe(1)
    expect(res.errors[0].message).toMatch(/Dexcom date/)
  })

  it('works for libre and nightscout too', () => {
    const libre = safeNormalizeLibreEntries([
      { Value: 100, TrendArrow: 3, Timestamp: 'bad' },
      { Value: 110, TrendArrow: 4, Timestamp: '2024-01-01T08:05:00Z' },
    ])
    expect(libre.readings).toHaveLength(1)
    expect(libre.errors[0].index).toBe(0)

    const ns = safeNormalizeNightscoutEntries([{ sgv: 100, date: 1700000000000 }])
    expect(ns.readings).toHaveLength(1)
    expect(ns.errors).toHaveLength(0)
  })
})

describe('capability descriptors', () => {
  it('describes each source with tier, cadence, and trend vocabulary', () => {
    expect(DEXCOM_CAPABILITIES.source).toBe('dexcom')
    expect(DEXCOM_CAPABILITIES.tier).toBe(1)
    expect(DEXCOM_CAPABILITIES.updateIntervalSec).toBe(300)
    expect(DEXCOM_CAPABILITIES.clockModel).toBe('direct')
    expect(LIBRE_CAPABILITIES.tier).toBe(1)
    expect(NIGHTSCOUT_CAPABILITIES.tier).toBe(2)
    expect(NIGHTSCOUT_CAPABILITIES.clockModel).toBe('relay')
    expect(DEXCOM_CAPABILITIES.trendVocabulary).toBe('full')
  })
})
