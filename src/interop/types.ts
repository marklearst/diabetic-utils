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
 * FHIR-conformant CGM summary observation component.
 * Models `Observation.component` per the FHIR R4 specification:
 * - `code` is a CodeableConcept with a LOINC `coding` entry
 * - the measured value is carried in `valueQuantity` (a FHIR Quantity)
 */
export interface FHIRCGMComponent {
  /** CodeableConcept identifying the component (LOINC code) */
  readonly code: {
    readonly coding: readonly [{ readonly system: string; readonly code: string; readonly display: string }]
  }
  /** Measured value as a FHIR Quantity */
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
