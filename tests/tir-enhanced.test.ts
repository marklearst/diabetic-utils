// @file tests/tir-enhanced.test.ts

import { describe, it, expect } from 'vitest'
import { calculateEnhancedTIR, calculatePregnancyTIR } from '../src/tir-enhanced'
import type { GlucoseReading } from '../src/types'

// Test constants
const TEST_TIMESTAMP_BASE = new Date(2024, 0, 1, 8, 0)
const MINUTE_IN_MS = 60 * 1000

describe('calculateEnhancedTIR', () => {
  // Helper to create glucose readings
  const createReadings = (
    values: number[],
    unit: 'mg/dL' | 'mmol/L' = 'mg/dL'
  ): GlucoseReading[] => {
    return values.map((value, index) => ({
      value,
      unit,
      timestamp: new Date(
        TEST_TIMESTAMP_BASE.getTime() + index * 5 * MINUTE_IN_MS
      ).toISOString(), // 5-minute intervals
    }))
  }

  describe('Basic functionality', () => {
    it('should calculate 5-range TIR for normal glucose', () => {
      const readings = createReadings([
        100, 110, 120, 115, 105, 95, 108, 112, 118, 122,
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.percentage).toBe(0)
      expect(result.low.percentage).toBe(0)
      expect(result.inRange.percentage).toBe(100)
      expect(result.high.percentage).toBe(0)
      expect(result.veryHigh.percentage).toBe(0)
      expect(result.meetsTargets.tirMeetsGoal).toBe(true)
      expect(result.summary.totalReadings).toBe(10)
    })

    it('should detect Level 2 hypoglycemia (<54 mg/dL)', () => {
      const readings = createReadings([45, 50, 52, 100, 110, 120])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.percentage).toBe(50) // 3 out of 6
      expect(result.veryLow.readingCount).toBe(3)
      expect(result.meetsTargets.tbrLevel2Safe).toBe(false)
      expect(result.meetsTargets.overallAssessment).toBe('concerning')
    })

    it('should detect Level 1 hypoglycemia (54-69 mg/dL)', () => {
      const readings = createReadings([55, 60, 65, 68, 100, 110, 120])

      const result = calculateEnhancedTIR(readings)

      expect(result.low.percentage).toBeCloseTo(57.1, 1) // 4 out of 7
      expect(result.low.readingCount).toBe(4)
      expect(result.meetsTargets.tbrLevel1Safe).toBe(false)
    })

    it('should detect Level 1 hyperglycemia (181-250 mg/dL)', () => {
      const readings = createReadings([
        185, 190, 200, 210, 220, 100, 110, 120,
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.high.percentage).toBe(62.5) // 5 out of 8
      expect(result.high.readingCount).toBe(5)
      expect(result.meetsTargets.tarLevel1Acceptable).toBe(false)
    })

    it('should detect Level 2 hyperglycemia (>250 mg/dL)', () => {
      const readings = createReadings([260, 280, 300, 100, 110, 120])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryHigh.percentage).toBe(50) // 3 out of 6
      expect(result.veryHigh.readingCount).toBe(3)
      expect(result.meetsTargets.tarLevel2Acceptable).toBe(false)
      expect(result.meetsTargets.overallAssessment).toBe('concerning')
    })

    it('should correctly distribute readings across all 5 ranges', () => {
      const readings = createReadings([
        40, // very low
        60, // low
        100, // in range
        200, // high
        300, // very high
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.percentage).toBe(20)
      expect(result.low.percentage).toBe(20)
      expect(result.inRange.percentage).toBe(20)
      expect(result.high.percentage).toBe(20)
      expect(result.veryHigh.percentage).toBe(20)

      // Percentages should sum to 100
      const total =
        result.veryLow.percentage +
        result.low.percentage +
        result.inRange.percentage +
        result.high.percentage +
        result.veryHigh.percentage
      expect(total).toBe(100)
    })
  })

  describe('Configuration overrides', () => {
    it('should respect custom thresholds provided via options', () => {
      const readings = createReadings([40, 60, 170, 200, 260])

      const result = calculateEnhancedTIR(readings, {
        veryLowThreshold: 45,
        lowThreshold: 65,
        highThreshold: 170,
        veryHighThreshold: 240,
      })

      expect(result.veryLow.readingCount).toBe(1)
      expect(result.low.readingCount).toBe(1)
      expect(result.inRange.readingCount).toBe(1)
      expect(result.high.readingCount).toBe(1)
      expect(result.veryHigh.readingCount).toBe(1)
    })
  })

  describe('Boundary values', () => {
    it('should correctly classify value at 54 mg/dL (boundary)', () => {
      const readings = createReadings([54, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.readingCount).toBe(0)
      expect(result.low.readingCount).toBe(1) // 54 is in "low" range
    })

    it('should correctly classify value at 70 mg/dL (boundary)', () => {
      const readings = createReadings([70, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.low.readingCount).toBe(0)
      expect(result.inRange.readingCount).toBe(3) // 70 is in "in range"
    })

    it('should correctly classify value at 180 mg/dL (boundary)', () => {
      const readings = createReadings([180, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.readingCount).toBe(3) // 180 is still "in range"
      expect(result.high.readingCount).toBe(0)
    })

    it('should correctly classify value at 181 mg/dL (just above boundary)', () => {
      const readings = createReadings([181, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.readingCount).toBe(2)
      expect(result.high.readingCount).toBe(1) // 181 is "high"
    })

    it('should correctly classify value at 250 mg/dL (boundary)', () => {
      const readings = createReadings([250, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.high.readingCount).toBe(1) // 250 is still "high"
      expect(result.veryHigh.readingCount).toBe(0)
    })

    it('should correctly classify value at 251 mg/dL (just above boundary)', () => {
      const readings = createReadings([251, 100, 110])

      const result = calculateEnhancedTIR(readings)

      expect(result.high.readingCount).toBe(0)
      expect(result.veryHigh.readingCount).toBe(1) // 251 is "very high"
    })
  })

  describe('Unit conversion (mmol/L)', () => {
    it('should correctly handle mmol/L readings', () => {
      // 5.5 mmol/L ≈ 99 mg/dL (in range)
      // 2.5 mmol/L ≈ 45 mg/dL (very low)
      const readings = createReadings([5.5, 5.8, 6.0, 2.5], 'mmol/L')

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.percentage).toBe(25) // 1 out of 4
      expect(result.inRange.percentage).toBe(75) // 3 out of 4
    })

    it('should correctly classify mmol/L boundaries', () => {
      // 3.0 mmol/L = 54 mg/dL (boundary between very low and low)
      // 3.9 mmol/L = 70 mg/dL (boundary between low and in range)
      const readings = createReadings([3.0, 3.9, 5.5], 'mmol/L')

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.readingCount).toBe(0)
      expect(result.low.readingCount).toBe(1) // 3.0 mmol/L
      expect(result.inRange.readingCount).toBe(2) // 3.9 and 5.5 mmol/L
    })
  })

  describe('Target assessment', () => {
    it('should assess "excellent" for optimal control', () => {
      // 85% TIR, <0.5% very low, no high values
      const readings = createReadings([
        ...Array(85).fill(120), // 85% in range
        ...Array(15).fill(200), // 15% high (acceptable)
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.tirMeetsGoal).toBe(true)
      expect(result.meetsTargets.tbrLevel2Safe).toBe(true)
      expect(result.meetsTargets.overallAssessment).toBe('excellent')
    })

    it('should assess "good" for meeting targets', () => {
      // 72% TIR, minimal lows/highs
      const readings = createReadings([
        ...Array(72).fill(120), // 72% in range
        ...Array(2).fill(60), // 2% low (safe)
        ...Array(26).fill(190), // 26% high (acceptable)
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.tirMeetsGoal).toBe(true)
      expect(result.meetsTargets.tbrLevel1Safe).toBe(true)
      expect(result.meetsTargets.overallAssessment).toBe('good')
    })

    it('should assess "needs improvement" for suboptimal control', () => {
      // 65% TIR (below goal), no critical issues
      const readings = createReadings([
        ...Array(65).fill(120), // 65% in range
        ...Array(35).fill(200), // 35% high
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.tirMeetsGoal).toBe(false)
      expect(result.meetsTargets.tbrLevel2Safe).toBe(true)
      expect(result.meetsTargets.tarLevel2Acceptable).toBe(true)
      expect(result.meetsTargets.overallAssessment).toBe('needs improvement')
    })

    it('should assess "concerning" for critical hypoglycemia', () => {
      // 2% very low (Level 2 hypoglycemia)
      const readings = createReadings([
        ...Array(2).fill(45), // 2% very low
        ...Array(98).fill(120), // 98% in range
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.tbrLevel2Safe).toBe(false)
      expect(result.meetsTargets.overallAssessment).toBe('concerning')
    })

    it('should assess "concerning" for critical hyperglycemia', () => {
      // 6% very high (Level 2 hyperglycemia)
      const readings = createReadings([
        ...Array(6).fill(300), // 6% very high
        ...Array(94).fill(120), // 94% in range
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.tarLevel2Acceptable).toBe(false)
      expect(result.meetsTargets.overallAssessment).toBe('concerning')
    })
  })

  describe('Population-specific targets', () => {
    it('should apply standard population targets (70% TIR)', () => {
      const readings = createReadings([...Array(72).fill(120), ...Array(28).fill(200)])

      const result = calculateEnhancedTIR(readings, { population: 'standard' })

      expect(result.meetsTargets.tirMeetsGoal).toBe(true)
    })

    it('should apply older-adults population targets (50% TIR)', () => {
      const readings = createReadings([...Array(52).fill(120), ...Array(48).fill(200)])

      const result = calculateEnhancedTIR(readings, {
        population: 'older-adults',
      })

      expect(result.meetsTargets.tirMeetsGoal).toBe(true)

      // Check that at least one recommendation contains the older/high-risk text
      const hasOlderAdultsText = result.meetsTargets.recommendations.some(r =>
        r.includes('older/high-risk')
      )
      expect(hasOlderAdultsText).toBe(true)
    })

    it('should apply stricter hypoglycemia targets for older adults', () => {
      // 2% Level 1 hypoglycemia - safe for standard, not for older adults
      const readings = createReadings([...Array(2).fill(60), ...Array(98).fill(120)])

      const standardResult = calculateEnhancedTIR(readings, {
        population: 'standard',
      })
      const olderAdultsResult = calculateEnhancedTIR(readings, {
        population: 'older-adults',
      })

      expect(standardResult.meetsTargets.tbrLevel1Safe).toBe(true)
      expect(olderAdultsResult.meetsTargets.tbrLevel1Safe).toBe(false)
    })
  })

  describe('Recommendations', () => {
    it('should recommend insulin adjustment for elevated Level 1 hypoglycemia', () => {
      const readings = createReadings([...Array(5).fill(60), ...Array(95).fill(120)])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Level 1 hypoglycemia'),
        ])
      )
      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('insulin doses')])
      )
    })

    it('should recommend urgent action for Level 2 hypoglycemia', () => {
      const readings = createReadings([...Array(2).fill(45), ...Array(98).fill(120)])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('CRITICAL')])
      )
      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('healthcare provider immediately'),
        ])
      )
    })

    it('should recommend treatment review for Level 2 hyperglycemia', () => {
      const readings = createReadings([...Array(6).fill(300), ...Array(94).fill(120)])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('URGENT')])
      )
      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Level 2 hyperglycemia'),
        ])
      )
    })

    it('should provide positive feedback for excellent control', () => {
      const readings = createReadings([...Array(85).fill(120), ...Array(15).fill(150)])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Excellent glycemic control'),
        ])
      )
    })

    it('should recommend improving TIR when below target without hypoglycemia', () => {
      const readings = createReadings([
        ...Array(65).fill(120),
        ...Array(2).fill(65),
        ...Array(33).fill(190),
      ])

      const result = calculateEnhancedTIR(readings)

      expect(result.meetsTargets.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Time-in-range'),
          expect.stringContaining('below target'),
        ])
      )
    })
  })

  describe('Duration calculation', () => {
    it('should calculate duration based on reading intervals', () => {
      // 12 readings at 5-minute intervals = 60 minutes total
      const readings = createReadings(Array(12).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.summary.totalDuration).toBeCloseTo(60, -1) // ~60 minutes
    })

    it('should calculate per-range duration correctly', () => {
      // 6 readings in range (30 minutes), 6 high (30 minutes)
      const readings = createReadings([...Array(6).fill(120), ...Array(6).fill(200)])

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.duration).toBeCloseTo(30, -1)
      expect(result.high.duration).toBeCloseTo(30, -1)
    })
  })

  describe('Average value calculation', () => {
    it('should calculate average value per range', () => {
      const readings = createReadings([100, 110, 120, 130, 140])

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.averageValue).toBeCloseTo(120, -1)
    })

    it('should return null average for empty ranges', () => {
      const readings = createReadings([100, 110, 120])

      const result = calculateEnhancedTIR(readings)

      expect(result.veryLow.averageValue).toBeNull()
      expect(result.low.averageValue).toBeNull()
      expect(result.high.averageValue).toBeNull()
      expect(result.veryHigh.averageValue).toBeNull()
    })
  })

  describe('Data quality assessment', () => {
    it('should rate 14+ days as "excellent"', () => {
      // 14 days × 24 hours × 12 readings/hour = 4,032 readings
      const readings = createReadings(Array(4032).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.summary.dataQuality).toBe('excellent')
    })

    it('should rate 7-13 days as "good"', () => {
      // 7 days × 24 hours × 12 readings/hour = 2,016 readings
      const readings = createReadings(Array(2016).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.summary.dataQuality).toBe('good')
    })

    it('should rate 3-6 days as "fair"', () => {
      // 3 days × 24 hours × 12 readings/hour = 864 readings
      const readings = createReadings(Array(864).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.summary.dataQuality).toBe('fair')
    })

    it('should rate <3 days as "poor"', () => {
      // 1 day × 24 hours × 12 readings/hour = 288 readings
      const readings = createReadings(Array(288).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.summary.dataQuality).toBe('poor')
    })
  })

  describe('Error handling', () => {
    it('should throw error for empty readings array', () => {
      expect(() => calculateEnhancedTIR([])).toThrow(
        'Cannot calculate Enhanced TIR: readings array is empty'
      )
    })

    it('should throw error for invalid glucose value (negative)', () => {
      const readings = createReadings([-10, 100, 110])

      expect(() => calculateEnhancedTIR(readings)).toThrow('Invalid glucose value')
    })

    it('should throw error for invalid glucose value (too high)', () => {
      const readings = createReadings([700, 100, 110])

      expect(() => calculateEnhancedTIR(readings)).toThrow('Invalid glucose value')
    })

    it('should throw error for NaN glucose value', () => {
      const readings = createReadings([NaN, 100, 110])

      expect(() => calculateEnhancedTIR(readings)).toThrow('Invalid glucose value')
    })

    it('should throw error for Infinity glucose value', () => {
      const readings = createReadings([Infinity, 100, 110])

      expect(() => calculateEnhancedTIR(readings)).toThrow('Invalid glucose value')
    })
  })

  describe('Edge cases', () => {
    it('should handle single reading', () => {
      const readings = createReadings([120])

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.percentage).toBe(100)
      expect(result.summary.totalReadings).toBe(1)
    })

    it('should handle all readings in one range', () => {
      const readings = createReadings(Array(100).fill(120))

      const result = calculateEnhancedTIR(readings)

      expect(result.inRange.percentage).toBe(100)
      expect(result.veryLow.percentage).toBe(0)
      expect(result.low.percentage).toBe(0)
      expect(result.high.percentage).toBe(0)
      expect(result.veryHigh.percentage).toBe(0)
    })

    it('should handle very small percentages correctly', () => {
      // 1 low out of 1000 readings = 0.1%
      const readings = createReadings([60, ...Array(999).fill(120)])

      const result = calculateEnhancedTIR(readings)

      expect(result.low.percentage).toBe(0.1)
    })
  })
})

describe('calculatePregnancyTIR', () => {
  const createReadings = (
    values: number[],
    unit: 'mg/dL' | 'mmol/L' = 'mg/dL'
  ): GlucoseReading[] => {
    return values.map((value, index) => ({
      value,
      unit,
      timestamp: new Date(
        TEST_TIMESTAMP_BASE.getTime() + index * 5 * MINUTE_IN_MS
      ).toISOString(), // 5-minute intervals
    }))
  }

  describe('Basic functionality', () => {
    it('should calculate pregnancy TIR with tighter range (63-140 mg/dL)', () => {
      const readings = createReadings([
        80, 90, 100, 110, 120, 130, 135, // in range
        60, // below range
        145, 150, // above range
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.inRange.percentage).toBe(70) // 7 out of 10
      expect(result.belowRange.percentage).toBe(10) // 1 out of 10
      expect(result.aboveRange.percentage).toBe(20) // 2 out of 10
    })

    it('should detect below range (<63 mg/dL)', () => {
      const readings = createReadings([55, 60, 62, 100, 110])

      const result = calculatePregnancyTIR(readings)

      expect(result.belowRange.percentage).toBe(60) // 3 out of 5
      expect(result.belowRange.readingCount).toBe(3)
    })

    it('should detect above range (>140 mg/dL)', () => {
      const readings = createReadings([145, 150, 160, 100, 110])

      const result = calculatePregnancyTIR(readings)

      expect(result.aboveRange.percentage).toBe(60) // 3 out of 5
      expect(result.aboveRange.readingCount).toBe(3)
    })
  })

  describe('Boundary values', () => {
    it('should correctly classify value at 63 mg/dL (lower boundary)', () => {
      const readings = createReadings([63, 100, 110])

      const result = calculatePregnancyTIR(readings)

      expect(result.belowRange.readingCount).toBe(0)
      expect(result.inRange.readingCount).toBe(3) // 63 is in range
    })

    it('should correctly classify value at 140 mg/dL (upper boundary)', () => {
      const readings = createReadings([140, 100, 110])

      const result = calculatePregnancyTIR(readings)

      expect(result.inRange.readingCount).toBe(3) // 140 is still in range
      expect(result.aboveRange.readingCount).toBe(0)
    })

    it('should correctly classify value at 141 mg/dL (just above)', () => {
      const readings = createReadings([141, 100, 110])

      const result = calculatePregnancyTIR(readings)

      expect(result.inRange.readingCount).toBe(2)
      expect(result.aboveRange.readingCount).toBe(1) // 141 is above range
    })
  })

  describe('Unit conversion (mmol/L)', () => {
    it('should correctly handle mmol/L readings', () => {
      // 3.5 mmol/L = 63 mg/dL (lower boundary)
      // 7.8 mmol/L = 140 mg/dL (upper boundary)
      const readings = createReadings([3.5, 5.0, 7.8, 8.5], 'mmol/L')

      const result = calculatePregnancyTIR(readings)

      expect(result.inRange.percentage).toBe(75) // 3 out of 4
      expect(result.aboveRange.percentage).toBe(25) // 1 out of 4
    })
  })

  describe('Options handling', () => {
    it('should prefer unit override when normalizing readings', () => {
      const readings: GlucoseReading[] = [
        {
          value: 100,
          unit: 'mg/dL',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime()).toISOString(),
        },
        {
          value: 60,
          unit: 'mg/dL',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime() + 5 * MINUTE_IN_MS).toISOString(),
        },
        {
          value: 8.5,
          unit: 'mmol/L',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime() + 10 * MINUTE_IN_MS).toISOString(),
        },
      ]

      const result = calculatePregnancyTIR(readings, { unit: 'mmol/L' })

      expect(result.belowRange.readingCount).toBe(1)
      expect(result.inRange.readingCount).toBe(1)
      expect(result.aboveRange.readingCount).toBe(1)
    })

    it('should handle mixed units with predominant mg/dL readings', () => {
      const readings: GlucoseReading[] = [
        {
          value: 100,
          unit: 'mg/dL',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime()).toISOString(),
        },
        {
          value: 120,
          unit: 'mg/dL',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime() + 5 * MINUTE_IN_MS).toISOString(),
        },
        {
          value: 8.5,
          unit: 'mmol/L',
          timestamp: new Date(TEST_TIMESTAMP_BASE.getTime() + 10 * MINUTE_IN_MS).toISOString(),
        },
      ]

      const result = calculatePregnancyTIR(readings)

      expect(result.inRange.readingCount).toBe(2)
      expect(result.aboveRange.readingCount).toBe(1)
    })
  })

  describe('Target assessment', () => {
    it('should meet pregnancy targets (TIR >70%, TBR <4%, TAR <25%)', () => {
      const readings = createReadings([
        ...Array(75).fill(100), // 75% in range
        ...Array(3).fill(60), // 3% below
        ...Array(22).fill(150), // 22% above
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.meetsPregnancyTargets).toBe(true)
    })

    it('should not meet pregnancy targets if TIR <70%', () => {
      const readings = createReadings([
        ...Array(65).fill(100), // 65% in range
        ...Array(35).fill(150), // 35% above
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.meetsPregnancyTargets).toBe(false)
    })

    it('should not meet pregnancy targets if TBR >4%', () => {
      const readings = createReadings([
        ...Array(71).fill(100), // 71% in range
        ...Array(5).fill(60), // 5% below
        ...Array(24).fill(150), // 24% above
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.meetsPregnancyTargets).toBe(false)
    })

    it('should not meet pregnancy targets if TAR >25%', () => {
      const readings = createReadings([
        ...Array(71).fill(100), // 71% in range
        ...Array(29).fill(150), // 29% above
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.meetsPregnancyTargets).toBe(false)
    })
  })

  describe('Recommendations', () => {
    it('should recommend urgent action for elevated TBR', () => {
      const readings = createReadings([
        ...Array(10).fill(55),
        ...Array(90).fill(100),
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('CRITICAL')])
      )
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Contact healthcare provider immediately'),
        ])
      )
    })

    it('should recommend treatment review for elevated TAR', () => {
      const readings = createReadings([
        ...Array(70).fill(100),
        ...Array(30).fill(160),
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('URGENT')])
      )
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('exceeds acceptable limit for pregnancy'),
        ])
      )
    })

    it('should provide positive feedback for meeting targets', () => {
      const readings = createReadings([
        ...Array(74).fill(100),
        ...Array(3).fill(60),
        ...Array(23).fill(130),
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Excellent glycemic control for pregnancy'),
        ])
      )
    })

    it('should always include pregnancy-specific guidance', () => {
      const readings = createReadings([
        ...Array(70).fill(100),
        ...Array(30).fill(150),
      ])

      const result = calculatePregnancyTIR(readings)

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Pregnancy requires tighter glucose control'),
        ])
      )
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.stringContaining('63-140 mg/dL')])
      )
    })
  })

  describe('Error handling', () => {
    it('should throw error for empty readings array', () => {
      expect(() => calculatePregnancyTIR([])).toThrow(
        'Cannot calculate Pregnancy TIR: readings array is empty'
      )
    })

    it('should throw error for invalid glucose values', () => {
      const readings = createReadings([-10, 100, 110])

      expect(() => calculatePregnancyTIR(readings)).toThrow('Invalid glucose value')
    })

    it('should throw error for invalid mmol/L glucose values', () => {
      const readings = createReadings([50, 5, 10], 'mmol/L')

      expect(() => calculatePregnancyTIR(readings)).toThrow('Invalid glucose value')
    })
  })

  describe('Summary statistics', () => {
    it('should include accurate summary statistics', () => {
      const readings = createReadings(Array(100).fill(100))

      const result = calculatePregnancyTIR(readings)

      expect(result.summary.totalReadings).toBe(100)
      expect(result.summary.totalDuration).toBeGreaterThan(0)
      expect(result.summary.dataQuality).toBeDefined()
    })
  })
})
