import { describe, it, expect } from 'vitest'
import {
  isHypo,
  isHyper,
  getGlucoseLabel,
  parseGlucoseString,
  isValidGlucoseValue,
} from '../src/glucose'
import { MG_DL, MMOL_L } from '../src/constants'

describe('Glucose utilities', () => {
  describe('Hypoglycemia Detection', () => {
    it('detects hypoglycemia with mg/dL values', () => {
      expect(isHypo(65, MG_DL)).toBe(true)
      expect(isHypo(69, MG_DL)).toBe(true)
      expect(isHypo(70, MG_DL)).toBe(false)
      expect(isHypo(100, MG_DL)).toBe(false)
    })

    it('detects hypoglycemia with mmol/L values', () => {
      expect(isHypo(3.5, MMOL_L)).toBe(true)
      expect(isHypo(3.8, MMOL_L)).toBe(true)
      expect(isHypo(3.9, MMOL_L)).toBe(false)
      expect(isHypo(5.5, MMOL_L)).toBe(false)
    })

    it('uses mg/dL as default unit', () => {
      expect(isHypo(65)).toBe(true)
      expect(isHypo(100)).toBe(false)
    })
  })

  describe('Hyperglycemia Detection', () => {
    it('detects hyperglycemia with mg/dL values', () => {
      expect(isHyper(200, MG_DL)).toBe(true)
      expect(isHyper(181, MG_DL)).toBe(true)
      expect(isHyper(180, MG_DL)).toBe(false)
      expect(isHyper(150, MG_DL)).toBe(false)
    })

    it('detects hyperglycemia with mmol/L values', () => {
      expect(isHyper(11.1, MMOL_L)).toBe(true)
      expect(isHyper(10.1, MMOL_L)).toBe(true)
      expect(isHyper(10.0, MMOL_L)).toBe(false)
      expect(isHyper(7.8, MMOL_L)).toBe(false)
    })

    it('uses mg/dL as default unit', () => {
      expect(isHyper(200)).toBe(true)
      expect(isHyper(150)).toBe(false)
    })
  })

  describe('Glucose Label', () => {
    it('returns correct labels for mg/dL values', () => {
      expect(getGlucoseLabel(65, MG_DL)).toBe('low')
      expect(getGlucoseLabel(100, MG_DL)).toBe('normal')
      expect(getGlucoseLabel(200, MG_DL)).toBe('high')
    })

    it('returns correct labels for mmol/L values', () => {
      expect(getGlucoseLabel(3.5, MMOL_L)).toBe('low')
      expect(getGlucoseLabel(5.5, MMOL_L)).toBe('normal')
      expect(getGlucoseLabel(11.1, MMOL_L)).toBe('high')
    })

    it('uses mg/dL as default unit', () => {
      expect(getGlucoseLabel(65)).toBe('low')
      expect(getGlucoseLabel(100)).toBe('normal')
      expect(getGlucoseLabel(200)).toBe('high')
    })
  })

  describe('Glucose String Parsing', () => {
    it('parses valid mg/dL strings', () => {
      expect(parseGlucoseString('100 mg/dL')).toEqual({
        value: 100,
        unit: MG_DL,
      })
      expect(parseGlucoseString('100.0 mg/dL')).toEqual({
        value: 100.0,
        unit: MG_DL,
      })
    })

    it('parses valid mmol/L strings', () => {
      expect(parseGlucoseString('5.5 mmol/L')).toEqual({
        value: 5.5,
        unit: MMOL_L,
      })
      expect(parseGlucoseString('5.55 mmol/L')).toEqual({
        value: 5.55,
        unit: MMOL_L,
      })
    })

    it('handles case insensitivity', () => {
      expect(parseGlucoseString('100 MG/DL')).toEqual({
        value: 100,
        unit: MG_DL,
      })
      expect(parseGlucoseString('5.5 MMOL/L')).toEqual({
        value: 5.5,
        unit: MMOL_L,
      })
      // Test mixed case
      expect(parseGlucoseString('100 Mg/dL')).toEqual({
        value: 100,
        unit: MG_DL,
      })
      expect(parseGlucoseString('5.5 mMoL/l')).toEqual({
        value: 5.5,
        unit: MMOL_L,
      })
    })

    it('throws error for invalid formats', () => {
      const errorMsg =
        'Invalid glucose string format. Use "100 mg/dL" or "5.5 mmol/L".'
      expect(() => parseGlucoseString('invalid')).toThrow(errorMsg)
      expect(() => parseGlucoseString('100')).toThrow(errorMsg)
      expect(() => parseGlucoseString('100 invalid')).toThrow(errorMsg)
      expect(() => parseGlucoseString('abc mg/dL')).toThrow(errorMsg)
      expect(() => parseGlucoseString('5.5.5 mmol/L')).toThrow(errorMsg)
      expect(() => parseGlucoseString('')).toThrow(errorMsg)
      expect(() => parseGlucoseString('  ')).toThrow(errorMsg)
    })

    it('handles whitespace correctly', () => {
      expect(parseGlucoseString('  100 mg/dL  ')).toEqual({
        value: 100,
        unit: MG_DL,
      })
      expect(parseGlucoseString('5.5  mmol/L')).toEqual({
        value: 5.5,
        unit: MMOL_L,
      })
      expect(parseGlucoseString('100    mg/dL')).toEqual({
        value: 100,
        unit: MG_DL,
      })
    })
  })

  describe('Glucose Value Validation', () => {
    it('validates correct values and units', () => {
      expect(isValidGlucoseValue(100, MG_DL)).toBe(true)
      expect(isValidGlucoseValue(5.5, MMOL_L)).toBe(true)
      expect(isValidGlucoseValue(0.1, MG_DL)).toBe(true)
      expect(isValidGlucoseValue(0.1, MMOL_L)).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(isValidGlucoseValue(-1, MG_DL)).toBe(false)
      expect(isValidGlucoseValue(0, MMOL_L)).toBe(false)
      expect(isValidGlucoseValue(NaN, MG_DL)).toBe(false)
      expect(isValidGlucoseValue(Infinity, MMOL_L)).toBe(false)
    })

    it('rejects invalid types', () => {
      expect(isValidGlucoseValue('100', MG_DL)).toBe(false)
      expect(isValidGlucoseValue(null, MG_DL)).toBe(false)
      expect(isValidGlucoseValue(undefined, MG_DL)).toBe(false)
      expect(isValidGlucoseValue({}, MG_DL)).toBe(false)
      expect(isValidGlucoseValue([], MG_DL)).toBe(false)
      expect(isValidGlucoseValue(() => {}, MG_DL)).toBe(false)
    })

    it('rejects invalid units', () => {
      expect(isValidGlucoseValue(100, 'invalid')).toBe(false)
      expect(isValidGlucoseValue(100, null)).toBe(false)
      expect(isValidGlucoseValue(100, undefined)).toBe(false)
      expect(isValidGlucoseValue(100, {})).toBe(false)
      expect(isValidGlucoseValue(100, [])).toBe(false)
      expect(isValidGlucoseValue(100, () => {})).toBe(false)
      expect(isValidGlucoseValue(100, 123)).toBe(false)
    })
  })
})
