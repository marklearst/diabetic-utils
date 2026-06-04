import { describe, it, expect } from 'vitest'
import { calculateTITR } from '../src/tir'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

describe('calculateTITR (Time in Tight Range, 70-140 mg/dL)', () => {
  it('computes tight-range percentages with inclusive 70 and 140 bounds', () => {
    const readings = createGlucoseReadings([50, 70, 100, 140, 200])
    const res = calculateTITR(readings)
    expect(res.inRange).toBe(60) // 70, 100, 140
    expect(res.belowRange).toBe(20) // 50
    expect(res.aboveRange).toBe(20) // 200
    expect(res.readingCount).toBe(5)
    expect(res.target).toBe(50)
    expect(res.meetsTarget).toBe(true) // 60 >= 50
  })

  it('normalizes mmol/L readings to mg/dL before thresholding', () => {
    const mgdlValues = [50, 90, 120, 200]
    const mgdl = createGlucoseReadings(mgdlValues)
    const mmol: GlucoseReading[] = mgdlValues.map((v, i) => ({
      value: v / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L',
      timestamp: mgdl[i].timestamp,
    }))
    expect(calculateTITR(mmol)).toEqual(calculateTITR(mgdl))
  })

  it('flags meetsTarget false when tight-range time is below target', () => {
    const res = calculateTITR(createGlucoseReadings([200, 210, 220, 50, 100]))
    expect(res.inRange).toBe(20)
    expect(res.meetsTarget).toBe(false)
  })

  it('returns a typed zero result for empty input (does not throw)', () => {
    const res = calculateTITR([])
    expect(res).toEqual({
      inRange: 0,
      belowRange: 0,
      aboveRange: 0,
      meetsTarget: false,
      target: 50,
      readingCount: 0,
    })
  })

  it('honors custom thresholds and target', () => {
    const readings = createGlucoseReadings([60, 63, 100, 140, 141])
    const res = calculateTITR(readings, {
      lowThreshold: 63,
      highThreshold: 140,
      target: 60,
    })
    expect(res.inRange).toBe(60) // 63, 100, 140
    expect(res.meetsTarget).toBe(true) // 60 >= 60
  })
})
