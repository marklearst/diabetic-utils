/**
 * @file src/interop/types.ts
 *
 * Types for health data interoperability payloads.
 * These are lightweight, serializable shapes aligned with FHIR CGM IG and
 * Open mHealth schemas — they do NOT depend on any FHIR library.
 */

import type { GlucoseUnit } from '../types'

// ---------------------------------------------------------------------------
// FHIR-aligned CGM summary types (HL7 CGM IG v1.0.0)
// ---------------------------------------------------------------------------

/**
 * FHIR-compliant CGM summary observation component.
 * Matches the `Observation.component` shape required by the FHIR spec:
 * `code` is a CodeableConcept and the measured value is in `valueQuantity`.
 */
export interface FHIRCGMComponent {
  /** CodeableConcept identifying the component (LOINC coding) */
  readonly code: {
    readonly coding: readonly [{ readonly system: string; readonly code: string; readonly display: string }]
  }
  /** Measured quantity (UCUM-coded) */
  readonly valueQuantity: {
    readonly value: number
    readonly unit: string
    readonly system: string
    readonly code: string
  }
}

/**
 * Lightweight FHIR-aligned CGM summary observation.
 * Follows the structure of the HL7 CGM IG `CGMSummaryObservation` profile
 * without requiring a full FHIR library.
 *
 * @see https://build.fhir.org/ig/HL7/cgm/StructureDefinition-cgm-summary.html
 */
export interface FHIRCGMSummary {
  readonly resourceType: 'Observation'
  readonly status: 'final'
  readonly code: {
    readonly coding: readonly [{ readonly system: string; readonly code: string; readonly display: string }]
  }
  readonly effectivePeriod: {
    readonly start: string
    readonly end: string
  }
  readonly component: readonly FHIRCGMComponent[]
}

/**
 * Lightweight FHIR-aligned CGM sensor reading.
 * Follows the structure of the HL7 CGM IG sensor reading profile.
 *
 * @see https://build.fhir.org/ig/HL7/cgm/StructureDefinition-cgm-sensor-reading-mass-per-volume.html
 */
export interface FHIRCGMSensorReading {
  readonly resourceType: 'Observation'
  readonly status: 'final'
  readonly code: {
    readonly coding: readonly [{ readonly system: string; readonly code: string; readonly display: string }]
  }
  readonly effectiveDateTime: string
  readonly valueQuantity: {
    readonly value: number
    readonly unit: string
    readonly system: string
    readonly code: string
  }
}

// ---------------------------------------------------------------------------
// Open mHealth blood glucose types
// ---------------------------------------------------------------------------

/**
 * Open mHealth blood-glucose datapoint body.
 *
 * @see https://www.openmhealth.org/documentation/schema-docs/schema-library/
 */
export interface OMHBloodGlucose {
  readonly blood_glucose: {
    readonly value: number
    readonly unit: string
  }
  readonly effective_time_frame: {
    readonly date_time: string
  }
  readonly specimen_source?: 'interstitial fluid' | 'capillary blood' | 'plasma'
}

/** Wrapped OMH datapoint with header metadata. */
export interface OMHDataPoint<T = OMHBloodGlucose> {
  readonly header: {
    readonly id: string
    readonly schema_id: {
      readonly namespace: string
      readonly name: string
      readonly version: string
    }
    readonly creation_date_time: string
  }
  readonly body: T
}
