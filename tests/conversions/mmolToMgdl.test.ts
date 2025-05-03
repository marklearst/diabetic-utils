import { describe, it, expect } from 'vitest'
import { mmolToMgdl } from '@src/conversions/mmolToMgdl'

describe('mmolToMgdl', () => {
  it('should convert mmol/L to mg/dL', () => {
    expect(mmolToMgdl(1)).toBeCloseTo(18.0182)
  })
})
