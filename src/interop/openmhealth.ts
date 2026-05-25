/**
 * @file src/interop/openmhealth.ts
 *
 * Stateless Open mHealth payload builders for glucose data.
 * Generates JSON datapoints aligned with the Open mHealth blood-glucose schema.
 *
 * @see https://www.openmhealth.org/documentation/schema-docs/schema-library/
 */

import type { GlucoseReading } from '../types'
import { MG_DL } from '../constants'
import type { OMHBloodGlucose, OMHDataPoint } from './types'

const OMH_SCHEMA = {
  namespace: 'omh',
  name: 'blood-glucose',
  version: '3.0',
} as const

/**
 * Converts a GlucoseReading into an Open mHealth blood-glucose body.
 *
 * @param reading - A GlucoseReading from any source
 * @returns OMH blood-glucose body
 */
export function buildOMHBloodGlucose(reading: GlucoseReading): OMHBloodGlucose {
  return {
    blood_glucose: {
      value: reading.value,
      unit: reading.unit === MG_DL ? 'mg/dL' : 'mmol/L',
    },
    effective_time_frame: {
      date_time: reading.timestamp,
    },
    specimen_source: 'interstitial fluid',
  }
}

/**
 * Wraps a GlucoseReading into a full Open mHealth DataPoint with header.
 *
 * @param reading - A GlucoseReading from any source
 * @param id - Unique datapoint identifier (UUID recommended)
 * @returns Full OMH DataPoint with header and body
 */
export function buildOMHDataPoint(
  reading: GlucoseReading,
  id: string
): OMHDataPoint<OMHBloodGlucose> {
  return {
    header: {
      id,
      schema_id: {
        namespace: OMH_SCHEMA.namespace,
        name: OMH_SCHEMA.name,
        version: OMH_SCHEMA.version,
      },
      creation_date_time: new Date().toISOString(),
    },
    body: buildOMHBloodGlucose(reading),
  }
}

/**
 * Converts an array of GlucoseReadings into Open mHealth blood-glucose bodies.
 *
 * @param readings - Array of glucose readings
 * @returns Array of OMH blood-glucose bodies
 */
export function buildOMHBloodGlucoseList(
  readings: GlucoseReading[]
): OMHBloodGlucose[] {
  return readings.map(buildOMHBloodGlucose)
}
