import { describe, it, expect } from 'vitest'
import { isValidGlucoseString } from '@src/utils/guards'

describe('isValidGlucoseString', () => {
  it('returns true for valid mg/dL format', () => {
    expect(isValidGlucoseString('100 mg/dL')).toBe(true)
  })

  it('returns true for valid mmol/L format', () => {
    expect(isValidGlucoseString('5.5 mmol/L')).toBe(true)
  })

  it('returns false for missing space', () => {
    expect(isValidGlucoseString('100mg/dL')).toBe(false)
  })

  it('returns false for completely invalid strings', () => {
    expect(isValidGlucoseString('banana')).toBe(false)
    expect(isValidGlucoseString('')).toBe(false)
    expect(isValidGlucoseString('123 xyz')).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidGlucoseString(123)).toBe(false)
    expect(isValidGlucoseString(null)).toBe(false)
    expect(isValidGlucoseString(undefined)).toBe(false)
    expect(isValidGlucoseString({})).toBe(false)
    expect(isValidGlucoseString([])).toBe(false)
  })
})
