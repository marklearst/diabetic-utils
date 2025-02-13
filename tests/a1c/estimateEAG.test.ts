import { describe, it, expect } from 'vitest'
import { estimateEAG } from '@src/a1c/estimateEAG'

describe('estimateEAG', () => {
  it('should estimate eAG from A1C', () => {
    expect(typeof estimateEAG(5)).toBe('number')
  })
})
