import { describe, it, expect } from 'vitest'
import {
  calculateTIR,
  calculateTimeInRange,
  getTIRSummary,
  groupByDay,
} from '../src/tir'
import { GlucoseReading } from '../src/types'
import { MG_DL } from '../src/constants'

describe('Time in Range (TIR) calculations', () => {
  const mockReadings: GlucoseReading[] = [
    { value: 60, unit: MG_DL, timestamp: '2024-03-15T10:00:00Z' }, // below
    { value: 80, unit: MG_DL, timestamp: '2024-03-15T11:00:00Z' }, // in range
    { value: 120, unit: MG_DL, timestamp: '2024-03-15T12:00:00Z' }, // in range
    { value: 200, unit: MG_DL, timestamp: '2024-03-15T13:00:00Z' }, // above
    { value: 90, unit: MG_DL, timestamp: '2024-03-15T14:00:00Z' }, // in range
  ]

  describe('calculateTIR', () => {
    it('calculates correct percentages for a range', () => {
      const result = calculateTIR(mockReadings, { min: 70, max: 180 })

      expect(result.inRange).toBe(60.0) // 3 readings / 5 total * 100
      expect(result.belowRange).toBe(20.0) // 1 reading / 5 total * 100
      expect(result.aboveRange).toBe(20.0) // 1 reading / 5 total * 100

      // Sum should always be 100%
      expect(result.inRange + result.belowRange + result.aboveRange).toBe(100)
    })

    it('handles edge cases correctly', () => {
      // All readings in range
      const allInRange = mockReadings.map((r) => ({ ...r, value: 100 }))
      const result1 = calculateTIR(allInRange, { min: 70, max: 180 })
      expect(result1.inRange).toBe(100.0)
      expect(result1.belowRange).toBe(0.0)
      expect(result1.aboveRange).toBe(0.0)

      // All readings below range
      const allBelow = mockReadings.map((r) => ({ ...r, value: 60 }))
      const result2 = calculateTIR(allBelow, { min: 70, max: 180 })
      expect(result2.inRange).toBe(0.0)
      expect(result2.belowRange).toBe(100.0)
      expect(result2.aboveRange).toBe(0.0)

      // All readings above range
      const allAbove = mockReadings.map((r) => ({ ...r, value: 200 }))
      const result3 = calculateTIR(allAbove, { min: 70, max: 180 })
      expect(result3.inRange).toBe(0.0)
      expect(result3.belowRange).toBe(0.0)
      expect(result3.aboveRange).toBe(100.0)
    })

    it('handles empty readings array', () => {
      const result = calculateTIR([], { min: 70, max: 180 })
      expect(result.inRange).toBe(0.0)
      expect(result.belowRange).toBe(0.0)
      expect(result.aboveRange).toBe(0.0)
    })
  })

  describe('getTIRSummary', () => {
    it('formats TIR result correctly', () => {
      const result = {
        inRange: 60.0,
        belowRange: 20.0,
        aboveRange: 20.0,
      }
      expect(getTIRSummary(result)).toBe(
        'In Range: 60%, Below: 20%, Above: 20%'
      )
    })

    it('handles zero values correctly', () => {
      const result = {
        inRange: 0.0,
        belowRange: 0.0,
        aboveRange: 0.0,
      }
      expect(getTIRSummary(result)).toBe('In Range: 0%, Below: 0%, Above: 0%')
    })

    it('handles decimal values correctly', () => {
      const result = {
        inRange: 33.3,
        belowRange: 33.3,
        aboveRange: 33.4,
      }
      expect(getTIRSummary(result)).toBe(
        'In Range: 33.3%, Below: 33.3%, Above: 33.4%'
      )
    })
  })

  describe('groupByDay', () => {
    it('groups readings by date correctly', () => {
      const readings: GlucoseReading[] = [
        { value: 100, unit: MG_DL, timestamp: '2024-03-15T10:00:00Z' },
        { value: 110, unit: MG_DL, timestamp: '2024-03-15T14:00:00Z' },
        { value: 120, unit: MG_DL, timestamp: '2024-03-16T10:00:00Z' },
        { value: 130, unit: MG_DL, timestamp: '2024-03-16T14:00:00Z' },
      ]

      const grouped = groupByDay(readings)

      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped['2024-03-15']).toHaveLength(2)
      expect(grouped['2024-03-16']).toHaveLength(2)
      expect(grouped['2024-03-15'][0].value).toBe(100)
      expect(grouped['2024-03-15'][1].value).toBe(110)
      expect(grouped['2024-03-16'][0].value).toBe(120)
      expect(grouped['2024-03-16'][1].value).toBe(130)
    })

    it('handles empty array', () => {
      const grouped = groupByDay([])
      expect(Object.keys(grouped)).toHaveLength(0)
    })

    it('handles single day', () => {
      const readings: GlucoseReading[] = [
        { value: 100, unit: MG_DL, timestamp: '2024-03-15T10:00:00Z' },
        { value: 110, unit: MG_DL, timestamp: '2024-03-15T14:00:00Z' },
      ]

      const grouped = groupByDay(readings)
      expect(Object.keys(grouped)).toHaveLength(1)
      expect(grouped['2024-03-15']).toHaveLength(2)
    })
  })

  describe('calculateTimeInRange', () => {
    const readings = [60, 80, 120, 200, 90] // Same values as above for consistency

    it('calculates correct percentage within range', () => {
      const result = calculateTimeInRange(readings, 70, 180)
      expect(result).toBe(60) // 3 readings out of 5 are in range
    })

    it('handles edge cases correctly', () => {
      // All in range
      expect(calculateTimeInRange([100, 100, 100], 70, 180)).toBe(100)

      // None in range (all below)
      expect(calculateTimeInRange([60, 60, 60], 70, 180)).toBe(0)

      // None in range (all above)
      expect(calculateTimeInRange([200, 200, 200], 70, 180)).toBe(0)

      // Empty array
      expect(calculateTimeInRange([], 70, 180)).toBe(0)
    })

    it('handles different range bounds', () => {
      // Test with different range bounds
      expect(calculateTimeInRange([100, 120, 140], 100, 140)).toBe(100)
      expect(calculateTimeInRange([90, 100, 150], 100, 140)).toBe(
        33.33333333333333
      )
    })
  })
})
