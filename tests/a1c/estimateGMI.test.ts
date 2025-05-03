import { describe, it, expect } from 'vitest'
import { estimateGMI } from '@src/a1c/estimateGMI'

// Common test values for clarity and maintainability
const MGDL = 100
const MMOLL = 5.5

describe('estimateGMI', () => {
  describe('valid inputs', () => {
    it('calculates GMI from number and mg/dL', () => {
      expect(estimateGMI(MGDL, 'mg/dL')).toBeCloseTo(5.4)
    })
    it('calculates GMI from number and mmol/L', () => {
      expect(estimateGMI(MMOLL, 'mmol/L')).toBeCloseTo(12.1)
    })
    it('calculates GMI from string with mg/dL', () => {
      expect(estimateGMI(`${MGDL} mg/dL`)).toBeCloseTo(5.4)
    })
    it('calculates GMI from string with mmol/L', () => {
      expect(estimateGMI(`${MMOLL} mmol/L`)).toBeCloseTo(12.1)
    })
    it('calculates GMI from object input', () => {
      expect(estimateGMI({ value: MGDL, unit: 'mg/dL' })).toBeCloseTo(5.4)
    })
  })

  describe('invalid inputs', () => {
    it('throws on negative value', () => {
      expect(() => estimateGMI(-1, 'mg/dL')).toThrow()
    })
    it('throws on zero value', () => {
      expect(() => estimateGMI(0, 'mg/dL')).toThrow()
    })
    it('throws on non-finite value', () => {
      expect(() => estimateGMI(NaN, 'mg/dL')).toThrow()
      expect(() => estimateGMI(Infinity, 'mg/dL')).toThrow()
    })
    it('throws if unit is missing for number input', () => {
      // This test ensures the API is not forgiving for ambiguous input
      expect(() => estimateGMI(100 as any)).toThrow()
    })
    it('throws on invalid string format', () => {
      expect(() => estimateGMI('100mgdl')).toThrow()
      expect(() => estimateGMI('foo')).toThrow()
    })
  })
})
