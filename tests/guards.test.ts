import { describe, it, expect } from 'vitest'
import { isEstimateGMIOptions, isValidGlucoseString } from '../src/guards'
import { MG_DL, MMOL_L } from '../src/constants'

describe('Guards', () => {
  describe('isEstimateGMIOptions', () => {
    it('returns true for valid EstimateGMIOptions objects', () => {
      expect(isEstimateGMIOptions({ value: 100, unit: MG_DL })).toBe(true)
      expect(isEstimateGMIOptions({ value: 5.5, unit: MMOL_L })).toBe(true)
    })

    it('returns false for invalid inputs', () => {
      expect(isEstimateGMIOptions(null)).toBe(false)
      expect(isEstimateGMIOptions(undefined)).toBe(false)
      expect(isEstimateGMIOptions({})).toBe(false)
      expect(isEstimateGMIOptions({ value: '100', unit: MG_DL })).toBe(false)
      expect(isEstimateGMIOptions({ value: 100 })).toBe(false)
      expect(isEstimateGMIOptions({ unit: MG_DL })).toBe(false)
      expect(isEstimateGMIOptions({ value: 100, unit: 123 })).toBe(false)
    })
  })

  describe('isValidGlucoseString', () => {
    it('returns true for valid glucose strings', () => {
      expect(isValidGlucoseString('100 mg/dL')).toBe(true)
      expect(isValidGlucoseString('5.5 mmol/L')).toBe(true)
      expect(isValidGlucoseString('100.0 mg/dL')).toBe(true)
      expect(isValidGlucoseString('5.55 mmol/L')).toBe(true)
      // Case insensitive
      expect(isValidGlucoseString('100 MG/DL')).toBe(true)
      expect(isValidGlucoseString('5.5 MMOL/L')).toBe(true)
    })

    it('returns false for invalid inputs', () => {
      expect(isValidGlucoseString(null)).toBe(false)
      expect(isValidGlucoseString(undefined)).toBe(false)
      expect(isValidGlucoseString(123)).toBe(false)
      expect(isValidGlucoseString('')).toBe(false)
      expect(isValidGlucoseString('100')).toBe(false)
      expect(isValidGlucoseString('mg/dL')).toBe(false)
      expect(isValidGlucoseString('abc mg/dL')).toBe(false)
      expect(isValidGlucoseString('100mg/dL')).toBe(false) // Missing space
      expect(isValidGlucoseString('100 mgdl')).toBe(false) // Invalid unit format
      expect(isValidGlucoseString('5.5.5 mmol/L')).toBe(false) // Invalid number
      expect(isValidGlucoseString('5,5 mmol/L')).toBe(false) // Invalid decimal separator
    })

    it('handles whitespace correctly', () => {
      expect(isValidGlucoseString('  100 mg/dL  ')).toBe(true)
      expect(isValidGlucoseString('5.5  mmol/L')).toBe(true)
      expect(isValidGlucoseString('100    mg/dL')).toBe(true)
    })
  })
})
