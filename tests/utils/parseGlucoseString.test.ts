import { describe, it, expect } from 'vitest'
import { parseGlucoseString } from '@src/utils/parseGlucoseString'

describe('parseGlucoseString', () => {
  it('parses a valid mg/dL string', () => {
    expect(parseGlucoseString('100 mg/dL')).toEqual({
      value: 100,
      unit: 'mg/dL',
    })
  })

  it('parses with extra spaces', () => {
    expect(parseGlucoseString('  100   mg/dL  ')).toEqual({
      value: 100,
      unit: 'mg/dL',
    })
  })

  it('parses with uppercase units', () => {
    expect(parseGlucoseString('100 MG/dl')).toEqual({
      value: 100,
      unit: 'mg/dL',
    })
    expect(parseGlucoseString('5.5 MMOL/l')).toEqual({
      value: 5.5,
      unit: 'mmol/L',
    })
  })

  it('parses a valid decimal mmol/L string', () => {
    expect(parseGlucoseString('4.999 mmol/L')).toEqual({
      value: 4.999,
      unit: 'mmol/L',
    })
  })

  it('throws on invalid format', () => {
    expect(() => parseGlucoseString('abc')).toThrow()
  })
})
