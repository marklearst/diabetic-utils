import { describe, it, expect } from 'vitest'
import { isEstimateGMIOptions } from '@src/utils/guards'
import type { EstimateGMIOptions } from '@src/a1c/types'

describe('isEstimateGMIOptions', () => {
  it('returns true for a valid EstimateGMIOptions object', () => {
    const input: EstimateGMIOptions = { value: 100, unit: 'mg/dL' }
    expect(isEstimateGMIOptions(input)).toBe(true)
  })

  it('returns false for missing value field', () => {
    expect(isEstimateGMIOptions({ unit: 'mg/dL' } as any)).toBe(false)
  })

  it('returns false for missing unit field', () => {
    expect(isEstimateGMIOptions({ value: 100 } as any)).toBe(false)
  })

  it('returns false for non-object input', () => {
    expect(isEstimateGMIOptions(null)).toBe(false)
    expect(isEstimateGMIOptions(123 as any)).toBe(false)
    expect(isEstimateGMIOptions('text' as any)).toBe(false)
  })
})
