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

/** Options for {@link buildOMHBloodGlucose}. */
export interface BuildOMHBloodGlucoseOptions {
  /**
   * Specimen source for the blood glucose reading.
   * Defaults to `'interstitial fluid'` (typical for CGM sensors).
   * Pass `undefined` to omit the field entirely.
   */
  specimenSource?: OMHBloodGlucose['specimen_source']
}

/**
 * Converts a GlucoseReading into an Open mHealth blood-glucose body.
 *
 * @param reading - A GlucoseReading from any source
 * @param options - Optional overrides; omit `specimenSource` to exclude the field
 * @returns OMH blood-glucose body
 */
export function buildOMHBloodGlucose(
  reading: GlucoseReading,
  options?: BuildOMHBloodGlucoseOptions
): OMHBloodGlucose {
  const specimenSource =
    options && 'specimenSource' in options
      ? options.specimenSource
      : 'interstitial fluid'

  return {
    blood_glucose: {
      value: reading.value,
      unit: reading.unit === MG_DL ? 'mg/dL' : 'mmol/L',
    },
    effective_time_frame: {
      date_time: reading.timestamp,
    },
    ...(specimenSource !== undefined ? { specimen_source: specimenSource } : {}),
  }
}

/**
 * Wraps a GlucoseReading into a full Open mHealth DataPoint with header.
 *
 * @param reading - A GlucoseReading from any source
 * @param id - Unique datapoint identifier (UUID recommended)
 * @param options - Optional overrides forwarded to {@link buildOMHBloodGlucose}
 * @returns Full OMH DataPoint with header and body
 */
export function buildOMHDataPoint(
  reading: GlucoseReading,
  id: string,
  options?: BuildOMHBloodGlucoseOptions
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
    body: buildOMHBloodGlucose(reading, options),
  }
}

/**
 * Converts an array of GlucoseReadings into Open mHealth blood-glucose bodies.
 *
 * @param readings - Array of glucose readings
 * @param options - Optional overrides forwarded to {@link buildOMHBloodGlucose}
 * @returns Array of OMH blood-glucose bodies
 */
export function buildOMHBloodGlucoseList(
  readings: GlucoseReading[],
  options?: BuildOMHBloodGlucoseOptions
): OMHBloodGlucose[] {
  return readings.map((r) => buildOMHBloodGlucose(r, options))
}
