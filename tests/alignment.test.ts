import { describe, it, expect } from 'vitest'
import { calculateHOMAIR, checkGlycemicAlignment } from '../src/alignment'

describe('calculateHOMAIR', () => {
  it('throws on invalid glucose (negative)', () => {
    expect(() => calculateHOMAIR(-1, 10)).toThrow(/Invalid fasting glucose/)
  })
  it('throws on invalid glucose (zero)', () => {
    expect(() => calculateHOMAIR(0, 10)).toThrow(/Invalid fasting glucose/)
  })
  it('throws on invalid insulin (negative)', () => {
    expect(() => calculateHOMAIR(100, -1)).toThrow(/Invalid fasting insulin/)
  })
  it('throws on invalid insulin (zero)', () => {
    expect(() => calculateHOMAIR(100, 0)).toThrow(/Invalid fasting insulin/)
  })
  it('throws on invalid glucose (NaN)', () => {
    expect(() => calculateHOMAIR(NaN, 10)).toThrow(/Invalid fasting glucose/)
  })
  it('throws on invalid insulin (NaN)', () => {
    expect(() => calculateHOMAIR(100, NaN)).toThrow(/Invalid fasting insulin/)
  })
  it('throws on extreme insulin', () => {
    expect(() => calculateHOMAIR(100, 10000)).toThrow(/Invalid fasting insulin/)
  })
  it('calculates HOMA-IR and provides correct interpretation', () => {
    const result = calculateHOMAIR(100, 10) // (100 * 10) / 405 ≈ 2.47
    expect(result.value).toBeCloseTo(2.47, 2)
    expect(result.interpretation).toBe('Early insulin resistance')
  })

  it('returns very insulin sensitive interpretation when low', () => {
    const result = calculateHOMAIR(80, 0.5)
    expect(result.interpretation).toBe('Very insulin sensitive')
  })

  it('returns significant insulin resistance interpretation when high', () => {
    // Use values that will yield a HOMA-IR > 2.9
    const result = calculateHOMAIR(180, 10) // (180*10)/405 ~ 4.44
    expect(result.value).toBeGreaterThan(2.9)
    expect(result.interpretation).toBe('Significant insulin resistance')
  })
})

describe('checkGlycemicAlignment', () => {
  it('throws on invalid A1C (negative)', () => {
    expect(() => checkGlycemicAlignment(-1, 100, 10)).toThrow(/Invalid A1C/)
  })
  it('throws on invalid A1C (zero)', () => {
    expect(() => checkGlycemicAlignment(0, 100, 10)).toThrow(/Invalid A1C/)
  })
  it('throws on invalid A1C (NaN)', () => {
    expect(() => checkGlycemicAlignment(NaN, 100, 10)).toThrow(/Invalid A1C/)
  })
  it('throws on invalid glucose', () => {
    expect(() => checkGlycemicAlignment(5.5, -100, 10)).toThrow(
      /Invalid fasting glucose/
    )
  })
  it('throws on invalid insulin', () => {
    expect(() => checkGlycemicAlignment(5.5, 100, -10)).toThrow(
      /Invalid fasting insulin/
    )
  })
  it('returns flags when glucose is higher than estimated average', () => {
    const result = checkGlycemicAlignment(5.2, 130, 8)
    expect(result.flags.length).toBeGreaterThan(0)
    expect(result.flags[0]).toContain('Fasting glucose is higher')
    expect(result.homaIR.value).toBeDefined()
  })

  it('returns no flags when values are aligned', () => {
    const result = checkGlycemicAlignment(5.5, 100, 8)
    expect(result.flags.length).toBe(0)
    expect(result.recommendation).toContain('appear consistent')
  })

  it('returns flag when insulin is low with high glucose', () => {
    const result = checkGlycemicAlignment(5.5, 115, 1)
    expect(result.flags).toContain(
      'Low insulin with high glucose may indicate reduced insulin secretion.'
    )
  })
})
