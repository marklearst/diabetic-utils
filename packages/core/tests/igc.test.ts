import { describe, it, expect } from 'vitest'
import { calculateIGC } from '../src/metrics/igc'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'

describe('calculateIGC (Rodbard hypo/hyper index and Index of Glycemic Control)', () => {
  it('matches the golden values with default parameters', () => {
    // [50,70,100,160,200], n=5, LLTR=80 ULTR=140 b=2 a=1.1 c=d=30
    const res = calculateIGC([50, 70, 100, 160, 200])
    expect(res.hypoIndex).toBeCloseTo(6.6667, 3)
    expect(res.hyperIndex).toBeCloseTo(0.7823, 3)
    expect(res.igc).toBeCloseTo(7.449, 3)
  })

  it('is zero for an all-in-range trace (but counts toward n)', () => {
    const res = calculateIGC([100, 120, 130])
    expect(res.hypoIndex).toBe(0)
    expect(res.hyperIndex).toBe(0)
    expect(res.igc).toBe(0)
  })

  it('returns NaN fields when there are no valid readings', () => {
    const res = calculateIGC([0, -5, NaN])
    expect(Number.isNaN(res.hypoIndex)).toBe(true)
    expect(Number.isNaN(res.hyperIndex)).toBe(true)
    expect(Number.isNaN(res.igc)).toBe(true)
  })

  it('normalizes mmol/L input', () => {
    const mgdl = [50, 70, 100, 160, 200]
    const mmol = mgdl.map((v) => v / MGDL_MMOLL_CONVERSION)
    const res = calculateIGC(mmol, { unit: 'mmol/L' })
    expect(res.igc).toBeCloseTo(calculateIGC(mgdl).igc, 3)
  })

  it('honors custom limits, exponents, and scales', () => {
    const res = calculateIGC([60, 100, 220], {
      lltr: 70,
      ultr: 180,
      hypoExponent: 2,
      hyperExponent: 1.1,
      hypoScale: 25,
      hyperScale: 25,
    })
    expect(res.hypoIndex).toBeGreaterThan(0) // 60 < 70
    expect(res.hyperIndex).toBeGreaterThan(0) // 220 > 180
    expect(res.igc).toBeCloseTo(res.hypoIndex + res.hyperIndex, 4)
  })
})
