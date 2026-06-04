import { describe, it, expect } from 'vitest'
import { glucoseMAG, glucoseGVP } from '../src/metrics/curve'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

describe('glucoseMAG (mean absolute glucose change, mg/dL per hour)', () => {
  it('is zero for a flat trace', () => {
    expect(glucoseMAG(createGlucoseReadings([100, 100, 100], 'mg/dL', 30))).toBe(0)
  })

  it('is the total absolute change divided by total hours', () => {
    // |Δ| = 30 + 30 = 60 over 2 hours
    expect(glucoseMAG(createGlucoseReadings([100, 130, 160], 'mg/dL', 60))).toBe(30)
  })

  it('returns NaN with fewer than two readings', () => {
    expect(Number.isNaN(glucoseMAG(createGlucoseReadings([100])))).toBe(true)
  })

  it('returns NaN when readings span no time', () => {
    const t = '2024-01-01T08:00:00Z'
    expect(
      Number.isNaN(
        glucoseMAG([
          { value: 100, unit: 'mg/dL', timestamp: t },
          { value: 140, unit: 'mg/dL', timestamp: t },
        ])
      )
    ).toBe(true)
  })

  it('normalizes mmol/L input and ignores invalid readings', () => {
    const mgdl = createGlucoseReadings([100, 130, 160], 'mg/dL', 60)
    const dirty: GlucoseReading[] = [
      ...mgdl.map((r) => ({
        value: r.value / MGDL_MMOLL_CONVERSION,
        unit: 'mmol/L' as const,
        timestamp: r.timestamp,
      })),
      { value: NaN, unit: 'mmol/L', timestamp: mgdl[0].timestamp },
      { value: 5, unit: 'mmol/L', timestamp: 'not-a-date' },
    ]
    expect(glucoseMAG(dirty)).toBeCloseTo(30, 4)
  })
})

describe('glucoseGVP (glycemic variability percentage)', () => {
  it('is zero for a flat trace', () => {
    expect(glucoseGVP(createGlucoseReadings([100, 100, 100], 'mg/dL', 30))).toBe(0)
  })

  it('measures excess curve length over the time axis', () => {
    // one segment: Δt=30, Δy=40 → L=50, L0=30 → (50/30-1)*100 = 66.7
    expect(glucoseGVP(createGlucoseReadings([100, 140], 'mg/dL', 30))).toBe(66.7)
  })

  it('returns NaN with fewer than two readings', () => {
    expect(Number.isNaN(glucoseGVP(createGlucoseReadings([100])))).toBe(true)
  })

  it('returns NaN when readings span no time', () => {
    const t = '2024-01-01T08:00:00Z'
    expect(
      Number.isNaN(
        glucoseGVP([
          { value: 100, unit: 'mg/dL', timestamp: t },
          { value: 140, unit: 'mg/dL', timestamp: t },
        ])
      )
    ).toBe(true)
  })
})
