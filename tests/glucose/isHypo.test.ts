import { describe, it, expect } from 'vitest'
import { isHypo } from '@src/glucose/isHypo'

describe('isHypo', () => {
  it('returns true for values below low threshold (mg/dL)', () => {
    expect(isHypo(69, 'mg/dL')).toBe(true)
  })
  it('returns false for values at or above low threshold (mg/dL)', () => {
    expect(isHypo(70, 'mg/dL')).toBe(false)
    expect(isHypo(100, 'mg/dL')).toBe(false)
  })
  it('returns true for values below low threshold (mmol/L)', () => {
    expect(isHypo(3.8, 'mmol/L')).toBe(true) // 3.8 * 18.0182 ≈ 68.47
  })
  it('returns false for values at or above low threshold (mmol/L)', () => {
    expect(isHypo(3.89, 'mmol/L')).toBe(false) // 3.89 * 18.0182 ≈ 70.05
    expect(isHypo(5.5, 'mmol/L')).toBe(false)
  })
  it('throws on invalid values', () => {
    expect(() => isHypo(0, 'mg/dL')).toThrow()
    expect(() => isHypo(-1, 'mg/dL')).toThrow()
    expect(() => isHypo(NaN, 'mg/dL')).toThrow()
    expect(() => isHypo(Infinity, 'mg/dL')).toThrow()
  })
  it('throws on invalid unit', () => {
    // @ts-expect-error
    expect(() => isHypo(100, 'foo')).toThrow()
  })
})
