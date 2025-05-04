import { describe, it, expect } from 'vitest'
import { estimateGMI } from '@src/a1c/estimateGMI'

const MGDL = 100
const MMOLL = 5.5

describe('estimateGMI', () => {
  describe('valid inputs', () => {
    it('calculates GMI from number and mg/dL', () => {
      expect(estimateGMI(MGDL, 'mg/dL')).toBeCloseTo(5.4, 1)
    })

    it('calculates GMI from number and mmol/L', () => {
      expect(estimateGMI(MMOLL, 'mmol/L')).toBeCloseTo(12.1, 1)
    })

    it('calculates GMI from string with mg/dL', () => {
      expect(estimateGMI(`${MGDL} mg/dL`)).toBeCloseTo(5.4, 1)
    })

    it('calculates GMI from string with mmol/L', () => {
      expect(estimateGMI(`${MMOLL} mmol/L`)).toBeCloseTo(12.1, 1)
    })

    it('calculates GMI from object input', () => {
      expect(estimateGMI({ value: MGDL, unit: 'mg/dL' })).toBeCloseTo(5.4, 1)
    })

    it('parses string with extra spaces', () => {
      expect(estimateGMI(' 100   mg/dL ')).toBeCloseTo(5.4, 1)
    })

    it('handles lowercase units', () => {
      expect(estimateGMI('100 mg/dl')).toBeCloseTo(5.4, 1)
    })

    it('returns a number', () => {
      const result = estimateGMI(MGDL, 'mg/dL')
      expect(typeof result).toBe('number')
    })

    it('handles glucose value of 1 mg/dL', () => {
      expect(estimateGMI(1, 'mg/dL')).toBeCloseTo(2.43, 2)
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
      expect(() => estimateGMI(100 as any)).toThrow()
    })

    it('throws on invalid string format', () => {
      expect(() => estimateGMI('100mgdl')).toThrow()
      expect(() => estimateGMI('foo')).toThrow()
    })

    it('throws on unsupported unit in object', () => {
      expect(() => estimateGMI({ value: 100, unit: 'mg%' as any })).toThrow()
    })
  })
})
