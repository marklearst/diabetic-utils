import { describe, it, expect } from 'vitest'
import { analyzeMealResponse } from '../src/metrics/meal'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading, GlucoseUnit } from '../src/types'

const base = Date.UTC(2024, 0, 1, 8, 0, 0)
const mealTime = new Date(base).toISOString()
const at = (min: number, value: number, unit: GlucoseUnit = 'mg/dL'): GlucoseReading => ({
  value,
  unit,
  timestamp: new Date(base + min * 60000).toISOString(),
})

describe('analyzeMealResponse', () => {
  it('analyzes a classic meal response (rise, peak, return to baseline)', () => {
    const readings = [
      at(0, 100),
      at(15, 120),
      at(30, 150),
      at(45, 160),
      at(60, 140),
      at(90, 110),
      at(120, 100),
    ]
    const res = analyzeMealResponse(readings, mealTime)
    expect(res.valid).toBe(true)
    expect(res.baseline).toBe(100)
    expect(res.peakValue).toBe(160)
    expect(res.delta).toBe(60)
    expect(res.timeToPeakMin).toBe(45)
    expect(res.returnToBaselineMin).toBe(120)
    expect(res.readingCount).toBe(7)
    expect(res.windowMinutes).toBe(120)
    expect(res.iAUC).toBeGreaterThan(0)
  })

  it('uses a pre-meal reading as baseline and reports null when glucose never returns', () => {
    const readings = [at(-10, 95), at(30, 150), at(60, 120)]
    const res = analyzeMealResponse(readings, mealTime)
    expect(res.baseline).toBe(95)
    expect(res.peakValue).toBe(150)
    expect(res.returnToBaselineMin).toBeNull()
    expect(res.valid).toBe(true)
  })

  it('falls back to the first in-window reading when there is no pre-meal reading', () => {
    const readings = [at(5, 100), at(35, 150), at(65, 100)]
    const res = analyzeMealResponse(readings, mealTime)
    expect(res.baseline).toBe(100)
    expect(res.timeToPeakMin).toBe(35)
    expect(res.returnToBaselineMin).toBe(65)
  })

  it('returns an invalid result for an unparseable meal time', () => {
    const res = analyzeMealResponse([at(0, 100), at(30, 150)], 'not-a-date')
    expect(res.valid).toBe(false)
    expect(Number.isNaN(res.peakValue)).toBe(true)
  })

  it('is invalid when the window holds fewer than two readings', () => {
    const res = analyzeMealResponse([at(-30, 100), at(-10, 100)], mealTime)
    expect(res.valid).toBe(false)
    expect(res.readingCount).toBe(0)
  })

  it('honors a custom window and mmol/L unit, ignoring invalid readings', () => {
    const readings: GlucoseReading[] = [
      at(0, 100 / MGDL_MMOLL_CONVERSION, 'mmol/L'),
      at(30, 150 / MGDL_MMOLL_CONVERSION, 'mmol/L'),
      { value: NaN, unit: 'mmol/L', timestamp: new Date(base + 40 * 60000).toISOString() },
      { value: 5, unit: 'mmol/L', timestamp: 'bad' },
      at(90, 100 / MGDL_MMOLL_CONVERSION, 'mmol/L'), // outside the 60-min window
    ]
    const res = analyzeMealResponse(readings, mealTime, { windowMin: 60, unit: 'mmol/L' })
    expect(res.windowMinutes).toBe(60)
    expect(res.readingCount).toBe(2)
    expect(res.baseline).toBe(5.5)
    expect(res.peakValue).toBe(8.3)
  })
})
