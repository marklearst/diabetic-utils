import { describe, it, expect } from 'vitest'
import * as api from '../src'

describe('index exports', () => {
  it('should export all expected functions and types', () => {
    // A1C functions
    expect(api.formatA1C).toBeDefined()
    expect(api.isValidA1C).toBeDefined()
    expect(api.getA1CCategory).toBeDefined()
    expect(api.isA1CInTarget).toBeDefined()
    expect(api.a1cDelta).toBeDefined()
    expect(api.a1cTrend).toBeDefined()

    // Conversion / GMI / eAG functions
    expect(api.estimateA1CFromAvgGlucose).toBeDefined()
    expect(api.estimateAvgGlucoseFromA1C).toBeDefined()
    expect(api.estimateEAG).toBeDefined()
    expect(api.estimateA1CFromAverage).toBeDefined()
    expect(api.a1cToGMI).toBeDefined()
    expect(api.estimateGMI).toBeDefined()
    expect(api.mgDlToMmolL).toBeDefined()
    expect(api.mmolLToMgDl).toBeDefined()
    expect(api.convertGlucoseUnit).toBeDefined()

    // Glucose utilities
    expect(api.isHypo).toBeDefined()
    expect(api.isHyper).toBeDefined()
    expect(api.getGlucoseLabel).toBeDefined()
    expect(api.parseGlucoseString).toBeDefined()
    expect(api.isValidGlucoseValue).toBeDefined()

    // TIR basic
    expect(api.calculateTIR).toBeDefined()
    expect(api.getTIRSummary).toBeDefined()
    expect(api.groupByDay).toBeDefined()
    expect(api.calculateTimeInRange).toBeDefined()

    // TIR enhanced / pregnancy
    expect(api.calculateEnhancedTIR).toBeDefined()
    expect(api.calculatePregnancyTIR).toBeDefined()

    // Variability / MAGE
    expect(api.glucoseStandardDeviation).toBeDefined()
    expect(api.glucoseCoefficientOfVariation).toBeDefined()
    expect(api.glucosePercentiles).toBeDefined()
    expect(api.glucoseMAGE).toBeDefined()
    expect(api.clinicalMAGE).toBeDefined()

    // Alignment / insulin resistance
    expect(api.calculateHOMAIR).toBeDefined()
    expect(api.checkGlycemicAlignment).toBeDefined()

    // Guards / validators
    expect(api.isEstimateGMIOptions).toBeDefined()
    expect(api.isValidGlucoseString).toBeDefined()
    expect(api.isValidInsulin).toBeDefined()

    // Formatters
    expect(api.formatGlucose).toBeDefined()
    expect(api.formatPercentage).toBeDefined()
    expect(api.formatDate).toBeDefined()

    // Connector adapters
    expect(api.normalizeDexcomEntry).toBeDefined()
    expect(api.normalizeDexcomEntries).toBeDefined()
    expect(api.parseDexcomDate).toBeDefined()
    expect(api.normalizeDexcomTrend).toBeDefined()
    expect(api.normalizeLibreEntry).toBeDefined()
    expect(api.normalizeLibreEntries).toBeDefined()
    expect(api.normalizeLibreTrend).toBeDefined()
    expect(api.normalizeNightscoutEntry).toBeDefined()
    expect(api.normalizeNightscoutEntries).toBeDefined()
    expect(api.normalizeNightscoutDirection).toBeDefined()

    // Interop (FHIR / Open mHealth)
    expect(api.buildFHIRCGMSummary).toBeDefined()
    expect(api.buildFHIRSensorReading).toBeDefined()
    expect(api.buildFHIRSensorReadings).toBeDefined()
    expect(api.buildOMHBloodGlucose).toBeDefined()
    expect(api.buildOMHDataPoint).toBeDefined()
    expect(api.buildOMHBloodGlucoseList).toBeDefined()

    // Advanced CGM metrics
    expect(api.glucoseLBGI).toBeDefined()
    expect(api.glucoseHBGI).toBeDefined()
    expect(api.calculateGRI).toBeDefined()
    expect(api.calculateMODD).toBeDefined()
  })

  it('should export all expected constants', () => {
    expect(api.MG_DL).toBe('mg/dL')
    expect(api.MMOL_L).toBe('mmol/L')
    expect(api.AllowedGlucoseUnits).toBeDefined()
    expect(api.MGDL_MMOLL_CONVERSION).toBeDefined()
    expect(api.HYPO_THRESHOLD_MGDL).toBeDefined()
    expect(api.HYPER_THRESHOLD_MGDL).toBeDefined()
    expect(api.HOMA_IR_DENOMINATOR).toBeDefined()
    expect(api.GMI_COEFFICIENTS).toBeDefined()
    expect(api.TREND_ARROWS).toBeDefined()
    expect(api.GLUCOSE_ZONE_COLORS).toBeDefined()

    // Enhanced TIR constants
    expect(api.TIR_VERY_LOW_THRESHOLD_MGDL).toBeDefined()
    expect(api.TIR_LOW_THRESHOLD_MGDL).toBeDefined()
    expect(api.TIR_HIGH_THRESHOLD_MGDL).toBeDefined()
    expect(api.TIR_VERY_HIGH_THRESHOLD_MGDL).toBeDefined()
    expect(api.TIR_GOAL_STANDARD).toBeDefined()
    expect(api.TBR_LEVEL1_GOAL).toBeDefined()
    expect(api.TBR_LEVEL2_GOAL).toBeDefined()
    expect(api.TAR_LEVEL1_GOAL).toBeDefined()
    expect(api.TAR_LEVEL2_GOAL).toBeDefined()
    expect(api.PREGNANCY_TARGET_LOW_MGDL).toBeDefined()
    expect(api.PREGNANCY_TARGET_HIGH_MGDL).toBeDefined()
  })

  it('should export all expected type constructs', () => {
    expect(api.AllowedGlucoseUnits).toContain('mg/dL')
    expect(api.AllowedGlucoseUnits).toContain('mmol/L')
  })
})
