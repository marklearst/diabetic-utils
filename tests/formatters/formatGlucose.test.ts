import { describe, it, expect } from 'vitest'
import { formatGlucose } from '@src/formatters/formatGlucose'

describe('formatGlucose', () => {
  describe('valid inputs', () => {
    it('formats mg/dL values correctly', () => {
      expect(formatGlucose(100, 'mg/dL')).toBe('100 mg/dL')
    })

    it('formats mmol/L values correctly', () => {
      expect(formatGlucose(5.5, 'mmol/L')).toBe('5.5 mmol/L')
    })
  })

  describe('invalid values', () => {
    it('throws on zero', () => {
      expect(() => formatGlucose(0, 'mg/dL')).toThrow()
    })

    it('throws on negative number', () => {
      expect(() => formatGlucose(-1, 'mg/dL')).toThrow()
    })

    it('throws on NaN', () => {
      expect(() => formatGlucose(NaN, 'mg/dL')).toThrow()
    })

    it('throws on Infinity', () => {
      expect(() => formatGlucose(Infinity, 'mg/dL')).toThrow()
    })
  })

  describe('invalid units', () => {
    it('throws on typo unit string', () => {
      // @ts-expect-error
      expect(() => formatGlucose(100, 'mgdl')).toThrow()
      // @ts-expect-error
      expect(() => formatGlucose(100, 'foo')).toThrow()
    })

    it('throws on missing unit', () => {
      // @ts-expect-error
      expect(() => formatGlucose(100)).toThrow()
    })
  })
})
