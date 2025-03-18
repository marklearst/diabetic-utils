import { describe, it, expect } from 'vitest'
import { isValidGlucoseValue } from '@src/glucose/isValidGlucoseValue'

describe('isValidGlucoseValue', () => {
  it('returns true for valid mg/dL', () => {
    expect(isValidGlucoseValue(100, 'mg/dL')).toBe(true)
  })
  it('returns true for valid mmol/L', () => {
    expect(isValidGlucoseValue(5.5, 'mmol/L')).toBe(true)
  })
  it('returns false for zero or negative', () => {
    expect(isValidGlucoseValue(0, 'mg/dL')).toBe(false)
    expect(isValidGlucoseValue(-1, 'mg/dL')).toBe(false)
  })
  it('returns false for NaN or Infinity', () => {
    expect(isValidGlucoseValue(NaN, 'mg/dL')).toBe(false)
    expect(isValidGlucoseValue(Infinity, 'mg/dL')).toBe(false)
  })
  it('returns false for invalid unit', () => {
    expect(isValidGlucoseValue(100, 'foo')).toBe(false)
    expect(isValidGlucoseValue(100, '')).toBe(false)
  })
  it('returns false for non-number value', () => {
    expect(isValidGlucoseValue('100', 'mg/dL')).toBe(false)
    expect(isValidGlucoseValue(null, 'mg/dL')).toBe(false)
    expect(isValidGlucoseValue(undefined, 'mg/dL')).toBe(false)
    expect(isValidGlucoseValue({}, 'mg/dL')).toBe(false)
  })
})
