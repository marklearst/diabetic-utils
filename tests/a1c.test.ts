import { describe, it, expect } from 'vitest'
import {
  formatA1C,
  isValidA1C,
  getA1CCategory,
  isA1CInTarget,
  a1cDelta,
  a1cTrend,
} from '../src/a1c'

describe('A1C utilities', () => {
  it('formats A1C with percent', () => {
    expect(formatA1C(7)).toBe('7.0%')
  })
  it('validates plausible A1C values', () => {
    expect(isValidA1C(7)).toBe(true)
    expect(isValidA1C(0)).toBe(false)
    expect(isValidA1C(25)).toBe(false)
    expect(isValidA1C('7')).toBe(false)
  })
  it('gets A1C category', () => {
    expect(getA1CCategory(5.5)).toBe('normal')
    expect(getA1CCategory(6)).toBe('prediabetes')
    expect(getA1CCategory(7)).toBe('diabetes')
    expect(getA1CCategory(-1)).toBe('invalid')
  })
  it('checks if A1C is in target', () => {
    expect(isA1CInTarget(6.8)).toBe(true)
    expect(isA1CInTarget(7.5)).toBe(false)
    expect(isA1CInTarget(6.8, [6, 7])).toBe(true)
  })
  it('calculates A1C delta', () => {
    expect(a1cDelta(7, 6.5)).toBe(0.5)
    expect(() => a1cDelta(0, 6)).toThrow()
  })
  it('determines A1C trend', () => {
    expect(a1cTrend([6, 6.5, 7])).toBe('increasing')
    expect(a1cTrend([7, 6.5, 6])).toBe('decreasing')
    expect(a1cTrend([6, 6, 6])).toBe('stable')
    expect(a1cTrend([6])).toBe('insufficient data')
  })
})
