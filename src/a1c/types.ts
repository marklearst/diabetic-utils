// src/a1c/types.ts

export type GlucoseUnit = 'mg/dL' | 'mmol/L'

export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}
