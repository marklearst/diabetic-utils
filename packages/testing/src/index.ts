/**
 * @glucoseiq/testing — deterministic mock-CGM data for tests, demos, and docs.
 *
 * A seedable generator producing realistic glucose curves (circadian baseline,
 * meal spikes, noise, optional nocturnal hypos) plus ready-made scenario
 * fixtures. Same seed → identical output, always — safe for golden tests.
 */

import type { GlucoseReading, GlucoseUnit } from '@glucoseiq/core'

/** mg/dL per mmol/L (matches @glucoseiq/core). */
const MGDL_PER_MMOLL = 18.0182

/** Options for {@link generateCGMSeries}. */
export interface GenerateOptions {
  /** Number of days to generate (default 1). */
  readonly days?: number
  /** Minutes between readings (default 5). */
  readonly intervalMin?: number
  /** Deterministic seed (default 42). */
  readonly seed?: number
  /** ISO 8601 start timestamp (default '2024-01-01T00:00:00Z'). */
  readonly start?: string
  /** Baseline glucose in mg/dL (default 110). */
  readonly basal?: number
  /** Meal times as minute-of-day (default 07:00, 13:00, 19:00). */
  readonly mealTimes?: readonly number[]
  /** Peak meal excursion amplitude in mg/dL (default 70). */
  readonly mealAmplitude?: number
  /** Noise amplitude in mg/dL (default 8). */
  readonly noise?: number
  /** Zero-based day indices that get a 02:00–04:00 hypo dip (default none). */
  readonly nocturnalHypoDays?: readonly number[]
  /** Output unit (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
}

/** Mulberry32 — tiny deterministic PRNG. @internal */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generates a deterministic, realistic CGM series.
 *
 * @param options - Shape of the generated data
 * @returns Chronological readings; same options (incl. seed) → identical output
 *
 * @example
 * ```ts
 * const readings = generateCGMSeries({ days: 14, seed: 7 })
 * ```
 */
export function generateCGMSeries(options?: GenerateOptions): GlucoseReading[] {
  const days = options?.days ?? 1
  const intervalMin = options?.intervalMin ?? 5
  const seed = options?.seed ?? 42
  const startMs = Date.parse(options?.start ?? '2024-01-01T00:00:00Z')
  const basal = options?.basal ?? 110
  const mealTimes = options?.mealTimes ?? [420, 780, 1140]
  const mealAmplitude = options?.mealAmplitude ?? 70
  const noise = options?.noise ?? 8
  const hypoDays = new Set(options?.nocturnalHypoDays ?? [])
  const unit = options?.unit ?? 'mg/dL'

  const rand = mulberry32(seed)
  const perDay = Math.floor(1440 / intervalMin)
  const readings: GlucoseReading[] = []

  for (let d = 0; d < days; d++) {
    // Per-day personality: slight basal drift + meal-size variation.
    const dayShift = (rand() - 0.5) * 12
    const mealScale = 0.8 + rand() * 0.5

    for (let i = 0; i < perDay; i++) {
      const min = i * intervalMin
      const circadian = 16 * Math.sin((2 * Math.PI * (min - 300)) / 1440)
      const meals = mealTimes.reduce((sum, t) => {
        const dt = min - t
        if (dt < 0 || dt >= 210) return sum
        return sum + mealAmplitude * mealScale * Math.exp(-dt / 70) * Math.min(1, dt / 25)
      }, 0)
      const jitter = (rand() - 0.5) * 2 * noise
      const hypo = hypoDays.has(d) && min >= 120 && min <= 240 ? -55 : 0

      let mgdl = basal + dayShift + circadian + meals + jitter + hypo
      mgdl = Math.max(40, Math.min(400, mgdl))
      const value =
        unit === 'mg/dL'
          ? Math.round(mgdl)
          : Math.round((mgdl / MGDL_PER_MMOLL) * 10) / 10

      readings.push({
        value,
        unit,
        timestamp: new Date(startMs + (d * 1440 + min) * 60000).toISOString(),
      })
    }
  }
  return readings
}

/** Ready-made scenario fixtures (all deterministic). */
export const scenarios = {
  /** A calm, mostly in-range day. */
  steadyDay(): GlucoseReading[] {
    return generateCGMSeries({ seed: 11, mealAmplitude: 45, noise: 5 })
  },
  /** A day with a 02:00–04:00 nocturnal hypo. */
  hypoNight(): GlucoseReading[] {
    return generateCGMSeries({ seed: 21, nocturnalHypoDays: [0] })
  },
  /** Big post-meal excursions well above range. */
  rollercoaster(): GlucoseReading[] {
    return generateCGMSeries({ seed: 31, mealAmplitude: 130, noise: 14 })
  },
  /** A day with a 90-minute sensor dropout mid-afternoon. */
  gappyTrace(): GlucoseReading[] {
    const all = generateCGMSeries({ seed: 41 })
    // Remove 15:00–16:30 (minute-of-day 900–990).
    return all.filter((r) => {
      const d = new Date(r.timestamp)
      const min = d.getUTCHours() * 60 + d.getUTCMinutes()
      return min < 900 || min > 990
    })
  },
} as const
