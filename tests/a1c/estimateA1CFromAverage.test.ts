import { describe, it, expect } from 'vitest'
import { estimateA1CFromAverage } from '@src/a1c/estimateA1CFromAverage'

describe('estimateA1CFromAverage', () => {
  it('should estimate A1C from average glucose', () => {
    expect(typeof estimateA1CFromAverage(100)).toBe('number')
  })
})
