import { describe, it, expect } from 'vitest'
import { mmolToMgdl } from '@src/conversions/mmolToMgdl'

describe('mmolToMgdl', () => {
  it('converts common glucose values from mmol/L to mg/dL', () => {
    expect(mmolToMgdl(5.6)).toBe(101)
    expect(mmolToMgdl(10)).toBe(180)
    expect(mmolToMgdl(3.9)).toBe(70)
    expect(mmolToMgdl(11.1)).toBe(200)
  })

  it('handles decimal inputs correctly', () => {
    expect(mmolToMgdl(5.55)).toBe(100)
    expect(mmolToMgdl(5.54)).toBe(100)
  })

  it('throws error for invalid inputs', () => {
    expect(() => mmolToMgdl(-1)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mmolToMgdl(0)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mmolToMgdl(NaN)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mmolToMgdl(Infinity)).toThrow(
      'Glucose value must be a positive, finite number'
    )
  })
})
