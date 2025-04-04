import { describe, expect, it } from 'vitest'
import { MG_DL, MMOL_L } from './constants'
import {
  AllowedGlucoseUnits,
  GlucoseUnit,
  GlucoseReading,
  TIROptions,
  GlucoseStatsOptions,
  EstimateGMIOptions,
  A1CReading,
} from './types'

describe('types', () => {
  describe('AllowedGlucoseUnits', () => {
    it('should contain exactly mg/dL and mmol/L', () => {
      expect(AllowedGlucoseUnits).toHaveLength(2)
      expect(AllowedGlucoseUnits).toContain(MG_DL)
      expect(AllowedGlucoseUnits).toContain(MMOL_L)
    })
  })

  describe('Type validations', () => {
    it('should validate GlucoseReading structure', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: MG_DL,
        timestamp: '2024-03-20T10:00:00Z',
      }
      expect(reading.value).toBe(120)
      expect(reading.unit).toBe(MG_DL)
      expect(reading.timestamp).toBe('2024-03-20T10:00:00Z')
    })

    it('should validate TIROptions structure', () => {
      const options: TIROptions = {
        readings: [
          {
            value: 120,
            unit: MG_DL,
            timestamp: '2024-03-20T10:00:00Z',
          },
        ],
        unit: MG_DL,
        range: [70, 180],
      }
      expect(options.readings).toHaveLength(1)
      expect(options.unit).toBe(MG_DL)
      expect(options.range).toEqual([70, 180])
    })

    it('should validate EstimateGMIOptions structure', () => {
      const options: EstimateGMIOptions = {
        value: 154,
        unit: MG_DL,
      }
      expect(options.value).toBe(154)
      expect(options.unit).toBe(MG_DL)
    })

    it('should validate A1CReading structure', () => {
      const reading: A1CReading = {
        value: 7.0,
        date: '2024-03-20',
      }
      expect(reading.value).toBe(7.0)
      expect(reading.date).toBe('2024-03-20')
    })

    it('should validate GlucoseStatsOptions structure', () => {
      const options: GlucoseStatsOptions = {
        readings: [
          {
            value: 120,
            unit: MG_DL,
            timestamp: '2024-03-20T10:00:00Z',
          },
        ],
        unit: MG_DL,
        range: [70, 180],
        gmi: true,
        a1c: true,
        tir: true,
        tirRange: [70, 180],
        tirPercent: true,
        tirPercentBelow: true,
        tirPercentAbove: true,
        tirPercentInRange: true,
        tirPercentBelowRounded: true,
        tirPercentAboveRounded: true,
        tirPercentInRangeRounded: true,
      }
      expect(options.readings).toHaveLength(1)
      expect(options.unit).toBe(MG_DL)
      expect(options.range).toEqual([70, 180])
      expect(options.gmi).toBe(true)
      expect(options.tirRange).toEqual([70, 180])
    })
  })
})
