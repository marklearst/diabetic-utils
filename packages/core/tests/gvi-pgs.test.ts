import { describe, it, expect } from 'vitest'
import { calculateGVIPGS } from '../src/metrics/gvi-pgs'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading, GlucoseUnit } from '../src/types'

const base = Date.UTC(2024, 0, 1, 0, 0, 0)
const mk = (values: number[], unit: GlucoseUnit = 'mg/dL', stepMin = 5): GlucoseReading[] =>
  values.map((v, i) => ({
    value: v,
    unit,
    timestamp: new Date(base + i * stepMin * 60000).toISOString(),
  }))

describe('calculateGVIPGS (Nightscout GVI + PGS)', () => {
  it('matches the GVI golden case (all in range → PGS 0)', () => {
    const res = calculateGVIPGS(mk([100, 105, 103, 108, 106]))
    expect(res.gvi).toBeCloseTo(1.19, 2)
    expect(res.meanGlucose).toBe(104)
    expect(res.pgs).toBe(0)
  })

  it('matches the full PGS golden case', () => {
    const res = calculateGVIPGS(
      mk([80, 95, 115, 140, 165, 185, 190, 175, 150, 120, 95, 72, 68])
    )
    expect(res.gvi).toBeCloseTo(3.96, 2)
    expect(res.meanGlucose).toBe(131)
    expect(res.timeInRangeFraction).toBeCloseTo(0.769, 3)
    expect(res.pgs).toBeCloseTo(119.83, 2)
  })

  it('returns NaN with fewer than two readings', () => {
    const res = calculateGVIPGS(mk([100]))
    expect(Number.isNaN(res.gvi)).toBe(true)
    expect(Number.isNaN(res.pgs)).toBe(true)
  })

  it('returns NaN when no reading pair is within the max gap', () => {
    const res = calculateGVIPGS(mk([100, 110, 120], 'mg/dL', 60))
    expect(Number.isNaN(res.gvi)).toBe(true)
  })

  it('skips zero-time and over-gap reading pairs', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: new Date(base).toISOString() },
      { value: 110, unit: 'mg/dL', timestamp: new Date(base).toISOString() }, // dup timestamp
      { value: 120, unit: 'mg/dL', timestamp: new Date(base + 5 * 60000).toISOString() },
      { value: 130, unit: 'mg/dL', timestamp: new Date(base + 65 * 60000).toISOString() }, // 60-min gap
    ]
    const res = calculateGVIPGS(readings)
    // only the 110->120 step is valid; MG is the floor of that step's start
    expect(res.meanGlucose).toBe(110)
  })

  it('ignores invalid values and unparseable timestamps', () => {
    const readings: GlucoseReading[] = [
      ...mk([100, 105, 103, 108, 106]),
      { value: NaN, unit: 'mg/dL', timestamp: new Date(base + 30 * 60000).toISOString() },
      { value: -5, unit: 'mg/dL', timestamp: new Date(base + 35 * 60000).toISOString() },
      { value: 120, unit: 'mg/dL', timestamp: 'bad-timestamp' },
    ]
    expect(calculateGVIPGS(readings).gvi).toBeCloseTo(1.19, 2)
  })

  it('normalizes mmol/L input', () => {
    const mmol = mk([100, 105, 103, 108, 106], 'mg/dL').map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L' as const,
      timestamp: r.timestamp,
    }))
    expect(calculateGVIPGS(mmol, { unit: 'mmol/L' }).gvi).toBeCloseTo(1.19, 1)
  })

  it('honors custom target range and max gap options', () => {
    const res = calculateGVIPGS(mk([80, 95, 115, 140, 165, 185, 190, 175, 150, 120, 95, 72, 68]), {
      targetLow: 80,
      targetHigh: 200,
      maxGapMinutes: 10,
    })
    expect(Number.isFinite(res.pgs)).toBe(true)
  })
})
