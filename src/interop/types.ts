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

interface FHIRCoding {
  readonly system: string
  readonly code: string
  readonly display: string
}

interface FHIRCodeableConcept {
  readonly coding: readonly FHIRCoding[]
}

interface FHIRQuantity {
  readonly value: number
  readonly unit: string
  readonly system: string
  readonly code: string
}

/** LOINC-coded CGM summary observation component. */
export interface FHIRCGMComponent {
  /** Coded component descriptor */
  readonly code: FHIRCodeableConcept
  /** Measured value in FHIR valueQuantity shape */
  readonly valueQuantity: FHIRQuantity
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
  readonly code: FHIRCodeableConcept
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
  readonly code: FHIRCodeableConcept
  readonly effectiveDateTime: string
  readonly valueQuantity: FHIRQuantity
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
    readonly unit: GlucoseUnit
  }
  readonly effective_time_frame: {
    readonly date_time: string
  }
  readonly specimen_source: 'interstitial fluid' | 'capillary blood' | 'plasma'
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
