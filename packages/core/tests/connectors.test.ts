import { describe, it, expect } from 'vitest'
import {
  // Dexcom
  parseDexcomDate,
  normalizeDexcomTrend,
  normalizeDexcomEntry,
  normalizeDexcomEntries,
  // Libre
  normalizeLibreTrend,
  normalizeLibreEntry,
  normalizeLibreEntries,
  // Nightscout
  normalizeNightscoutDirection,
  normalizeNightscoutEntry,
  normalizeNightscoutEntries,
} from '../src/connectors'
import type {
  DexcomShareEntry,
  LibreLinkUpEntry,
  NightscoutEntry,
} from '../src/connectors'

// ---------------------------------------------------------------------------
// Dexcom Share adapter
// ---------------------------------------------------------------------------
describe('Dexcom Share adapter', () => {
  describe('parseDexcomDate', () => {
    it('parses Date(epochMs) format', () => {
      const iso = parseDexcomDate('Date(1700000000000)')
      expect(iso).toBe(new Date(1700000000000).toISOString())
    })

    it('parses /Date(epochMs)/ format', () => {
      const iso = parseDexcomDate('/Date(1700000000000)/')
      expect(iso).toBe(new Date(1700000000000).toISOString())
    })

    it('parses plain ISO 8601 strings', () => {
      const iso = parseDexcomDate('2024-01-15T10:30:00Z')
      expect(iso).toBe('2024-01-15T10:30:00.000Z')
    })

    it('throws on unparseable date', () => {
      expect(() => parseDexcomDate('not-a-date')).toThrow(
        'Unable to parse Dexcom date'
      )
    })
  })

  describe('normalizeDexcomTrend', () => {
    it('maps all known Dexcom trends', () => {
      expect(normalizeDexcomTrend('DoubleUp')).toBe('rapidRising')
      expect(normalizeDexcomTrend('SingleUp')).toBe('rising')
      expect(normalizeDexcomTrend('FortyFiveUp')).toBe('slightlyRising')
      expect(normalizeDexcomTrend('Flat')).toBe('flat')
      expect(normalizeDexcomTrend('FortyFiveDown')).toBe('slightlyFalling')
      expect(normalizeDexcomTrend('SingleDown')).toBe('falling')
      expect(normalizeDexcomTrend('DoubleDown')).toBe('rapidFalling')
      expect(normalizeDexcomTrend('None')).toBe('unknown')
      expect(normalizeDexcomTrend('NotComputable')).toBe('unknown')
      expect(normalizeDexcomTrend('RateOutOfRange')).toBe('unknown')
    })

    it('returns unknown for unrecognized trend string', () => {
      expect(
        normalizeDexcomTrend('SomethingNew' as any)
      ).toBe('unknown')
    })

    it('returns unknown for null or undefined trend', () => {
      expect(normalizeDexcomTrend(null as any)).toBe('unknown')
      expect(normalizeDexcomTrend(undefined as any)).toBe('unknown')
    })
  })

  describe('normalizeDexcomEntry', () => {
    it('converts a Dexcom entry to NormalizedCGMReading', () => {
      const entry: DexcomShareEntry = {
        Value: 120,
        Trend: 'Flat',
        WT: 'Date(1700000000000)',
        ST: 'abc123',
      }
      const result = normalizeDexcomEntry(entry)
      expect(result.value).toBe(120)
      expect(result.unit).toBe('mg/dL')
      expect(result.trend).toBe('flat')
      expect(result.source).toBe('dexcom')
      expect(result.vendorId).toBe('abc123')
      expect(result.timestamp).toBe(new Date(1700000000000).toISOString())
    })

    it('falls back to DT when ST is not provided', () => {
      const entry: DexcomShareEntry = {
        Value: 95,
        Trend: 'SingleUp',
        WT: '2024-01-15T10:00:00Z',
        DT: 'dt-id',
      }
      const result = normalizeDexcomEntry(entry)
      expect(result.vendorId).toBe('dt-id')
    })

    it('sets vendorId to undefined when both ST and DT are absent', () => {
      const entry: DexcomShareEntry = {
        Value: 95,
        Trend: 'SingleUp',
        WT: '2024-01-15T10:00:00Z',
      }
      const result = normalizeDexcomEntry(entry)
      expect(result.vendorId).toBeUndefined()
    })
  })

  describe('normalizeDexcomEntries', () => {
    it('normalizes and sorts entries chronologically', () => {
      const entries: DexcomShareEntry[] = [
        { Value: 150, Trend: 'Flat', WT: 'Date(1700000010000)' },
        { Value: 120, Trend: 'SingleDown', WT: 'Date(1700000000000)' },
        { Value: 180, Trend: 'SingleUp', WT: 'Date(1700000020000)' },
      ]
      const result = normalizeDexcomEntries(entries)
      expect(result).toHaveLength(3)
      expect(result[0].value).toBe(120)
      expect(result[1].value).toBe(150)
      expect(result[2].value).toBe(180)
    })

    it('returns empty array for empty input', () => {
      expect(normalizeDexcomEntries([])).toEqual([])
    })
  })
})

// ---------------------------------------------------------------------------
// Libre LinkUp adapter
// ---------------------------------------------------------------------------
describe('Libre LinkUp adapter', () => {
  describe('normalizeLibreTrend', () => {
    it('maps all known Libre trend values', () => {
      expect(normalizeLibreTrend(1)).toBe('rapidFalling')
      expect(normalizeLibreTrend(2)).toBe('falling')
      expect(normalizeLibreTrend(3)).toBe('flat')
      expect(normalizeLibreTrend(4)).toBe('rising')
      expect(normalizeLibreTrend(5)).toBe('rapidRising')
    })

    it('returns unknown for unrecognized numeric trend', () => {
      expect(normalizeLibreTrend(99 as any)).toBe('unknown')
    })

    it('returns unknown for in-range non-integer trend values', () => {
      expect(normalizeLibreTrend(4.5 as any)).toBe('unknown')
    })

    it('returns unknown for null or undefined trend', () => {
      expect(normalizeLibreTrend(null)).toBe('unknown')
      expect(normalizeLibreTrend(undefined)).toBe('unknown')
    })
  })

  describe('normalizeLibreEntry', () => {
    it('converts a Libre entry to NormalizedCGMReading', () => {
      const entry: LibreLinkUpEntry = {
        Value: 110,
        TrendArrow: 3,
        Timestamp: '2024-06-15T08:30:00Z',
      }
      const result = normalizeLibreEntry(entry)
      expect(result.value).toBe(110)
      expect(result.unit).toBe('mg/dL')
      expect(result.trend).toBe('flat')
      expect(result.source).toBe('libre')
      expect(result.timestamp).toBe('2024-06-15T08:30:00.000Z')
    })

    it('throws on unparseable timestamp', () => {
      const entry: LibreLinkUpEntry = {
        Value: 110,
        TrendArrow: 3,
        Timestamp: 'bad-timestamp',
      }
      expect(() => normalizeLibreEntry(entry)).toThrow(
        'Unable to parse Libre timestamp'
      )
    })
  })

  describe('normalizeLibreEntries', () => {
    it('normalizes and sorts entries chronologically', () => {
      const entries: LibreLinkUpEntry[] = [
        { Value: 130, TrendArrow: 4, Timestamp: '2024-06-15T08:35:00Z' },
        { Value: 110, TrendArrow: 3, Timestamp: '2024-06-15T08:30:00Z' },
        { Value: 150, TrendArrow: 5, Timestamp: '2024-06-15T08:40:00Z' },
      ]
      const result = normalizeLibreEntries(entries)
      expect(result).toHaveLength(3)
      expect(result[0].value).toBe(110)
      expect(result[1].value).toBe(130)
      expect(result[2].value).toBe(150)
    })

    it('returns empty array for empty input', () => {
      expect(normalizeLibreEntries([])).toEqual([])
    })
  })
})

// ---------------------------------------------------------------------------
// Nightscout adapter
// ---------------------------------------------------------------------------
describe('Nightscout adapter', () => {
  describe('normalizeNightscoutDirection', () => {
    it('maps all known Nightscout directions', () => {
      expect(normalizeNightscoutDirection('DoubleUp')).toBe('rapidRising')
      expect(normalizeNightscoutDirection('SingleUp')).toBe('rising')
      expect(normalizeNightscoutDirection('FortyFiveUp')).toBe('slightlyRising')
      expect(normalizeNightscoutDirection('Flat')).toBe('flat')
      expect(normalizeNightscoutDirection('FortyFiveDown')).toBe(
        'slightlyFalling'
      )
      expect(normalizeNightscoutDirection('SingleDown')).toBe('falling')
      expect(normalizeNightscoutDirection('DoubleDown')).toBe('rapidFalling')
      expect(normalizeNightscoutDirection('NONE')).toBe('unknown')
      expect(normalizeNightscoutDirection('NOT COMPUTABLE')).toBe('unknown')
      expect(normalizeNightscoutDirection('RATE OUT OF RANGE')).toBe('unknown')
    })

    it('returns unknown for undefined direction', () => {
      expect(normalizeNightscoutDirection(undefined)).toBe('unknown')
    })

    it('returns unknown for unrecognized string', () => {
      expect(normalizeNightscoutDirection('SomeNewTrend')).toBe('unknown')
    })
  })

  describe('normalizeNightscoutEntry', () => {
    it('converts a Nightscout entry to NormalizedCGMReading', () => {
      const entry: NightscoutEntry = {
        sgv: 135,
        date: 1700000000000,
        dateString: '2023-11-14T22:13:20.000Z',
        direction: 'Flat',
        _id: 'ns-abc123',
      }
      const result = normalizeNightscoutEntry(entry)
      expect(result.value).toBe(135)
      expect(result.unit).toBe('mg/dL')
      expect(result.trend).toBe('flat')
      expect(result.source).toBe('nightscout')
      expect(result.vendorId).toBe('ns-abc123')
      expect(result.timestamp).toBe('2023-11-14T22:13:20.000Z')
    })

    it('falls back to epoch date when dateString is missing', () => {
      const entry: NightscoutEntry = {
        sgv: 100,
        date: 1700000000000,
        dateString: '',
        direction: 'SingleUp',
      }
      const result = normalizeNightscoutEntry(entry)
      expect(result.timestamp).toBe(new Date(1700000000000).toISOString())
    })

    it('falls back to date when dateString is invalid but date is valid', () => {
      const entry: NightscoutEntry = {
        sgv: 110,
        date: 1700000000000,
        dateString: 'not-a-valid-iso',
        direction: 'Flat',
      }
      const result = normalizeNightscoutEntry(entry)
      expect(result.timestamp).toBe(new Date(1700000000000).toISOString())
    })

    it('throws when dateString is invalid and date fallback is invalid', () => {
      const entry: NightscoutEntry = {
        sgv: 110,
        date: 'also-bad' as any,
        dateString: 'not-a-valid-iso',
        direction: 'Flat',
      }
      expect(() => normalizeNightscoutEntry(entry)).toThrow(
        "Unable to parse Nightscout timestamp from 'dateString'"
      )
    })

    it('throws when dateString is missing and date is invalid', () => {
      const entry: NightscoutEntry = {
        sgv: 110,
        date: 'bad-date' as any,
        dateString: '',
        direction: 'Flat',
      }
      expect(() => normalizeNightscoutEntry(entry)).toThrow(
        "Unable to parse Nightscout timestamp from 'date' field"
      )
    })
  })

  describe('normalizeNightscoutEntries', () => {
    it('normalizes and sorts entries chronologically', () => {
      const entries: NightscoutEntry[] = [
        {
          sgv: 160,
          date: 1700000020000,
          dateString: new Date(1700000020000).toISOString(),
        },
        {
          sgv: 120,
          date: 1700000000000,
          dateString: new Date(1700000000000).toISOString(),
        },
        {
          sgv: 140,
          date: 1700000010000,
          dateString: new Date(1700000010000).toISOString(),
        },
      ]
      const result = normalizeNightscoutEntries(entries)
      expect(result).toHaveLength(3)
      expect(result[0].value).toBe(120)
      expect(result[1].value).toBe(140)
      expect(result[2].value).toBe(160)
    })

    it('returns empty array for empty input', () => {
      expect(normalizeNightscoutEntries([])).toEqual([])
    })
  })
})

// ---------------------------------------------------------------------------
// Integration: normalized readings work with existing analytics
// ---------------------------------------------------------------------------
import { calculateEnhancedTIR } from '../src'

describe('Connector integration with analytics', () => {
  it('normalized readings are valid GlucoseReading objects for calculateEnhancedTIR', () => {
    const entries: DexcomShareEntry[] = Array.from({ length: 50 }, (_, i) => ({
      Value: 100 + (i % 10) * 5,
      Trend: 'Flat' as const,
      WT: `Date(${1700000000000 + i * 300000})`,
    }))
    const readings = normalizeDexcomEntries(entries)
    const result = calculateEnhancedTIR(readings)
    expect(result.inRange.percentage).toBeGreaterThan(0)
    expect(result.summary.totalReadings).toBe(50)
  })
})
