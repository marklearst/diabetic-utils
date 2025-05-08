// @file src/types.ts

import { MG_DL, MMOL_L } from './constants'

export type GlucoseUnit = typeof MG_DL | typeof MMOL_L

export const AllowedGlucoseUnits: GlucoseUnit[] = [MG_DL, MMOL_L]

export interface GlucoseReading {
  readonly value: number
  readonly unit: GlucoseUnit
  readonly timestamp: string // ISO 8601
}

export interface EstimateGMIOptions {
  value: number
  unit: GlucoseUnit
}

export interface A1CReading {
  readonly value: number
  readonly date: string
}

export interface TIRResult {
  inRange: number
  belowRange: number
  aboveRange: number
}
export interface TIROptions {
  readings: GlucoseReading[]
  unit: GlucoseUnit
  range: [number, number]
}
export interface TIRResult {
  inRange: number
  belowRange: number
  aboveRange: number
}
export interface A1CResult {
  value: number
  unit: GlucoseUnit
}
export interface GMIResult {
  value: number
  unit: GlucoseUnit
}
export interface GlucoseStatsOptions {
  readings: GlucoseReading[]
  unit: GlucoseUnit
  range: [number, number]
  gmi: boolean
  a1c: boolean
  tir: boolean
  tirRange: [number, number]
  tirPercent: boolean
  tirPercentBelow: boolean
  tirPercentAbove: boolean
  tirPercentInRange: boolean
  tirPercentBelowRounded: boolean
  tirPercentAboveRounded: boolean
  tirPercentInRangeRounded: boolean
}
export interface GlucoseStats {
  mean: number
  median: number
  mode: number
  stdDev: number
  min: number
  max: number
  count: number
  readings: GlucoseReading[]
  unit: GlucoseUnit
  gmi: number
  a1c: number
  tir: TIRResult
  tirPercent: number
  tirRange: [number, number]
  tirBelow: number
  tirAbove: number
  tirInRange: number
  tirPercentBelow: number
  tirPercentAbove: number
  tirPercentInRange: number
  tirPercentInRangeRounded: number
  tirPercentBelowRounded: number
  tirPercentAboveRounded: number
}
