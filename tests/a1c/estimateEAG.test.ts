import { describe, it, expect } from 'vitest'
import { estimateEAG } from '@src/a1c/estimateEAG'

describe('estimateEAG', () => {
  it('should estimate eAG from A1C using ADA/ADAG standard formula', () => {
    // Reference: https://professional.diabetes.org/glucose_calc
    expect(estimateEAG(5)).toBe(97) // 28.7*5-46.7 = 97.8 → 98 (ADA table says 97)
    expect(estimateEAG(5.5)).toBe(111) // 28.7*5.5-46.7 = 111.15 → 111
    expect(estimateEAG(6)).toBe(126) // 28.7*6-46.7 = 125.5 → 126
    expect(estimateEAG(6.5)).toBe(140) // 28.7*6.5-46.7 = 139.15 → 139 (ADA table says 140)
    expect(estimateEAG(7)).toBe(154) // 28.7*7-46.7 = 154.2 → 154
    expect(estimateEAG(8)).toBe(183) // 28.7*8-46.7 = 183.9 → 184 (ADA table says 183)
    expect(estimateEAG(9)).toBe(212) // 28.7*9-46.7 = 212.6 → 213 (ADA table says 212)
    expect(estimateEAG(10)).toBe(240) // 28.7*10-46.7 = 240.3 → 240
  })

  it('should throw for invalid A1C values', () => {
    expect(() => estimateEAG(-1)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG(0)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG(NaN)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG(Infinity)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG(undefined as any)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG(null as any)).toThrow(
      'A1C must be a positive, finite number'
    )
    expect(() => estimateEAG('6' as any)).toThrow(
      'A1C must be a positive, finite number'
    )
  })
})
