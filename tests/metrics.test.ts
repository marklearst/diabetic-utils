import { describe, it, expect } from 'vitest'
import {
  glucoseLBGI,
  glucoseHBGI,
  calculateGRI,
  calculateMODD,
} from '../src/metrics'
import type { GlucoseReading } from '../src'

// ---------------------------------------------------------------------------
// LBGI / HBGI
// ---------------------------------------------------------------------------
describe('glucoseLBGI', () => {
  it('returns NaN for empty array', () => {
    expect(glucoseLBGI([])).toBeNaN()
  })

  it('returns NaN when all values are invalid', () => {
    expect(glucoseLBGI([NaN, -1, 0, Infinity])).toBeNaN()
  })

  it('returns 0 for readings that are all high (no hypo risk)', () => {
    const readings = [200, 220, 250, 300]
    const result = glucoseLBGI(readings)
    expect(result).toBeCloseTo(0, 1)
  })

  it('returns positive value for hypoglycemic readings', () => {
    const readings = [50, 55, 60, 65, 70]
    const result = glucoseLBGI(readings)
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('increases with more severe hypoglycemia', () => {
    const mild = glucoseLBGI([65, 70, 75, 80])
    const severe = glucoseLBGI([40, 45, 50, 55])
    expect(severe).toBeGreaterThan(mild)
  })

  it('filters out non-finite and non-positive values', () => {
    const result = glucoseLBGI([50, NaN, 60, -10, 70, Infinity])
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })
})

describe('glucoseHBGI', () => {
  it('returns NaN for empty array', () => {
    expect(glucoseHBGI([])).toBeNaN()
  })

  it('returns NaN when all values are invalid', () => {
    expect(glucoseHBGI([NaN, 0, -5])).toBeNaN()
  })

  it('returns 0 for readings that are all low (no hyper risk)', () => {
    const readings = [50, 55, 60, 65]
    const result = glucoseHBGI(readings)
    expect(result).toBeCloseTo(0, 1)
  })

  it('returns positive value for hyperglycemic readings', () => {
    const readings = [200, 250, 300, 350]
    const result = glucoseHBGI(readings)
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('increases with more severe hyperglycemia', () => {
    const mild = glucoseHBGI([180, 190, 200, 210])
    const severe = glucoseHBGI([300, 350, 400, 450])
    expect(severe).toBeGreaterThan(mild)
  })

  it('normal range readings produce low HBGI', () => {
    const readings = [90, 100, 110, 120, 130]
    const result = glucoseHBGI(readings)
    expect(result).toBeLessThan(4.5)
  })
})

// ---------------------------------------------------------------------------
// GRI
// ---------------------------------------------------------------------------
describe('calculateGRI', () => {
  it('returns zone A for excellent control', () => {
    const result = calculateGRI({
      veryLowPercent: 0,
      lowPercent: 1,
      highPercent: 5,
      veryHighPercent: 0,
    })
    expect(result.score).toBeLessThanOrEqual(20)
    expect(result.zone).toBe('A')
    expect(result.hypoComponent).toBeGreaterThanOrEqual(0)
    expect(result.hyperComponent).toBeGreaterThanOrEqual(0)
  })

  it('returns zone E for very poor control', () => {
    const result = calculateGRI({
      veryLowPercent: 5,
      lowPercent: 10,
      highPercent: 30,
      veryHighPercent: 15,
    })
    expect(result.score).toBeGreaterThan(80)
    expect(result.zone).toBe('E')
  })

  it('clamps score to 100', () => {
    const result = calculateGRI({
      veryLowPercent: 20,
      lowPercent: 20,
      highPercent: 50,
      veryHighPercent: 30,
    })
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('returns score of 0 for no out-of-range time', () => {
    const result = calculateGRI({
      veryLowPercent: 0,
      lowPercent: 0,
      highPercent: 0,
      veryHighPercent: 0,
    })
    expect(result.score).toBe(0)
    expect(result.zone).toBe('A')
  })

  it('assigns zone B correctly', () => {
    const result = calculateGRI({
      veryLowPercent: 0,
      lowPercent: 2,
      highPercent: 20,
      veryHighPercent: 2,
    })
    expect(result.score).toBeGreaterThan(20)
    expect(result.score).toBeLessThanOrEqual(40)
    expect(result.zone).toBe('B')
  })

  it('assigns zone C correctly', () => {
    const result = calculateGRI({
      veryLowPercent: 1,
      lowPercent: 5,
      highPercent: 25,
      veryHighPercent: 10,
    })
    expect(result.score).toBeGreaterThan(40)
    expect(result.score).toBeLessThanOrEqual(60)
    expect(result.zone).toBe('C')
  })

  it('assigns zone D correctly', () => {
    const result = calculateGRI({
      veryLowPercent: 2,
      lowPercent: 8,
      highPercent: 30,
      veryHighPercent: 10,
    })
    expect(result.score).toBeGreaterThan(60)
    expect(result.score).toBeLessThanOrEqual(80)
    expect(result.zone).toBe('D')
  })

  it('correctly separates hypo and hyper components', () => {
    const result = calculateGRI({
      veryLowPercent: 2,
      lowPercent: 3,
      highPercent: 10,
      veryHighPercent: 5,
    })
    expect(result.hypoComponent).toBeCloseTo(3.0 * 2 + 2.4 * 3, 0)
    expect(result.hyperComponent).toBeCloseTo(1.6 * 5 + 0.8 * 10, 0)
  })
})

// ---------------------------------------------------------------------------
// MODD
// ---------------------------------------------------------------------------
describe('calculateMODD', () => {
  it('returns NaN for fewer than 2 readings', () => {
    expect(calculateMODD([])).toBeNaN()
    expect(
      calculateMODD([
        { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      ])
    ).toBeNaN()
  })

  it('returns NaN when no 24h pairs can be matched', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
    ]
    expect(calculateMODD(readings)).toBeNaN()
  })

  it('calculates MODD for perfectly matched 24h pairs', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T12:00:00Z' },
      { value: 130, unit: 'mg/dL', timestamp: '2024-01-02T08:00:00Z' },
      { value: 140, unit: 'mg/dL', timestamp: '2024-01-02T12:00:00Z' },
    ]
    const result = calculateMODD(readings)
    // |130-100| = 30 and |140-120| = 20, mean = 25
    expect(result).toBeCloseTo(25, 0)
  })

  it('handles mmol/L readings by converting to mg/dL', () => {
    const readings: GlucoseReading[] = [
      { value: 5.5, unit: 'mmol/L', timestamp: '2024-01-01T08:00:00Z' },
      { value: 7.0, unit: 'mmol/L', timestamp: '2024-01-02T08:00:00Z' },
    ]
    const result = calculateMODD(readings)
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })

  it('returns 0 when glucose is identical across days', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-02T08:00:00Z' },
    ]
    const result = calculateMODD(readings)
    expect(result).toBe(0)
  })

  it('respects custom tolerance window', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 130, unit: 'mg/dL', timestamp: '2024-01-02T08:25:00Z' },
    ]
    // 25 min apart from 24h mark, default 15min tolerance won't match
    expect(calculateMODD(readings)).toBeNaN()
    // But 30 min tolerance will match
    const result = calculateMODD(readings, { toleranceMinutes: 30 })
    expect(result).toBeCloseTo(30, 0)
  })

  it('returns NaN for all invalid timestamps', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: 'bad' },
      { value: 110, unit: 'mg/dL', timestamp: 'also-bad' },
    ]
    expect(calculateMODD(readings)).toBeNaN()
  })
})
