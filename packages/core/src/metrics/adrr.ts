/**
 * @file src/metrics/adrr.ts
 *
 * Average Daily Risk Range (ADRR).
 *
 * ADRR combines the maximum daily hypo and hyper risk values to produce
 * a single composite risk score. It captures the amplitude of extreme
 * glucose excursions on each day and averages them.
 *
 * Formula (Kovatchev et al. 2006):
 *   For each day d: DR(d) = max(rl over day d) + max(rh over day d)
 *   ADRR = mean(DR) across all days
 *
 * Risk categories:
 *  - < 20: low risk
 *  - 20 - 40: moderate risk
 *  - > 40: high risk
 *
 * @see https://doi.org/10.2337/dc06-1085  Kovatchev et al. (2006)
 */

import type { GlucoseReading } from '../types'
import { MGDL_MMOLL_CONVERSION, MG_DL } from '../constants'
import { fbg } from './bgi'

/**
 * Calculates the Average Daily Risk Range (ADRR).
 *
 * @param readings - Array of GlucoseReading objects with timestamps
 * @returns ADRR value, or NaN if no valid readings
 * @see https://doi.org/10.2337/dc06-1085
 */
export function calculateADRR(readings: GlucoseReading[]): number {
  if (readings.length === 0) return NaN

  const dayBuckets = new Map<string, number[]>()

  for (const r of readings) {
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (!Number.isFinite(mgdl) || mgdl <= 0) continue

    const day = r.timestamp.slice(0, 10)
    if (!dayBuckets.has(day)) dayBuckets.set(day, [])
    dayBuckets.get(day)!.push(mgdl)
  }

  if (dayBuckets.size === 0) return NaN

  let totalDR = 0
  for (const values of dayBuckets.values()) {
    let maxRl = 0
    let maxRh = 0
    for (const g of values) {
      const f = fbg(g)
      const risk = 10 * f * f
      if (f < 0 && risk > maxRl) maxRl = risk
      if (f > 0 && risk > maxRh) maxRh = risk
    }
    totalDR += maxRl + maxRh
  }

  return Math.round((totalDR / dayBuckets.size) * 100) / 100
}
