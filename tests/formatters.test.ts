import { describe, it, expect } from 'vitest'
import { formatGlucose, formatPercentage, formatDate } from '../src/formatters'
import { MG_DL, MMOL_L } from '../src/constants'

describe('Formatters', () => {
  it('formats glucose values with units', () => {
    expect(formatGlucose(100, MG_DL)).toBe('100 mg/dL')
    expect(formatGlucose(5.5, MMOL_L)).toBe('6 mmol/L')
    expect(formatGlucose(5.5, MMOL_L, { digits: 1 })).toBe('5.5 mmol/L')
    expect(formatGlucose(100, MG_DL, { suffix: false })).toBe('100')
    expect(formatGlucose(5.5, MMOL_L, { digits: 2, suffix: false })).toBe(
      '5.50'
    )
  })

  it('formats percentages', () => {
    expect(formatPercentage(0.75)).toBe('0.8%')
    expect(formatPercentage(75)).toBe('75.0%')
    expect(formatPercentage(75.5555, 2)).toBe('75.56%')
    expect(formatPercentage(75, 0)).toBe('75%')
  })

  it('formats dates', () => {
    const iso = '2024-03-15T14:30:00Z'
    const formatted = formatDate(iso)
    expect(formatted).toMatch(/Mar 15, 2024/)

    // Test with specific timezone
    const tzFormatted = formatDate(iso, 'America/New_York')
    expect(tzFormatted).toMatch(/Mar 15, 2024/)
  })

  it('throws RangeError for invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow(RangeError)
  })
})
