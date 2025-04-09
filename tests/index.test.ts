import { describe, it, expect } from 'vitest'
import * as api from '../src'

describe('index exports', () => {
  it('should export all expected functions and types', () => {
    // A1C functions
    expect(api.estimateA1CFromAverage).toBeDefined()
    expect(api.estimateGMI).toBeDefined()

    // Conversion functions
    expect(api.mgDlToMmolL).toBeDefined()
    expect(api.mmolLToMgDl).toBeDefined()
    expect(api.convertGlucoseUnit).toBeDefined()

    // Glucose functions
    expect(api.isValidGlucoseValue).toBeDefined()
    expect(api.parseGlucoseString).toBeDefined()
    expect(api.isHyper).toBeDefined()
    expect(api.isHypo).toBeDefined()

    // TIR functions
    expect(api.calculateTimeInRange).toBeDefined()
    expect(api.getTIRSummary).toBeDefined()
    expect(api.groupByDay).toBeDefined()

    // Formatters
    expect(api.formatGlucose).toBeDefined()
    expect(api.formatPercentage).toBeDefined()
    expect(api.formatDate).toBeDefined()

    // Type Guards
    expect(api.isEstimateGMIOptions).toBeDefined()
    expect(api.isValidGlucoseString).toBeDefined()

    // Constants
    expect(api.MG_DL).toBeDefined()
    expect(api.MMOL_L).toBeDefined()
    expect(api.AllowedGlucoseUnits).toBeDefined()
  })

  it('should export all expected types', () => {
    // We can't directly test types at runtime, but we can verify the exports exist
    expect(Object.keys(api)).toContain('AllowedGlucoseUnits')
  })
})
