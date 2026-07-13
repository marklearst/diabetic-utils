/**
 * @file src/analyze.ts
 *
 * One-call clinical glucose report. `analyzeGlucose` runs a single normalized,
 * validated pass over a set of readings and returns a comprehensive, typed
 * report: summary scalars (mean, GMI, CV, SD), the enhanced 5-range TIR, tight
 * range, the full risk-metric set, a data-sufficiency assessment, and
 * (optionally) the AGP percentile-band series.
 *
 * Every sub-metric is fed from the SAME cleaned reading set, giving a
 * consistent denominator across the whole report. Empty/all-invalid input
 * returns a typed `valid: false` report rather than throwing.
 *
 * Pure and dependency-free.
 */

import type { GlucoseReading, GlucoseUnit, EnhancedTIRResult } from './types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from './constants'
import { estimateGMI } from './conversions'
import { calculateEnhancedTIR } from './tir-enhanced'
import { calculateTITR, type TITRResult } from './tir'
import { calculateAGPMetrics } from './metrics/agp'
import { buildAGPProfile, type AGPProfileResult } from './metrics/agp-profile'
import { detectEpisodes, type EpisodeResult } from './metrics/episodes'
import type { GRADEResult } from './metrics/grade'
import type { GRIResult } from './metrics/gri'

/** Maximum physiologically-plausible glucose value (mg/dL) used to screen input. */
const MAX_PLAUSIBLE_MGDL = 600
/** Consensus data-sufficiency defaults (Battelino 2019). */
const DEFAULT_MIN_DAYS = 14
const DEFAULT_MIN_ACTIVE_PERCENT = 70

/** Options for {@link analyzeGlucose}. */
export interface AnalyzeGlucoseOptions {
  /** Unit for TIR validation/labeling (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
  /** IANA time zone for the AGP profile (default 'UTC'). */
  readonly timeZone?: string
  /** Include the AGP percentile-band series (default true). */
  readonly includeProfile?: boolean
  /** Minimum days of data for the consensus sufficiency flag (default 14). */
  readonly minDays?: number
  /** Minimum active/wear percent for the consensus sufficiency flag (default 70). */
  readonly minActivePercent?: number
}

/** Risk-metric block of an {@link AnalyzeGlucoseResult}. */
export interface RiskMetrics {
  readonly lbgi: number
  readonly hbgi: number
  readonly adrr: number
  readonly grade: GRADEResult
  readonly gri: GRIResult
  readonly jIndex: number
  readonly modd: number
  readonly conga: number
}

/** Data-sufficiency assessment for a report. */
export interface DataSufficiency {
  /** Number of valid readings analyzed. */
  readonly totalReadings: number
  /** Span of the data in days (last − first). */
  readonly daysOfData: number
  /** CGM active/wear percent. */
  readonly activePercent: number
  /** Whether the data meets the consensus recording standard. */
  readonly meetsCGMStandard: boolean
}

/** Result of {@link analyzeGlucose}. */
export interface AnalyzeGlucoseResult {
  readonly meanGlucose: number
  readonly gmi: number
  readonly cv: number
  readonly sd: number
  readonly timeInRange: EnhancedTIRResult | null
  readonly tightRange: TITRResult | null
  readonly risk: RiskMetrics | null
  readonly dataSufficiency: DataSufficiency
  readonly agpProfile: AGPProfileResult | null
  readonly episodes: EpisodeResult | null
  readonly valid: boolean
}

/**
 * Produces a comprehensive clinical report from glucose readings in one call.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps
 * @param options - Unit, time zone, profile toggle, and sufficiency thresholds
 * @returns A typed report; `valid: false` when there are no in-range readings
 *
 * @example
 * ```ts
 * const report = analyzeGlucose(readings, { timeZone: 'America/New_York' })
 * report.timeInRange?.inRange.percentage // 72.5
 * report.gmi                             // 6.8
 * report.agpProfile?.bins                // 288 time-of-day bins
 * ```
 *
 * @category Report
 * @public
 */
export function analyzeGlucose(
  readings: GlucoseReading[],
  options?: AnalyzeGlucoseOptions
): AnalyzeGlucoseResult {
  const includeProfile = options?.includeProfile ?? true
  const minDays = options?.minDays ?? DEFAULT_MIN_DAYS
  const minActivePercent = options?.minActivePercent ?? DEFAULT_MIN_ACTIVE_PERCENT

  // Single cleaning pass: physiologically plausible value + parseable timestamp.
  const clean = readings.filter((r) => {
    if (!Number.isFinite(r.value) || r.value <= 0) return false
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (mgdl > MAX_PLAUSIBLE_MGDL) return false
    return !Number.isNaN(Date.parse(r.timestamp))
  })

  if (clean.length === 0) {
    return {
      meanGlucose: NaN,
      gmi: NaN,
      cv: NaN,
      sd: NaN,
      timeInRange: null,
      tightRange: null,
      risk: null,
      dataSufficiency: {
        totalReadings: 0,
        daysOfData: 0,
        activePercent: NaN,
        meetsCGMStandard: false,
      },
      agpProfile: null,
      episodes: null,
      valid: false,
    }
  }

  const agp = calculateAGPMetrics(clean)
  const timeInRange = calculateEnhancedTIR(clean, { unit: options?.unit })
  const tightRange = calculateTITR(clean)
  const agpProfile = includeProfile
    ? buildAGPProfile(clean, { timeZone: options?.timeZone })
    : null

  let minMs = Infinity
  let maxMs = -Infinity
  for (const r of clean) {
    const ms = Date.parse(r.timestamp)
    if (ms < minMs) minMs = ms
    if (ms > maxMs) maxMs = ms
  }
  const daysOfData = Math.round(((maxMs - minMs) / 86400000) * 10) / 10
  const activePercent = agp.activePercent.activePercent

  return {
    meanGlucose: agp.meanGlucose,
    gmi: estimateGMI(agp.meanGlucose, MG_DL),
    cv: agp.cv,
    sd: agp.sd,
    timeInRange,
    tightRange,
    risk: {
      lbgi: agp.lbgi,
      hbgi: agp.hbgi,
      adrr: agp.adrr,
      grade: agp.grade,
      gri: agp.gri,
      jIndex: agp.jIndex,
      modd: agp.modd,
      conga: agp.conga,
    },
    dataSufficiency: {
      totalReadings: clean.length,
      daysOfData,
      activePercent,
      meetsCGMStandard: daysOfData >= minDays && activePercent >= minActivePercent,
    },
    agpProfile,
    episodes: detectEpisodes(clean),
    valid: true,
  }
}
