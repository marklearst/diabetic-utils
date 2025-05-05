// src/a1c/types.ts

export type GlucoseUnit = 'mg/dL' | 'mmol/L'
export const allowedGlucoseUnits: GlucoseUnit[] = ['mg/dL', 'mmol/L']

export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}
