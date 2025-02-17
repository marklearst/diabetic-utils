import { describe, it, expect } from 'vitest'
import { estimateA1CFromAverage } from '../../src/a1c/estimateA1CFromAverage'

describe('estimateA1CFromAverage', () => {
  it('should calculate A1C from mg/dL', () => {
    expect(estimateA1CFromAverage(100)).toBeCloseTo(5.1, 1)
  })

  it('should calculate A1C from mmol/L', () => {
    expect(estimateA1CFromAverage(5.6, 'mmol/L')).toBeCloseTo(5.1, 1)
  })

  it('should round to 2 decimal places', () => {
    expect(estimateA1CFromAverage(123)).toBeCloseTo(5.91, 2)
  })
})
