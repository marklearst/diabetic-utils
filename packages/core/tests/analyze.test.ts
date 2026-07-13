import { describe, it, expect } from 'vitest'
import { analyzeGlucose } from '../src/analyze'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

/** Dense 5-minute readings spanning `days` days (constant value). */
function makeDense(days: number): GlucoseReading[] {
  const out: GlucoseReading[] = []
  const start = Date.UTC(2024, 0, 1, 0, 0, 0)
  const count = days * 288
  for (let i = 0; i < count; i++) {
    out.push({
      value: 120,
      unit: 'mg/dL',
      timestamp: new Date(start + i * 5 * 60000).toISOString(),
    })
  }
  return out
}

describe('analyzeGlucose', () => {
  it('produces a full report from a single normalized pass', () => {
    const readings: GlucoseReading[] = [
      ...createGlucoseReadings([80, 120, 160, 200, 90, 140, 70, 180, 110, 130], 'mg/dL', 30),
      { value: 120, unit: 'mg/dL', timestamp: 'bad-timestamp' }, // excluded
    ]
    const res = analyzeGlucose(readings)
    expect(res.valid).toBe(true)
    expect(res.dataSufficiency.totalReadings).toBe(10)
    expect(res.meanGlucose).toBe(128)
    expect(Number.isFinite(res.gmi)).toBe(true)
    expect(res.timeInRange).not.toBeNull()
    expect(typeof res.timeInRange!.inRange.percentage).toBe('number')
    expect(typeof res.tightRange!.inRange).toBe('number')
    expect(typeof res.risk!.lbgi).toBe('number')
    expect(res.agpProfile).not.toBeNull()
    expect(res.agpProfile!.bins).toHaveLength(288)
    expect(res.episodes).not.toBeNull()
    expect(Array.isArray(res.episodes!.hypoEvents)).toBe(true)
    expect(Array.isArray(res.episodes!.hyperEvents)).toBe(true)
    expect(res.dataSufficiency.meetsCGMStandard).toBe(false)
  })

  it('omits the AGP profile when includeProfile is false', () => {
    const res = analyzeGlucose(createGlucoseReadings([100, 120, 140]), {
      includeProfile: false,
    })
    expect(res.valid).toBe(true)
    expect(res.agpProfile).toBeNull()
  })

  it('returns an invalid report for empty input (does not throw)', () => {
    const res = analyzeGlucose([])
    expect(res.valid).toBe(false)
    expect(res.timeInRange).toBeNull()
    expect(res.episodes).toBeNull()
    expect(Number.isNaN(res.meanGlucose)).toBe(true)
    expect(res.dataSufficiency.totalReadings).toBe(0)
  })

  it('is invalid when every reading is out of physiological range', () => {
    const res = analyzeGlucose([
      { value: NaN, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: -5, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
      { value: 700, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' },
    ])
    expect(res.valid).toBe(false)
  })

  it('normalizes mmol/L input', () => {
    const mgdl = createGlucoseReadings([100, 120, 140, 160], 'mg/dL', 30)
    const mmol: GlucoseReading[] = mgdl.map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L',
      timestamp: r.timestamp,
    }))
    const res = analyzeGlucose(mmol)
    expect(res.valid).toBe(true)
    expect(res.meanGlucose).toBeCloseTo(130, 1)
  })

  describe('data sufficiency (consensus 14-day / 70%-wear)', () => {
    it('is not met for a short trace', () => {
      const res = analyzeGlucose(createGlucoseReadings([100, 120, 140]))
      expect(res.dataSufficiency.meetsCGMStandard).toBe(false)
    })

    it('is not met when wear time is below the active-percent threshold', () => {
      const res = analyzeGlucose(makeDense(2), { minDays: 1, minActivePercent: 200 })
      expect(res.dataSufficiency.meetsCGMStandard).toBe(false)
    })

    it('is met with enough days and wear time', () => {
      const res = analyzeGlucose(makeDense(2), { minDays: 1 })
      expect(res.dataSufficiency.meetsCGMStandard).toBe(true)
    })
  })
})
