import { describe, it, expect } from 'vitest'
import { glucoseAUC, incrementalAUC } from '../src/metrics/auc'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

describe('glucoseAUC (total trapezoidal area, mg/dL·min)', () => {
  it('integrates a flat trace as value × duration', () => {
    // 100 mg/dL held over 20 minutes
    expect(glucoseAUC(createGlucoseReadings([100, 100, 100], 'mg/dL', 10))).toBe(2000)
  })

  it('integrates a rising segment with the trapezoid rule', () => {
    // (100 + 200)/2 * 60
    expect(glucoseAUC(createGlucoseReadings([100, 200], 'mg/dL', 60))).toBe(9000)
  })

  it('can integrate in mmol/L·min', () => {
    const res = glucoseAUC(createGlucoseReadings([100, 100, 100], 'mg/dL', 10), {
      unit: 'mmol/L',
    })
    expect(res).toBeCloseTo(2000 / MGDL_MMOLL_CONVERSION, 6)
  })

  it('sorts unsorted readings and ignores invalid ones', () => {
    const readings: GlucoseReading[] = [
      ...createGlucoseReadings([100, 100, 100], 'mg/dL', 10),
      { value: NaN, unit: 'mg/dL', timestamp: '2024-01-01T09:00:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: 'not-a-date' },
    ]
    expect(glucoseAUC(readings)).toBe(2000)
  })

  it('returns NaN with fewer than two valid readings', () => {
    expect(Number.isNaN(glucoseAUC(createGlucoseReadings([100])))).toBe(true)
  })

  it('accepts mmol/L input readings', () => {
    const mgdl = createGlucoseReadings([100, 120, 140], 'mg/dL', 30)
    const mmol: GlucoseReading[] = mgdl.map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L',
      timestamp: r.timestamp,
    }))
    expect(glucoseAUC(mmol)).toBeCloseTo(glucoseAUC(mgdl), 6)
  })
})

describe('incrementalAUC (Wolever 4-case, area above baseline)', () => {
  it('sums area when the whole segment is above baseline', () => {
    // baseline 100: a=0→b=20 (300) + a=20→b=40 (900)
    expect(
      incrementalAUC(createGlucoseReadings([100, 120, 140], 'mg/dL', 30), 100)
    ).toBe(1200)
  })

  it('counts only the above-baseline triangle when falling through baseline', () => {
    // 120 → 80 over 60 min, baseline 100: crosses at 30 min, triangle = 300
    expect(incrementalAUC(createGlucoseReadings([120, 80], 'mg/dL', 60), 100)).toBe(300)
  })

  it('counts only the above-baseline triangle when rising through baseline', () => {
    // 80 → 120 over 60 min, baseline 100: crosses at 30 min, triangle = 300
    expect(incrementalAUC(createGlucoseReadings([80, 120], 'mg/dL', 60), 100)).toBe(300)
  })

  it('contributes zero when the segment stays below baseline', () => {
    expect(incrementalAUC(createGlucoseReadings([80, 90], 'mg/dL', 60), 100)).toBe(0)
  })

  it('computes a realistic meal response (rise, peak, return)', () => {
    // baseline 100: 100→150 (750) + 150→120 (1050) + 120→100 (300) = 2100
    expect(
      incrementalAUC(createGlucoseReadings([100, 150, 120, 100], 'mg/dL', 30), 100)
    ).toBe(2100)
  })

  it('returns NaN with fewer than two valid readings', () => {
    expect(Number.isNaN(incrementalAUC(createGlucoseReadings([100]), 90))).toBe(true)
  })

  it('accepts a mmol/L unit option (baseline in the same unit)', () => {
    const mgdl = createGlucoseReadings([100, 150, 100], 'mg/dL', 30)
    const mmol: GlucoseReading[] = mgdl.map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L',
      timestamp: r.timestamp,
    }))
    const mmolAUC = incrementalAUC(mmol, 100 / MGDL_MMOLL_CONVERSION, { unit: 'mmol/L' })
    expect(mmolAUC).toBeCloseTo(incrementalAUC(mgdl, 100) / MGDL_MMOLL_CONVERSION, 6)
  })
})
