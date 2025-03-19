import { describe, it, expect } from 'vitest'
import { convertGlucoseUnit } from '@src/conversions/convertGlucoseUnit'

describe('convertGlucoseUnit', () => {
  it('converts mg/dL to mmol/L', () => {
    expect(convertGlucoseUnit(100, 'mg/dL', 'mmol/L')).toBeCloseTo(5.55, 2)
  })
  it('converts mmol/L to mg/dL', () => {
    expect(convertGlucoseUnit(5.5, 'mmol/L', 'mg/dL')).toBeCloseTo(99.1, 1)
  })
  it('returns same value if units match', () => {
    expect(convertGlucoseUnit(100, 'mg/dL', 'mg/dL')).toBe(100)
    expect(convertGlucoseUnit(5.5, 'mmol/L', 'mmol/L')).toBe(5.5)
  })
  it('throws on invalid values', () => {
    expect(() => convertGlucoseUnit(0, 'mg/dL', 'mmol/L')).toThrow()
    expect(() => convertGlucoseUnit(NaN, 'mg/dL', 'mmol/L')).toThrow()
    expect(() => convertGlucoseUnit(Infinity, 'mg/dL', 'mmol/L')).toThrow()
    expect(() => convertGlucoseUnit(-5, 'mg/dL', 'mmol/L')).toThrow()
  })
  it('throws on unsupported units', () => {
    // @ts-expect-error
    expect(() => convertGlucoseUnit(100, 'foo', 'mg/dL')).toThrow()
    // @ts-expect-error
    expect(() => convertGlucoseUnit(100, 'mg/dL', 'foo')).toThrow()
  })
})
