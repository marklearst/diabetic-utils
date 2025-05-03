import { describe, it, expect } from 'vitest'
import { mgdlToMmol } from '@src/conversions/mgdlToMmol'

describe('mgdlToMmol', () => {
  it('converts 100 mg/dL to mmol/L', () => {
    expect(mgdlToMmol(100)).toBeCloseTo(5.55, 2)
  })
})
