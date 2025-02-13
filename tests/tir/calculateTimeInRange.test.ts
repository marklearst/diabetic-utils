import { describe, it, expect } from 'vitest'
import { calculateTimeInRange } from '@src/tir/calculateTimeInRange'

describe('calculateTimeInRange', () => {
  it('should calculate percent in range', () => {
    expect(calculateTimeInRange([50, 100, 150, 200], 70, 180)).toBeCloseTo(50)
  })
})
