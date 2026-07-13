import { describe, it, expect } from 'vitest'
import { aggregateCohort } from '../src/cohort'
import { createGlucoseReadings } from './test-helpers'
import type { GlucoseReading } from '../src/types'

const inRange = createGlucoseReadings([100, 120, 110, 130], 'mg/dL', 5)
const halfHigh = createGlucoseReadings([120, 200, 220, 140], 'mg/dL', 5)
const someLow = createGlucoseReadings([60, 55, 100, 120], 'mg/dL', 5)

describe('aggregateCohort', () => {
  it('summarizes per-patient metrics across a cohort', () => {
    const res = aggregateCohort([inRange, halfHigh, someLow])
    expect(res.patientCount).toBe(3)
    expect(res.tir.max).toBe(100) // the all-in-range patient
    expect(res.tir.min).toBe(50)
    expect(res.gmi.mean).toBeGreaterThan(0)
    expect(res.meanGlucose.median).toBeGreaterThan(0)
    expect(res.cv.mean).toBeGreaterThanOrEqual(0)
  })

  it('skips patients with no valid readings', () => {
    const empty: GlucoseReading[] = []
    expect(aggregateCohort([inRange, empty, halfHigh]).patientCount).toBe(2)
  })

  it('returns a single-patient distribution equal to that patient', () => {
    const res = aggregateCohort([inRange])
    expect(res.patientCount).toBe(1)
    expect(res.tir.mean).toBe(100)
    expect(res.tir.median).toBe(100)
    expect(res.tir.min).toBe(100)
    expect(res.tir.max).toBe(100)
  })

  it('normalizes mmol/L patients and ignores invalid readings', () => {
    const mmolPatient: GlucoseReading[] = [
      { value: 5.5, unit: 'mmol/L', timestamp: '2024-01-01T08:00:00Z' }, // ~99 in range
      { value: 6.5, unit: 'mmol/L', timestamp: '2024-01-01T08:05:00Z' }, // ~117 in range
      { value: NaN, unit: 'mmol/L', timestamp: '2024-01-01T08:10:00Z' },
      { value: -1, unit: 'mmol/L', timestamp: '2024-01-01T08:15:00Z' },
      { value: 40, unit: 'mmol/L', timestamp: '2024-01-01T08:20:00Z' }, // ~720 mg/dL, out of range
    ]
    const res = aggregateCohort([mmolPatient], { unit: 'mmol/L' })
    expect(res.patientCount).toBe(1)
    expect(res.tir.mean).toBe(100)
  })

  it('returns NaN stats for an empty cohort', () => {
    const res = aggregateCohort([])
    expect(res.patientCount).toBe(0)
    expect(Number.isNaN(res.tir.mean)).toBe(true)
    expect(Number.isNaN(res.gmi.median)).toBe(true)
  })
})
