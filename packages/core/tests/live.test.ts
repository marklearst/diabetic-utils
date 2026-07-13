import { describe, it, expect } from 'vitest'
import {
  computeGlucoseTrend,
  classifyGlucoseTrend,
  latestReading,
  minutesSinceLastReading,
} from '../src/live'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

describe('classifyGlucoseTrend (Dexcom-style thresholds, mg/dL per min)', () => {
  it('maps rate-of-change to the seven trend categories', () => {
    expect(classifyGlucoseTrend(0)).toBe('flat')
    expect(classifyGlucoseTrend(0.9)).toBe('flat')
    expect(classifyGlucoseTrend(1)).toBe('slightlyRising')
    expect(classifyGlucoseTrend(-1)).toBe('slightlyFalling')
    expect(classifyGlucoseTrend(2)).toBe('rising')
    expect(classifyGlucoseTrend(-2.5)).toBe('falling')
    expect(classifyGlucoseTrend(3)).toBe('rapidRising')
    expect(classifyGlucoseTrend(-4)).toBe('rapidFalling')
  })
})

describe('computeGlucoseTrend', () => {
  it('computes rate-of-change and classifies a fast rise', () => {
    const res = computeGlucoseTrend(createGlucoseReadings([100, 120, 140, 160], 'mg/dL', 5))
    expect(res.rocPerMin).toBeCloseTo(4, 6)
    expect(res.trend).toBe('rapidRising')
    expect(res.readingsUsed).toBe(4)
    expect(res.windowMinutes).toBe(15)
  })

  it('classifies a gentle fall as slightlyFalling', () => {
    const res = computeGlucoseTrend(createGlucoseReadings([120, 115, 110, 105], 'mg/dL', 5))
    expect(res.rocPerMin).toBeCloseTo(-1, 6)
    expect(res.trend).toBe('slightlyFalling')
  })

  it('only uses readings within the trailing window', () => {
    // 7 readings over 30 min; the last 15 min are a fast rise.
    const res = computeGlucoseTrend(
      createGlucoseReadings([50, 60, 70, 100, 120, 140, 160], 'mg/dL', 5)
    )
    expect(res.readingsUsed).toBe(4)
    expect(res.trend).toBe('rapidRising')
  })

  it('normalizes mmol/L readings before computing rate-of-change', () => {
    const base = createGlucoseReadings([100, 120, 140, 160], 'mg/dL', 5)
    const mmol: GlucoseReading[] = base.map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L',
      timestamp: r.timestamp,
    }))
    const res = computeGlucoseTrend(mmol)
    expect(res.rocPerMin).toBeCloseTo(4, 3)
    expect(res.trend).toBe('rapidRising')
  })

  it('honors a custom window', () => {
    const res = computeGlucoseTrend(
      createGlucoseReadings([100, 120, 140, 160], 'mg/dL', 5),
      { windowMin: 30 }
    )
    expect(res.windowMinutes).toBe(30)
    expect(res.readingsUsed).toBe(4)
  })

  it('returns unknown/NaN with fewer than two readings', () => {
    const res = computeGlucoseTrend(createGlucoseReadings([100]))
    expect(res.trend).toBe('unknown')
    expect(Number.isNaN(res.rocPerMin)).toBe(true)
    expect(res.readingsUsed).toBe(0)
  })

  it('returns unknown when the window holds fewer than two readings', () => {
    const res = computeGlucoseTrend(createGlucoseReadings([100, 160], 'mg/dL', 20))
    expect(res.trend).toBe('unknown')
  })

  it('returns unknown when all readings share a timestamp (no time span)', () => {
    const t = '2024-01-01T08:00:00Z'
    const res = computeGlucoseTrend([
      { value: 100, unit: 'mg/dL', timestamp: t },
      { value: 120, unit: 'mg/dL', timestamp: t },
    ])
    expect(res.trend).toBe('unknown')
  })

  it('ignores invalid values and unparseable timestamps', () => {
    const good = createGlucoseReadings([100, 120, 140, 160], 'mg/dL', 5)
    const dirty: GlucoseReading[] = [
      ...good,
      { value: NaN, unit: 'mg/dL', timestamp: good[0].timestamp },
      { value: 120, unit: 'mg/dL', timestamp: 'not-a-date' },
    ]
    const res = computeGlucoseTrend(dirty)
    expect(res.readingsUsed).toBe(4)
    expect(res.trend).toBe('rapidRising')
  })
})

describe('latestReading', () => {
  const a: GlucoseReading = { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' }
  const b: GlucoseReading = { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' }

  it('returns the most recent reading regardless of input order', () => {
    expect(latestReading([a, b])).toBe(b)
    expect(latestReading([b, a])).toBe(b)
  })

  it('skips readings with unparseable timestamps', () => {
    const bad: GlucoseReading = { value: 5, unit: 'mg/dL', timestamp: 'bad' }
    expect(latestReading([a, b, bad])).toBe(b)
  })

  it('returns null for empty input', () => {
    expect(latestReading([])).toBeNull()
  })
})

describe('minutesSinceLastReading', () => {
  const readings: GlucoseReading[] = [
    { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
  ]

  it('measures staleness against an explicit now', () => {
    expect(minutesSinceLastReading(readings, '2024-01-01T08:07:00Z')).toBe(7)
  })

  it('defaults to the current time', () => {
    expect(minutesSinceLastReading(readings)).toBeGreaterThan(0)
  })

  it('returns null when there are no readings', () => {
    expect(minutesSinceLastReading([], '2024-01-01T08:07:00Z')).toBeNull()
  })
})
