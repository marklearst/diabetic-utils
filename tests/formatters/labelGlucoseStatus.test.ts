import { describe, it, expect } from 'vitest'
import { labelGlucoseStatus } from '@src/glucose/labelGlucoseStatus'

// These should match your GLUCOSE_RANGES
const LOW = 70
const HIGH = 180
const MGDL_TO_MMOLL = 18.0182

describe('labelGlucoseStatus', () => {
  describe('mg/dL input', () => {
    it('labels low values', () => {
      expect(labelGlucoseStatus(LOW - 1, 'mg/dL')).toBe('low')
    })
    it('labels normal values', () => {
      expect(labelGlucoseStatus(LOW, 'mg/dL')).toBe('normal')
      expect(labelGlucoseStatus((LOW + HIGH) / 2, 'mg/dL')).toBe('normal')
      expect(labelGlucoseStatus(HIGH, 'mg/dL')).toBe('normal')
    })
    it('labels high values', () => {
      expect(labelGlucoseStatus(HIGH + 1, 'mg/dL')).toBe('high')
    })
  })

  describe('mmol/L input', () => {
    it('labels low values', () => {
      expect(labelGlucoseStatus((LOW - 1) / MGDL_TO_MMOLL, 'mmol/L')).toBe(
        'low'
      )
    })
    it('labels normal values', () => {
      expect(labelGlucoseStatus(LOW / MGDL_TO_MMOLL, 'mmol/L')).toBe('normal')
      expect(labelGlucoseStatus(HIGH / MGDL_TO_MMOLL, 'mmol/L')).toBe('normal')
    })
    it('labels high values', () => {
      expect(labelGlucoseStatus((HIGH + 1) / MGDL_TO_MMOLL, 'mmol/L')).toBe(
        'high'
      )
    })
  })

  describe('invalid input', () => {
    it('throws on zero or negative', () => {
      expect(() => labelGlucoseStatus(0, 'mg/dL')).toThrow()
      expect(() => labelGlucoseStatus(-1, 'mg/dL')).toThrow()
    })
    it('throws on NaN or Infinity', () => {
      expect(() => labelGlucoseStatus(NaN, 'mg/dL')).toThrow()
      expect(() => labelGlucoseStatus(Infinity, 'mg/dL')).toThrow()
    })
    it('throws on invalid unit', () => {
      // @ts-expect-error
      expect(() => labelGlucoseStatus(100, 'mgdl')).toThrow()
      // @ts-expect-error
      expect(() => labelGlucoseStatus(100, 'foo')).toThrow()
    })
    it('throws on missing unit', () => {
      // @ts-expect-error
      expect(() => labelGlucoseStatus(100)).toThrow()
    })
  })
})
