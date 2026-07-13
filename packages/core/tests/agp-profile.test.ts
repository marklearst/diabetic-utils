import { describe, it, expect } from 'vitest'
import { buildAGPProfile } from '../src/metrics/agp-profile'
import type { GlucoseReading, GlucoseUnit } from '../src/types'

const r = (
  value: number,
  timestamp: string,
  unit: GlucoseUnit = 'mg/dL'
): GlucoseReading => ({ value, unit, timestamp })

describe('buildAGPProfile', () => {
  it('returns an invalid, fully-gridded empty result for no readings', () => {
    const res = buildAGPProfile([])
    expect(res.valid).toBe(false)
    expect(res.totalReadings).toBe(0)
    expect(res.binMinutes).toBe(5)
    expect(res.bins).toHaveLength(288)
    expect(res.bins[0]).toEqual({
      minuteOfDay: 0,
      percentiles: { 5: null, 25: null, 50: null, 75: null, 95: null },
      n: 0,
    })
  })

  it('pools readings at the same clock time across days and computes nearest-rank percentiles', () => {
    const readings = [
      r(100, '2024-01-01T08:00:00Z'),
      r(120, '2024-01-02T08:00:00Z'),
      r(140, '2024-01-03T08:00:00Z'),
      r(160, '2024-01-04T08:00:00Z'),
      r(180, '2024-01-05T08:00:00Z'),
    ]
    const res = buildAGPProfile(readings)
    expect(res.valid).toBe(true)
    expect(res.totalReadings).toBe(5)
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(bin.n).toBe(5)
    expect(bin.percentiles).toEqual({ 5: 100, 25: 120, 50: 140, 75: 160, 95: 180 })
    const empty = res.bins.find((b) => b.minuteOfDay === 0)!
    expect(empty.n).toBe(0)
    expect(empty.percentiles[50]).toBeNull()
  })

  it('honors binMinutes (60 → 24 hourly bins)', () => {
    const res = buildAGPProfile([r(120, '2024-01-01T08:30:00Z')], { binMinutes: 60 })
    expect(res.bins).toHaveLength(24)
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(bin.n).toBe(1)
    expect(bin.percentiles[50]).toBe(120)
  })

  it('buckets by local time when a timeZone is given', () => {
    const readings = [r(120, '2024-01-01T05:30:00Z')]
    const utc = buildAGPProfile(readings)
    expect(utc.bins.find((b) => b.minuteOfDay === 330)!.n).toBe(1)
    const ny = buildAGPProfile(readings, { timeZone: 'America/New_York' })
    expect(ny.bins.find((b) => b.minuteOfDay === 30)!.n).toBe(1)
  })

  it('normalizes mmol/L input to mg/dL output by default', () => {
    const res = buildAGPProfile([r(5.5, '2024-01-01T08:00:00Z', 'mmol/L')])
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(bin.percentiles[50]).toBe(99.1)
  })

  it('can output percentiles in mmol/L', () => {
    const res = buildAGPProfile([r(180, '2024-01-01T08:00:00Z')], { unit: 'mmol/L' })
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(bin.percentiles[50]).toBe(10)
    expect(res.unit).toBe('mmol/L')
  })

  it('ignores non-finite and non-positive values', () => {
    const readings = [
      r(100, '2024-01-01T08:00:00Z'),
      r(-5, '2024-01-01T08:00:00Z'),
      r(0, '2024-01-01T08:00:00Z'),
      r(NaN, '2024-01-01T08:00:00Z'),
      r(Infinity, '2024-01-01T08:00:00Z'),
      r(200, '2024-01-02T08:00:00Z'),
    ]
    const res = buildAGPProfile(readings)
    expect(res.totalReadings).toBe(2)
    expect(res.bins.find((b) => b.minuteOfDay === 480)!.n).toBe(2)
  })

  it('skips readings with unparseable timestamps', () => {
    const res = buildAGPProfile([r(100, 'not-a-date'), r(120, '2024-01-01T08:00:00Z')])
    expect(res.totalReadings).toBe(1)
  })

  it('supports linear (interpolated) percentiles as an opt-in', () => {
    const readings = [r(100, '2024-01-01T08:00:00Z'), r(200, '2024-01-02T08:00:00Z')]
    const linear = buildAGPProfile(readings, { method: 'linear', percentiles: [0, 50, 100] })
    const lb = linear.bins.find((b) => b.minuteOfDay === 480)!
    expect(lb.percentiles[0]).toBe(100)
    expect(lb.percentiles[50]).toBe(150)
    expect(lb.percentiles[100]).toBe(200)
    const nearest = buildAGPProfile(readings, { percentiles: [50] })
    expect(nearest.bins.find((b) => b.minuteOfDay === 480)!.percentiles[50]).toBe(100)
  })

  it('accepts custom percentiles and ignores out-of-range ones', () => {
    const res = buildAGPProfile(
      [r(100, '2024-01-01T08:00:00Z'), r(200, '2024-01-02T08:00:00Z')],
      { percentiles: [10, 90, -5, 150] }
    )
    expect(res.percentiles).toEqual([10, 90])
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(Object.keys(bin.percentiles).map(Number).sort((a, b) => a - b)).toEqual([10, 90])
  })

  it('handles boundary percentiles 0 and 100 (nearest-rank)', () => {
    const readings = [
      r(100, '2024-01-01T08:00:00Z'),
      r(140, '2024-01-02T08:00:00Z'),
      r(200, '2024-01-03T08:00:00Z'),
    ]
    const res = buildAGPProfile(readings, { percentiles: [0, 100] })
    const bin = res.bins.find((b) => b.minuteOfDay === 480)!
    expect(bin.percentiles[0]).toBe(100)
    expect(bin.percentiles[100]).toBe(200)
  })

  it('throws on an invalid IANA time zone', () => {
    expect(() =>
      buildAGPProfile([r(100, '2024-01-01T08:00:00Z')], { timeZone: 'Mars/Phobos' })
    ).toThrow(/time zone/i)
  })

  it('throws on invalid binMinutes', () => {
    expect(() => buildAGPProfile([], { binMinutes: 0 })).toThrow(/binMinutes/i)
    expect(() => buildAGPProfile([], { binMinutes: -5 })).toThrow(/binMinutes/i)
    expect(() => buildAGPProfile([], { binMinutes: 2000 })).toThrow(/binMinutes/i)
    expect(() => buildAGPProfile([], { binMinutes: 7.3 })).toThrow(/binMinutes/i)
  })
})
