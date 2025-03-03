import { describe, it, expect } from 'vitest'
import { parseGlucoseString } from '@src/utils/parseGlucoseString'

describe('parseGlucoseString', () => {
  it('parses a valid mg/dL string', () => {
    expect(parseGlucoseString('100 mg/dL')).toEqual({
      value: 100,
      unit: 'mg/dL',
    })
  })

  it('throws on invalid format', () => {
    expect(() => parseGlucoseString('abc')).toThrow()
  })
})
