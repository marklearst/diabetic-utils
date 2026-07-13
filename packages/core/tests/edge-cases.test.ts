import { describe, it, expect } from 'vitest'
import {
  calculateEnhancedTIR,
  calculateMODD,
  glucoseLBGI,
  glucoseHBGI,
  calculateGRI,
  normalizeDexcomEntries,
  normalizeLibreEntries,
  normalizeNightscoutEntries,
  buildFHIRCGMSummary,
  buildFHIRSensorReadings,
  buildOMHBloodGlucoseList,
} from '../src'
import type { GlucoseReading, DexcomShareEntry, NightscoutEntry, LibreLinkUpEntry } from '../src'

// ---------------------------------------------------------------------------
// Edge case: out-of-order timestamps
// ---------------------------------------------------------------------------
describe('out-of-order timestamp handling', () => {
  it('enhanced TIR accepts out-of-order readings', () => {
    const readings: GlucoseReading[] = [
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' },
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 140, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
    ]
    const result = calculateEnhancedTIR(readings)
    expect(result.summary.totalReadings).toBe(3)
    expect(result.inRange.percentage).toBe(100)
  })

  it('connector adapters sort into chronological order', () => {
    const dexcomEntries: DexcomShareEntry[] = [
      { Value: 150, Trend: 'Flat', WT: 'Date(1700000020000)' },
      { Value: 100, Trend: 'Flat', WT: 'Date(1700000000000)' },
      { Value: 130, Trend: 'Flat', WT: 'Date(1700000010000)' },
    ]
    const normalized = normalizeDexcomEntries(dexcomEntries)
    const times = normalized.map((r) => new Date(r.timestamp).getTime())
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1])
    }
  })
})

// ---------------------------------------------------------------------------
// Edge case: mixed units in a single dataset
// ---------------------------------------------------------------------------
describe('mixed unit handling', () => {
  it('enhanced TIR normalizes mixed mg/dL and mmol/L readings', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 5.5, unit: 'mmol/L', timestamp: '2024-01-01T08:05:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' },
      { value: 6.0, unit: 'mmol/L', timestamp: '2024-01-01T08:15:00Z' },
    ]
    const result = calculateEnhancedTIR(readings)
    expect(result.summary.totalReadings).toBe(4)
    expect(result.inRange.percentage).toBe(100)
  })

  it('MODD handles mixed units correctly', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 6.7, unit: 'mmol/L', timestamp: '2024-01-02T08:00:00Z' },
    ]
    const result = calculateMODD(readings)
    expect(Number.isFinite(result)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Edge case: sparse data / missing points
// ---------------------------------------------------------------------------
describe('sparse data handling', () => {
  it('LBGI and HBGI handle single valid reading', () => {
    expect(Number.isFinite(glucoseLBGI([50]))).toBe(true)
    expect(Number.isFinite(glucoseHBGI([300]))).toBe(true)
  })

  it('GRI produces valid result with all-zero inputs', () => {
    const result = calculateGRI({
      veryLowPercent: 0,
      lowPercent: 0,
      highPercent: 0,
      veryHighPercent: 0,
    })
    expect(result.score).toBe(0)
    expect(result.zone).toBe('A')
  })

  it('enhanced TIR with minimum readings (1 reading)', () => {
    const readings: GlucoseReading[] = [
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
    ]
    const result = calculateEnhancedTIR(readings)
    expect(result.inRange.percentage).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// Edge case: boundary glucose values
// ---------------------------------------------------------------------------
describe('boundary value handling', () => {
  it('LBGI handles glucose at exact threshold values', () => {
    const result = glucoseLBGI([54, 70, 180, 250])
    expect(Number.isFinite(result)).toBe(true)
  })

  it('HBGI handles glucose at exact threshold values', () => {
    const result = glucoseHBGI([54, 70, 180, 250])
    expect(Number.isFinite(result)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// End-to-end: connector → analytics → interop pipeline
// ---------------------------------------------------------------------------
describe('full pipeline: connector → analytics → FHIR', () => {
  it('Dexcom entries flow through to FHIR summary', () => {
    const entries: DexcomShareEntry[] = Array.from({ length: 100 }, (_, i) => ({
      Value: 80 + Math.round(80 * Math.sin(i / 10)),
      Trend: 'Flat' as const,
      WT: `Date(${1700000000000 + i * 300000})`,
    }))
    const readings = normalizeDexcomEntries(entries)
    const tir = calculateEnhancedTIR(readings)
    const summary = buildFHIRCGMSummary(tir, {
      start: readings[0].timestamp,
      end: readings[readings.length - 1].timestamp,
    })
    expect(summary.resourceType).toBe('Observation')
    expect(summary.component.length).toBe(5)
  })

  it('Nightscout entries flow through to OMH list', () => {
    const entries: NightscoutEntry[] = Array.from({ length: 20 }, (_, i) => ({
      sgv: 100 + i * 3,
      date: 1700000000000 + i * 300000,
      dateString: new Date(1700000000000 + i * 300000).toISOString(),
      direction: 'Flat' as const,
    }))
    const readings = normalizeNightscoutEntries(entries)
    const omhList = buildOMHBloodGlucoseList(readings)
    expect(omhList).toHaveLength(20)
    expect(omhList[0].blood_glucose.unit).toBe('mg/dL')
  })

  it('Libre entries flow through to FHIR sensor readings', () => {
    const entries: LibreLinkUpEntry[] = Array.from({ length: 10 }, (_, i) => ({
      Value: 90 + i * 5,
      TrendArrow: 3 as const,
      Timestamp: new Date(1700000000000 + i * 300000).toISOString(),
    }))
    const readings = normalizeLibreEntries(entries)
    const fhirReadings = buildFHIRSensorReadings(readings)
    expect(fhirReadings).toHaveLength(10)
    expect(fhirReadings[0].resourceType).toBe('Observation')
  })
})
