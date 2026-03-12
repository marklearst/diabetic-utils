import { describe, it, expect } from 'vitest'
import {
  buildFHIRCGMSummary,
  buildFHIRSensorReading,
  buildFHIRSensorReadings,
  buildOMHBloodGlucose,
  buildOMHDataPoint,
  buildOMHBloodGlucoseList,
} from '../src/interop'
import { calculateEnhancedTIR } from '../src'
import type { GlucoseReading, EnhancedTIRResult } from '../src'

const sampleReadings: GlucoseReading[] = Array.from({ length: 50 }, (_, i) => ({
  value: 90 + i * 2,
  unit: 'mg/dL' as const,
  timestamp: new Date(Date.UTC(2024, 0, 1, 0, i * 5)).toISOString(),
}))

const period = {
  start: sampleReadings[0].timestamp,
  end: sampleReadings[sampleReadings.length - 1].timestamp,
}

// ---------------------------------------------------------------------------
// FHIR builders
// ---------------------------------------------------------------------------
describe('FHIR interop', () => {
  describe('buildFHIRCGMSummary', () => {
    it('builds a valid FHIR summary from EnhancedTIRResult', () => {
      const tir = calculateEnhancedTIR(sampleReadings)
      const summary = buildFHIRCGMSummary(tir, period)

      expect(summary.resourceType).toBe('Observation')
      expect(summary.status).toBe('final')
      expect(summary.code.coding[0].system).toBe('http://loinc.org')
      expect(summary.effectivePeriod.start).toBe(period.start)
      expect(summary.effectivePeriod.end).toBe(period.end)
      expect(summary.component.length).toBe(5)

      const codes = summary.component.map((c) => c.code)
      expect(codes).toContain('97507-8')
      expect(codes).toContain('97506-0')
      expect(codes).toContain('97505-2')
      expect(codes).toContain('97508-6')
      expect(codes).toContain('97509-4')
    })

    it('includes optional meanGlucose component', () => {
      const tir = calculateEnhancedTIR(sampleReadings)
      const summary = buildFHIRCGMSummary(tir, period, { meanGlucose: 130 })
      expect(summary.component.length).toBe(6)
      const meanComp = summary.component.find((c) => c.code === '97507-0')
      expect(meanComp).toBeDefined()
      expect(meanComp!.value).toBe(130)
    })

    it('includes optional CV component', () => {
      const tir = calculateEnhancedTIR(sampleReadings)
      const summary = buildFHIRCGMSummary(tir, period, { cv: 22.5 })
      expect(summary.component.length).toBe(6)
      const cvComp = summary.component.find((c) => c.code === '97506-2')
      expect(cvComp).toBeDefined()
      expect(cvComp!.value).toBe(22.5)
    })

    it('includes both optional components', () => {
      const tir = calculateEnhancedTIR(sampleReadings)
      const summary = buildFHIRCGMSummary(tir, period, {
        meanGlucose: 130,
        cv: 22.5,
      })
      expect(summary.component.length).toBe(7)
    })
  })

  describe('buildFHIRSensorReading', () => {
    it('builds mg/dL reading', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: 'mg/dL',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildFHIRSensorReading(reading)
      expect(result.resourceType).toBe('Observation')
      expect(result.status).toBe('final')
      expect(result.effectiveDateTime).toBe('2024-01-01T08:00:00Z')
      expect(result.valueQuantity.value).toBe(120)
      expect(result.valueQuantity.unit).toBe('mg/dL')
      expect(result.valueQuantity.code).toBe('mg/dL')
      expect(result.code.coding[0].code).toBe('99504-3')
    })

    it('builds mmol/L reading', () => {
      const reading: GlucoseReading = {
        value: 6.7,
        unit: 'mmol/L',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildFHIRSensorReading(reading)
      expect(result.valueQuantity.value).toBe(6.7)
      expect(result.valueQuantity.unit).toBe('mmol/L')
      expect(result.valueQuantity.code).toBe('mmol/L')
      expect(result.code.coding[0].code).toBe('14745-4')
    })
  })

  describe('buildFHIRSensorReadings', () => {
    it('converts array of readings', () => {
      const readings: GlucoseReading[] = [
        { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
        { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
      ]
      const result = buildFHIRSensorReadings(readings)
      expect(result).toHaveLength(2)
      expect(result[0].valueQuantity.value).toBe(100)
      expect(result[1].valueQuantity.value).toBe(110)
    })

    it('returns empty array for empty input', () => {
      expect(buildFHIRSensorReadings([])).toEqual([])
    })
  })
})

// ---------------------------------------------------------------------------
// Open mHealth builders
// ---------------------------------------------------------------------------
describe('Open mHealth interop', () => {
  describe('buildOMHBloodGlucose', () => {
    it('builds mg/dL datapoint body', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: 'mg/dL',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildOMHBloodGlucose(reading)
      expect(result.blood_glucose.value).toBe(120)
      expect(result.blood_glucose.unit).toBe('mg/dL')
      expect(result.effective_time_frame.date_time).toBe(
        '2024-01-01T08:00:00Z'
      )
      expect(result.specimen_source).toBe('interstitial fluid')
    })

    it('builds mmol/L datapoint body', () => {
      const reading: GlucoseReading = {
        value: 6.7,
        unit: 'mmol/L',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildOMHBloodGlucose(reading)
      expect(result.blood_glucose.unit).toBe('mmol/L')
    })

    it('allows overriding specimen_source', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: 'mg/dL',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildOMHBloodGlucose(reading, { specimenSource: 'capillary blood' })
      expect(result.specimen_source).toBe('capillary blood')
    })

    it('omits specimen_source when specimenSource is explicitly undefined', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: 'mg/dL',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildOMHBloodGlucose(reading, { specimenSource: undefined })
      expect('specimen_source' in result).toBe(false)
    })
  })

  describe('buildOMHDataPoint', () => {
    it('wraps reading in full OMH datapoint with header', () => {
      const reading: GlucoseReading = {
        value: 120,
        unit: 'mg/dL',
        timestamp: '2024-01-01T08:00:00Z',
      }
      const result = buildOMHDataPoint(reading, 'test-uuid-123')
      expect(result.header.id).toBe('test-uuid-123')
      expect(result.header.schema_id.namespace).toBe('omh')
      expect(result.header.schema_id.name).toBe('blood-glucose')
      expect(result.header.schema_id.version).toBe('3.0')
      expect(result.header.creation_date_time).toBeDefined()
      expect(result.body.blood_glucose.value).toBe(120)
    })
  })

  describe('buildOMHBloodGlucoseList', () => {
    it('converts array of readings', () => {
      const readings: GlucoseReading[] = [
        { value: 100, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
        { value: 110, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
      ]
      const result = buildOMHBloodGlucoseList(readings)
      expect(result).toHaveLength(2)
      expect(result[0].blood_glucose.value).toBe(100)
      expect(result[1].blood_glucose.value).toBe(110)
    })

    it('returns empty array for empty input', () => {
      expect(buildOMHBloodGlucoseList([])).toEqual([])
    })
  })
})
