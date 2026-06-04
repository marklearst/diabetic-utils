import { describe, it, expect } from 'vitest'
import { glucoseMValue } from '../src/metrics/m-value'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'

describe('glucoseMValue (Schlichtkrull M-value)', () => {
  it('matches the golden value with the W correction (manuscript form)', () => {
    // [120,100,140,80,160,110] index 120: mean 1.37683 + W 4.0 = 5.38
    expect(glucoseMValue([120, 100, 140, 80, 160, 110])).toBeCloseTo(5.38, 2)
  })

  it('matches the golden value without the W correction (EasyGV form)', () => {
    expect(
      glucoseMValue([120, 100, 140, 80, 160, 110], { includeCorrection: false })
    ).toBeCloseTo(1.38, 2)
  })

  it('is log-symmetric about the index and zero at the index', () => {
    // W=0 for a single reading, so M == |10*log10(x/120)|^3
    expect(glucoseMValue([120])).toBe(0)
    expect(glucoseMValue([60])).toBeCloseTo(27.28, 2)
    expect(glucoseMValue([240])).toBeCloseTo(27.28, 2)
  })

  it('honors a custom index', () => {
    expect(glucoseMValue([100], { index: 100 })).toBe(0)
  })

  it('normalizes mmol/L input', () => {
    const mgdl = [120, 100, 140, 80, 160, 110]
    const mmol = mgdl.map((v) => v / MGDL_MMOLL_CONVERSION)
    expect(glucoseMValue(mmol, { unit: 'mmol/L' })).toBeCloseTo(
      glucoseMValue(mgdl),
      2
    )
  })

  it('returns NaN when there are no valid readings', () => {
    expect(Number.isNaN(glucoseMValue([]))).toBe(true)
    expect(Number.isNaN(glucoseMValue([0, -5, NaN]))).toBe(true)
  })
})
