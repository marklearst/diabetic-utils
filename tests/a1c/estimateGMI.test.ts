import { describe, it, expect } from 'vitest'
import { estimateGMI } from '@src/a1c/estimateGMI'

describe('estimateGMI', () => {
  it('should estimate GMI from average glucose', () => {
    expect(typeof estimateGMI(100)).toBe('number')
  })
})
