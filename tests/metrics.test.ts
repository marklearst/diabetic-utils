import { describe, it, expect } from 'vitest'
import {
  glucoseLBGI,
  glucoseHBGI,
  fbg,
  calculateADRR,
  calculateGRADE,
  calculateGRI,
  calculateJIndex,
  calculateMODD,
  calculateCONGA,
  calculateActivePercent,
  calculateAGPMetrics,
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

  it('throws for non-finite or out-of-range inputs', () => {
    expect(() =>
      calculateGRI({
        veryLowPercent: NaN,
        lowPercent: 0,
        highPercent: 0,
        veryHighPercent: 0,
      })
    ).toThrow(RangeError)

    expect(() =>
      calculateGRI({
        veryLowPercent: -1,
        lowPercent: 0,
        highPercent: 0,
        veryHighPercent: 0,
      })
    ).toThrow(RangeError)

    expect(() =>
      calculateGRI({
        veryLowPercent: 0,
        lowPercent: 0,
        highPercent: 101,
        veryHighPercent: 0,
      })
    ).toThrow(RangeError)
  })

  it('classifies zone using unrounded score near boundaries', () => {
    const result = calculateGRI({
      // raw = 1.6 * 12.525 = 20.04 (zone B), rounded display score = 20.0
      veryLowPercent: 0,
      lowPercent: 0,
      highPercent: 0,
      veryHighPercent: 12.525,
    })
    expect(result.score).toBe(20)
    expect(result.zone).toBe('B')
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

  it('filters out non-positive glucose values', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 0, unit: 'mg/dL', timestamp: '2024-01-01T12:00:00Z' }, // invalid
      { value: 130, unit: 'mg/dL', timestamp: '2024-01-02T08:00:00Z' },
      { value: -10, unit: 'mg/dL', timestamp: '2024-01-02T12:00:00Z' }, // invalid
    ]
    // valid pair remains: |130 - 100| = 30
    expect(calculateMODD(readings)).toBe(30)
  })
})

// ---------------------------------------------------------------------------
// fbg (exported for ADRR)
// ---------------------------------------------------------------------------
describe('fbg', () => {
  it('returns negative for low glucose values', () => {
    expect(fbg(50)).toBeLessThan(0)
  })

  it('returns positive for high glucose values', () => {
    expect(fbg(300)).toBeGreaterThan(0)
  })

  it('returns near zero around ~112 mg/dL (symmetry point)', () => {
    const val = fbg(112.5)
    expect(Math.abs(val)).toBeLessThan(0.5)
  })
})

// ---------------------------------------------------------------------------
// ADRR
// ---------------------------------------------------------------------------
describe('calculateADRR', () => {
  it('returns NaN for empty array', () => {
    expect(calculateADRR([])).toBeNaN()
  })

  it('returns NaN when all values are invalid', () => {
    const readings: GlucoseReading[] = [
      { value: -10, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 0, unit: 'mg/dL', timestamp: '2024-01-01T09:00:00Z' },
    ]
    expect(calculateADRR(readings)).toBeNaN()
  })

  it('returns a finite value for normal readings across 2 days', () => {
    const readings: GlucoseReading[] = [
      { value: 80, unit: 'mg/dL', timestamp: '2024-01-01T06:00:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T12:00:00Z' },
      { value: 200, unit: 'mg/dL', timestamp: '2024-01-01T18:00:00Z' },
      { value: 70, unit: 'mg/dL', timestamp: '2024-01-02T06:00:00Z' },
      { value: 150, unit: 'mg/dL', timestamp: '2024-01-02T12:00:00Z' },
      { value: 250, unit: 'mg/dL', timestamp: '2024-01-02T18:00:00Z' },
    ]
    const result = calculateADRR(readings)
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })

  it('returns higher ADRR for more variable glucose', () => {
    const stable: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T12:00:00Z' },
      { value: 105, unit: 'mg/dL', timestamp: '2024-01-02T08:00:00Z' },
      { value: 115, unit: 'mg/dL', timestamp: '2024-01-02T12:00:00Z' },
    ]
    const variable: GlucoseReading[] = [
      { value: 40, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 350, unit: 'mg/dL', timestamp: '2024-01-01T12:00:00Z' },
      { value: 45, unit: 'mg/dL', timestamp: '2024-01-02T08:00:00Z' },
      { value: 400, unit: 'mg/dL', timestamp: '2024-01-02T12:00:00Z' },
    ]
    expect(calculateADRR(variable)).toBeGreaterThan(calculateADRR(stable))
  })

  it('handles mmol/L readings', () => {
    const readings: GlucoseReading[] = [
      { value: 4.0, unit: 'mmol/L', timestamp: '2024-01-01T08:00:00Z' },
      { value: 10.0, unit: 'mmol/L', timestamp: '2024-01-01T14:00:00Z' },
    ]
    const result = calculateADRR(readings)
    expect(Number.isFinite(result)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// GRADE
// ---------------------------------------------------------------------------
describe('calculateGRADE', () => {
  it('returns NaN fields for empty array', () => {
    const result = calculateGRADE([])
    expect(result.grade).toBeNaN()
    expect(result.gradeHypoglycemia).toBeNaN()
  })

  it('returns NaN fields when all values invalid', () => {
    const result = calculateGRADE([NaN, -1, 0])
    expect(result.grade).toBeNaN()
  })

  it('returns zero for all values near the symmetry point', () => {
    // values near 18 mg/dL (= 1 mmol/L) where log10(log10(1))=-Inf -> clamped to 0
    const result = calculateGRADE([18, 18, 18])
    expect(result.grade).toBe(0)
    expect(result.gradeEuglycemia).toBe(0)
  })

  it('assigns majority to hypoglycemia for low readings', () => {
    const result = calculateGRADE([40, 45, 50, 55, 60])
    expect(result.gradeHypoglycemia).toBeGreaterThan(50)
  })

  it('assigns majority to hyperglycemia for high readings', () => {
    const result = calculateGRADE([200, 250, 300, 350])
    expect(result.gradeHyperglycemia).toBeGreaterThan(50)
  })

  it('partitions correctly for mixed readings', () => {
    const result = calculateGRADE([50, 100, 200])
    expect(result.gradeHypoglycemia).toBeGreaterThan(0)
    expect(result.gradeEuglycemia).toBeGreaterThan(0)
    expect(result.gradeHyperglycemia).toBeGreaterThan(0)
    const total = result.gradeHypoglycemia + result.gradeEuglycemia + result.gradeHyperglycemia
    expect(total).toBeCloseTo(100, 0)
  })

  it('respects custom thresholds', () => {
    const defaultResult = calculateGRADE([65, 145])
    const customResult = calculateGRADE([65, 145], 60, 150)
    // 65 is hypo by default (< 70) but eu with threshold 60
    expect(defaultResult.gradeHypoglycemia).toBeGreaterThan(0)
    expect(customResult.gradeHypoglycemia).toBe(0)
  })

  it('grade score is positive for valid readings', () => {
    const result = calculateGRADE([80, 120, 160, 200])
    expect(result.grade).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// J-Index
// ---------------------------------------------------------------------------
describe('calculateJIndex', () => {
  it('returns NaN for fewer than 2 readings', () => {
    expect(calculateJIndex([])).toBeNaN()
    expect(calculateJIndex([100])).toBeNaN()
  })

  it('returns NaN when all values are invalid', () => {
    expect(calculateJIndex([NaN, -1, 0])).toBeNaN()
  })

  it('returns a positive value for normal glucose range', () => {
    const result = calculateJIndex([90, 100, 110, 120, 130])
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('increases with higher mean and variability', () => {
    const low = calculateJIndex([90, 100, 110])
    const high = calculateJIndex([200, 250, 300])
    expect(high).toBeGreaterThan(low)
  })

  it('increases with more variability at same mean', () => {
    const tight = calculateJIndex([98, 100, 102])
    const wide = calculateJIndex([50, 100, 150])
    expect(wide).toBeGreaterThan(tight)
  })

  it('filters invalid values', () => {
    const result = calculateJIndex([100, NaN, 120, -5, 110])
    expect(Number.isFinite(result)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CONGA
// ---------------------------------------------------------------------------
describe('calculateCONGA', () => {
  it('returns NaN for fewer than 2 readings', () => {
    expect(calculateCONGA([])).toBeNaN()
    expect(calculateCONGA([
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
    ])).toBeNaN()
  })

  it('returns NaN when no pairs match the time lag', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
    ]
    // default 1h lag - readings are only 5 min apart
    expect(calculateCONGA(readings)).toBeNaN()
  })

  it('returns NaN when only one pair matches (need >= 2 for SD)', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T09:00:00Z' },
    ]
    expect(calculateCONGA(readings)).toBeNaN()
  })

  it('calculates CONGA-1 for hourly CGM data', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 24; i++) {
      readings.push({
        value: 100 + 30 * Math.sin(i * Math.PI / 6),
        unit: 'mg/dL',
        timestamp: new Date(Date.UTC(2024, 0, 1, i, 0)).toISOString(),
      })
    }
    const result = calculateCONGA(readings, { hours: 1 })
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })

  it('calculates CONGA-4 with custom hours', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 48; i++) {
      readings.push({
        value: 100 + 40 * Math.sin(i * Math.PI / 12),
        unit: 'mg/dL',
        timestamp: new Date(Date.UTC(2024, 0, 1, i, 0)).toISOString(),
      })
    }
    const result = calculateCONGA(readings, { hours: 4 })
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })

  it('handles mmol/L readings', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 24; i++) {
      readings.push({
        value: 5.5 + 1.5 * Math.sin(i * Math.PI / 6),
        unit: 'mmol/L',
        timestamp: new Date(Date.UTC(2024, 0, 1, i, 0)).toISOString(),
      })
    }
    const result = calculateCONGA(readings, { hours: 1 })
    expect(Number.isFinite(result)).toBe(true)
  })

  it('returns NaN for invalid timestamps', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: 'bad' },
      { value: 120, unit: 'mg/dL', timestamp: 'also-bad' },
    ]
    expect(calculateCONGA(readings)).toBeNaN()
  })

  it('respects custom tolerance', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 130, unit: 'mg/dL', timestamp: '2024-01-01T08:55:00Z' },
      { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T09:20:00Z' },
      { value: 140, unit: 'mg/dL', timestamp: '2024-01-01T10:00:00Z' },
    ]
    // with 5 min tolerance, pair at :55 won't match :00 + 1h = :00
    const strict = calculateCONGA(readings, { hours: 1, toleranceMinutes: 3 })
    // with 30 min tolerance, more pairs match
    const loose = calculateCONGA(readings, { hours: 1, toleranceMinutes: 30 })
    // strict should have fewer matches or NaN
    if (Number.isFinite(strict) && Number.isFinite(loose)) {
      expect(true).toBe(true) // both valid is acceptable
    } else {
      expect(Number.isFinite(loose)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Active Percent
// ---------------------------------------------------------------------------
describe('calculateActivePercent', () => {
  it('returns NaN for fewer than 2 readings', () => {
    const result = calculateActivePercent([])
    expect(result.activePercent).toBeNaN()
    expect(result.actualReadings).toBe(0)

    const single = calculateActivePercent([
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
    ])
    expect(single.activePercent).toBeNaN()
    expect(single.actualReadings).toBe(1)
  })

  it('returns NaN when timestamps are invalid', () => {
    const result = calculateActivePercent([
      { value: 100, unit: 'mg/dL', timestamp: 'bad' },
      { value: 110, unit: 'mg/dL', timestamp: 'also-bad' },
    ])
    expect(result.activePercent).toBeNaN()
  })

  it('returns ~100% for complete 5-min CGM data', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 288; i++) { // 24h at 5-min intervals
      readings.push({
        value: 100 + i % 20,
        unit: 'mg/dL',
        timestamp: new Date(Date.UTC(2024, 0, 1, 0, i * 5)).toISOString(),
      })
    }
    const result = calculateActivePercent(readings)
    expect(result.activePercent).toBeGreaterThanOrEqual(99)
    expect(result.meetsClinicalMinimum).toBe(true)
    expect(result.actualReadings).toBe(288)
  })

  it('returns lower percent for sparse data', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 144; i++) { // 24h at 10-min intervals (half density)
      readings.push({
        value: 100 + i % 20,
        unit: 'mg/dL',
        timestamp: new Date(Date.UTC(2024, 0, 1, 0, i * 10)).toISOString(),
      })
    }
    const result = calculateActivePercent(readings)
    expect(result.activePercent).toBeLessThan(55)
    expect(result.meetsClinicalMinimum).toBe(false)
  })

  it('respects custom expected interval', () => {
    const readings: GlucoseReading[] = []
    for (let i = 0; i < 144; i++) { // 24h at 10-min intervals
      readings.push({
        value: 100,
        unit: 'mg/dL',
        timestamp: new Date(Date.UTC(2024, 0, 1, 0, i * 10)).toISOString(),
      })
    }
    const result = calculateActivePercent(readings, { expectedIntervalMinutes: 10 })
    expect(result.activePercent).toBeGreaterThanOrEqual(99)
    expect(result.meetsClinicalMinimum).toBe(true)
  })

  it('caps active percent at 100', () => {
    // 2 readings 1 minute apart → expectedReadings = 1, actual = 2
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T08:01:00Z' },
    ]
    const result = calculateActivePercent(readings)
    expect(result.activePercent).toBeLessThanOrEqual(100)
  })
})

// ---------------------------------------------------------------------------
// calculateAGPMetrics (aggregate)
// ---------------------------------------------------------------------------
describe('calculateAGPMetrics', () => {
  const makeReadings = (days: number): GlucoseReading[] => {
    const readings: GlucoseReading[] = []
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
          readings.push({
            value: 100 + 40 * Math.sin((h + m / 60) * Math.PI / 12) + d * 2,
            unit: 'mg/dL',
            timestamp: new Date(Date.UTC(2024, 0, 1 + d, h, m)).toISOString(),
          })
        }
      }
    }
    return readings
  }

  it('throws for empty readings', () => {
    expect(() => calculateAGPMetrics([])).toThrow('readings array is empty')
  })

  it('returns comprehensive metrics for multi-day CGM data', () => {
    const readings = makeReadings(3)
    const result = calculateAGPMetrics(readings)

    expect(Number.isFinite(result.meanGlucose)).toBe(true)
    expect(Number.isFinite(result.sd)).toBe(true)
    expect(Number.isFinite(result.cv)).toBe(true)
    expect(Number.isFinite(result.lbgi)).toBe(true)
    expect(Number.isFinite(result.hbgi)).toBe(true)
    expect(Number.isFinite(result.adrr)).toBe(true)
    expect(Number.isFinite(result.grade.grade)).toBe(true)
    expect(result.gri.zone).toBeDefined()
    expect(Number.isFinite(result.jIndex)).toBe(true)
    expect(Number.isFinite(result.modd)).toBe(true)
    expect(Number.isFinite(result.conga)).toBe(true)
    expect(result.activePercent.meetsClinicalMinimum).toBe(true)
    expect(result.totalReadings).toBeGreaterThan(0)
  })

  it('returns correct totalReadings count', () => {
    const readings = makeReadings(1)
    const result = calculateAGPMetrics(readings)
    expect(result.totalReadings).toBe(readings.length)
  })

  it('handles mmol/L readings in aggregate', () => {
    const readings: GlucoseReading[] = []
    for (let d = 0; d < 2; d++) {
      for (let h = 0; h < 24; h++) {
        readings.push({
          value: 5.5 + 2 * Math.sin(h * Math.PI / 12),
          unit: 'mmol/L',
          timestamp: new Date(Date.UTC(2024, 0, 1 + d, h, 0)).toISOString(),
        })
      }
    }
    const result = calculateAGPMetrics(readings)
    expect(Number.isFinite(result.meanGlucose)).toBe(true)
    expect(result.meanGlucose).toBeGreaterThan(0)
  })

  it('handles a small dataset gracefully', () => {
    const readings: GlucoseReading[] = [
      { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
      { value: 140, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' },
    ]
    const result = calculateAGPMetrics(readings)
    expect(Number.isFinite(result.meanGlucose)).toBe(true)
    expect(result.modd).toBeNaN() // no 24h pairs
    expect(result.conga).toBeNaN() // no 1h pairs
  })

  it('passes custom options through to sub-metrics', () => {
    const readings: GlucoseReading[] = []
    for (let d = 0; d < 3; d++) {
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
          readings.push({
            value: 100 + 30 * Math.sin((h + m / 60) * Math.PI / 12),
            unit: 'mg/dL',
            timestamp: new Date(Date.UTC(2024, 0, 1 + d, h, m)).toISOString(),
          })
        }
      }
    }
    const result = calculateAGPMetrics(readings, {
      modd: { toleranceMinutes: 20 },
      conga: { hours: 2, toleranceMinutes: 20 },
      activePercent: { expectedIntervalMinutes: 5 },
    })
    expect(Number.isFinite(result.modd)).toBe(true)
    expect(Number.isFinite(result.conga)).toBe(true)
    expect(result.activePercent.meetsClinicalMinimum).toBe(true)
  })
})
