import { describe, it, expect } from 'vitest'
import { mgdlToMmol } from '@src/conversions/mgdlToMmol'

describe('mgdlToMmol', () => {
  it('converts common glucose values from mg/dL to mmol/L', () => {
    expect(mgdlToMmol(100)).toBeCloseTo(5.56, 2)
    expect(mgdlToMmol(180)).toBeCloseTo(10.0, 2)
    expect(mgdlToMmol(70)).toBeCloseTo(3.89, 2)
    expect(mgdlToMmol(200)).toBeCloseTo(11.11, 2)
  })

  it('handles decimal inputs correctly', () => {
    expect(mgdlToMmol(100.5)).toBeCloseTo(5.58, 2)
    expect(mgdlToMmol(99.9)).toBeCloseTo(5.55, 2)
  })

  it('throws error for invalid inputs', () => {
    expect(() => mgdlToMmol(-1)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mgdlToMmol(0)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mgdlToMmol(NaN)).toThrow(
      'Glucose value must be a positive, finite number'
    )
    expect(() => mgdlToMmol(Infinity)).toThrow(
      'Glucose value must be a positive, finite number'
    )
  })
})
