import { describe, it, expect } from 'vitest'
import { glucoseIQScore } from '../src/score'
import { createGlucoseReadings } from './test-helpers'
import type { GlucoseReading } from '../src/types'

describe('glucoseIQScore', () => {
  it('scores an all-in-range trace as excellent (100)', () => {
    const res = glucoseIQScore(createGlucoseReadings([100, 110, 120, 130, 140], 'mg/dL', 5))
    expect(res.valid).toBe(true)
    expect(res.score).toBe(100)
    expect(res.rating).toBe('excellent')
    expect(res.zone).toBe('A')
  })

  it('rates a mostly-in-range trace with some highs as good', () => {
    const res = glucoseIQScore(createGlucoseReadings([120, 120, 120, 120, 200], 'mg/dL', 5))
    expect(res.score).toBe(84) // GRI 16 (0.8 * 20% high)
    expect(res.rating).toBe('good')
  })

  it('rates a trace with substantial highs as fair', () => {
    const res = glucoseIQScore(createGlucoseReadings([120, 120, 120, 200, 200], 'mg/dL', 5))
    expect(res.score).toBe(68) // GRI 32 (0.8 * 40% high)
    expect(res.rating).toBe('fair')
  })

  it('rates a trace dominated by very-high values as needs attention', () => {
    const res = glucoseIQScore(createGlucoseReadings([120, 120, 300, 300, 300], 'mg/dL', 5))
    expect(res.score).toBe(4) // GRI 96 (1.6 * 60% very high)
    expect(res.rating).toBe('needs attention')
    expect(res.zone).toBe('E')
  })

  it('returns an insufficient result for empty input', () => {
    const res = glucoseIQScore([])
    expect(res.valid).toBe(false)
    expect(res.rating).toBe('insufficient')
    expect(res.zone).toBeNull()
    expect(Number.isNaN(res.score)).toBe(true)
  })

  it('normalizes mmol/L input and ignores invalid readings', () => {
    const readings: GlucoseReading[] = [
      { value: 5.5, unit: 'mmol/L', timestamp: '2024-01-01T08:00:00Z' },
      { value: 6.0, unit: 'mmol/L', timestamp: '2024-01-01T08:05:00Z' },
      { value: 6.5, unit: 'mmol/L', timestamp: '2024-01-01T08:10:00Z' },
      { value: NaN, unit: 'mmol/L', timestamp: '2024-01-01T08:15:00Z' },
      { value: -1, unit: 'mmol/L', timestamp: '2024-01-01T08:20:00Z' },
      { value: 40, unit: 'mmol/L', timestamp: '2024-01-01T08:25:00Z' }, // ~720 mg/dL, out of range
      { value: 6.0, unit: 'mmol/L', timestamp: 'bad-timestamp' },
    ]
    const res = glucoseIQScore(readings, { unit: 'mmol/L' })
    expect(res.valid).toBe(true)
    expect(res.score).toBe(100)
  })
})
