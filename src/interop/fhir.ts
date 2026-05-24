/**
 * @file src/interop/fhir.ts
 *
 * Stateless FHIR-aligned payload builders for CGM data.
 * Generates lightweight JSON payloads aligned with the HL7 CGM IG v1.0.0
 * without requiring any FHIR library dependency.
 *
 * @see https://build.fhir.org/ig/HL7/cgm/index.html
 */

import type { GlucoseReading } from '../types'
import type { EnhancedTIRResult } from '../types'
import { MG_DL } from '../constants'
import type { FHIRCGMSummary, FHIRCGMSensorReading, FHIRCGMComponent } from './types'

const LOINC_SYSTEM = 'http://loinc.org'
const UCUM_SYSTEM = 'http://unitsofmeasure.org'

/**
 * Builds a FHIR-aligned CGM summary observation from an EnhancedTIRResult.
 *
 * Includes TIR percentages for each range, mean glucose, and CV if provided.
 * The output is a plain JSON object that can be serialized and POSTed to any
 * FHIR-capable server.
 *
 * @param tir - Enhanced TIR result from calculateEnhancedTIR()
 * @param period - Time period covered { start: ISO string, end: ISO string }
 * @param options - Optional: meanGlucose, cv (coefficient of variation)
 * @returns FHIR-aligned CGM summary observation
 */
export function buildFHIRCGMSummary(
  tir: EnhancedTIRResult,
  period: { start: string; end: string },
  options?: { meanGlucose?: number; cv?: number }
): FHIRCGMSummary {
  const components: FHIRCGMComponent[] = [
    {
      code: { coding: [{ system: LOINC_SYSTEM, code: '97507-8', display: 'Time in range (70-180 mg/dL)' }] },
      valueQuantity: { value: tir.inRange.percentage, unit: '%', system: UCUM_SYSTEM, code: '%' },
    },
    {
      code: { coding: [{ system: LOINC_SYSTEM, code: '97506-0', display: 'Time below range level 1 (54-69 mg/dL)' }] },
      valueQuantity: { value: tir.low.percentage, unit: '%', system: UCUM_SYSTEM, code: '%' },
    },
    {
      code: { coding: [{ system: LOINC_SYSTEM, code: '97505-2', display: 'Time below range level 2 (<54 mg/dL)' }] },
      valueQuantity: { value: tir.veryLow.percentage, unit: '%', system: UCUM_SYSTEM, code: '%' },
    },
    {
      code: { coding: [{ system: LOINC_SYSTEM, code: '97508-6', display: 'Time above range level 1 (181-250 mg/dL)' }] },
      valueQuantity: { value: tir.high.percentage, unit: '%', system: UCUM_SYSTEM, code: '%' },
    },
    {
      code: { coding: [{ system: LOINC_SYSTEM, code: '97509-4', display: 'Time above range level 2 (>250 mg/dL)' }] },
      valueQuantity: { value: tir.veryHigh.percentage, unit: '%', system: UCUM_SYSTEM, code: '%' },
    },
  ]

  if (options?.meanGlucose !== undefined) {
    components.push({
      code: { coding: [{ system: LOINC_SYSTEM, code: '97507-0', display: 'Mean glucose' }] },
      valueQuantity: { value: options.meanGlucose, unit: 'mg/dL', system: UCUM_SYSTEM, code: 'mg/dL' },
    })
  }

  if (options?.cv !== undefined) {
    components.push({
      code: { coding: [{ system: LOINC_SYSTEM, code: '97506-2', display: 'Coefficient of variation' }] },
      valueQuantity: { value: options.cv, unit: '%', system: UCUM_SYSTEM, code: '%' },
    })
  }

  return {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [
        {
          system: LOINC_SYSTEM,
          code: '97504-5',
          display: 'CGM summary',
        },
      ],
    },
    effectivePeriod: {
      start: period.start,
      end: period.end,
    },
    component: components,
  }
}

/**
 * Converts a single GlucoseReading into a FHIR-aligned CGM sensor reading.
 *
 * @param reading - A GlucoseReading from any source (raw or normalized)
 * @returns FHIR-aligned sensor reading observation
 */
export function buildFHIRSensorReading(
  reading: GlucoseReading
): FHIRCGMSensorReading {
  const isMgDl = reading.unit === MG_DL
  return {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [
        {
          system: LOINC_SYSTEM,
          code: isMgDl ? '99504-3' : '14745-4',
          display: isMgDl
            ? 'Glucose [Mass/volume] in Interstitial fluid'
            : 'Glucose [Moles/volume] in Interstitial fluid',
        },
      ],
    },
    effectiveDateTime: reading.timestamp,
    valueQuantity: {
      value: reading.value,
      unit: reading.unit,
      system: UCUM_SYSTEM,
      code: isMgDl ? 'mg/dL' : 'mmol/L',
    },
  }
}

/**
 * Converts an array of GlucoseReadings into FHIR-aligned sensor reading observations.
 *
 * @param readings - Array of glucose readings
 * @returns Array of FHIR-aligned sensor reading observations
 */
export function buildFHIRSensorReadings(
  readings: GlucoseReading[]
): FHIRCGMSensorReading[] {
  return readings.map(buildFHIRSensorReading)
}
