import { describe, it, expect } from 'vitest'
import { glucoseStatusLabel } from '@src/glucose/glucoseStatusLabel'

describe('glucoseStatusLabel', () => {
  it('returns correct label for mg/dL values', () => {
    expect(glucoseStatusLabel(65, 'mg/dL')).toBe('Low')
    expect(glucoseStatusLabel(70, 'mg/dL')).toBe('Normal')
    expect(glucoseStatusLabel(100, 'mg/dL')).toBe('Normal')
    expect(glucoseStatusLabel(180, 'mg/dL')).toBe('Normal')
    expect(glucoseStatusLabel(181, 'mg/dL')).toBe('High')
  })

  it('returns correct label for mmol/L values', () => {
    expect(glucoseStatusLabel(3.5, 'mmol/L')).toBe('Low') // 63 mg/dL
    expect(glucoseStatusLabel(3.9, 'mmol/L')).toBe('Normal') // 70.2 mg/dL
    expect(glucoseStatusLabel(5.5, 'mmol/L')).toBe('Normal') // 99 mg/dL
    expect(glucoseStatusLabel(10, 'mmol/L')).toBe('Normal') // 180 mg/dL
    expect(glucoseStatusLabel(10.1, 'mmol/L')).toBe('High') // 181.8 mg/dL
  })

  it('throws for invalid values', () => {
    expect(() => glucoseStatusLabel(-1, 'mg/dL')).toThrow()
    expect(() => glucoseStatusLabel(0, 'mg/dL')).toThrow()
    expect(() => glucoseStatusLabel(NaN, 'mg/dL')).toThrow()
    expect(() => glucoseStatusLabel(Infinity, 'mg/dL')).toThrow()
  })

  it('throws for invalid units', () => {
    // @ts-expect-error
    expect(() => glucoseStatusLabel(100, 'foo')).toThrow()
    // @ts-expect-error
    expect(() => glucoseStatusLabel(100, '')).toThrow()
  })
})
