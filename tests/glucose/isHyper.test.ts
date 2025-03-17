import { describe, it, expect } from 'vitest'
import { isHyper } from '@src/glucose/isHyper'

describe('isHyper', () => {
  it('returns true for values above high threshold (mg/dL)', () => {
    expect(isHyper(181, 'mg/dL')).toBe(true)
  })
  it('returns false for values at or below high threshold (mg/dL)', () => {
    expect(isHyper(180, 'mg/dL')).toBe(false)
    expect(isHyper(100, 'mg/dL')).toBe(false)
  })
  it('returns true for values above high threshold (mmol/L)', () => {
    expect(isHyper(10.1, 'mmol/L')).toBe(true) // 10.1 * 18.0182 ≈ 182
  })
  it('returns false for values at or below high threshold (mmol/L)', () => {
    expect(isHyper(9.98, 'mmol/L')).toBe(false) // 9.98 * 18.0182 ≈ 179.80
    expect(isHyper(5.5, 'mmol/L')).toBe(false)
  })
  it('throws on invalid values', () => {
    expect(() => isHyper(0, 'mg/dL')).toThrow()
    expect(() => isHyper(-1, 'mg/dL')).toThrow()
    expect(() => isHyper(NaN, 'mg/dL')).toThrow()
    expect(() => isHyper(Infinity, 'mg/dL')).toThrow()
  })
  it('throws on invalid unit', () => {
    // @ts-expect-error
    expect(() => isHyper(100, 'foo')).toThrow()
  })
})
