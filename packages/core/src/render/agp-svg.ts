/**
 * @file src/render/agp-svg.ts
 *
 * "AGP-in-a-tag": renders an Ambulatory Glucose Profile as a self-contained,
 * themeable SVG **string** — no DOM, no canvas, no framework. It runs
 * {@link buildAGPProfile} internally and draws the 5–95 and 25–75 percentile
 * bands, the median line, and the target range. Works anywhere a string does:
 * Node, email, PDF, a README, RSC, or any UI framework.
 *
 * Scoped to mg/dL (the standard AGP unit). Pure and dependency-free.
 *
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */

import type { GlucoseReading } from '../types'
import { buildAGPProfile, type AGPProfileBin } from '../metrics/agp-profile'

/** y-axis floor (mg/dL). */
const Y_MIN = 40
/** y-axis ceiling (mg/dL). */
const Y_MAX = 350
/** Target range bounds (mg/dL). */
const TARGET_LOW = 70
const TARGET_HIGH = 180
/** AGP percentile bands. */
const PERCENTILES = [5, 25, 50, 75, 95]
/** y-axis tick values (mg/dL). */
const Y_TICKS = [54, 70, 140, 180, 250]
/** x-axis ticks (minute-of-day) and labels. */
const X_TICKS = [0, 360, 720, 1080, 1440]
const X_LABELS = ['12 AM', '6 AM', '12 PM', '6 PM', '12 AM']

/** Options for {@link agpChartToSVG}. */
export interface AGPChartOptions {
  /** SVG width in px (default 800). */
  readonly width?: number
  /** SVG height in px (default 320). */
  readonly height?: number
  /** Color theme (default 'dark'). */
  readonly theme?: 'light' | 'dark'
  /** IANA time zone for time-of-day bucketing (default 'UTC'). */
  readonly timeZone?: string
  /** Bin width in minutes for the underlying profile (default 5). */
  readonly binMinutes?: number
  /** Optional chart title. */
  readonly title?: string
}

interface ChartPalette {
  bg: string
  band05: string
  band25: string
  median: string
  targetFill: string
  targetLine: string
  axis: string
  text: string
}

function palette(theme: 'light' | 'dark'): ChartPalette {
  if (theme === 'light') {
    return {
      bg: '#ffffff',
      band05: 'rgba(2,132,199,0.12)',
      band25: 'rgba(2,132,199,0.30)',
      median: '#0f172a',
      targetFill: 'rgba(22,163,74,0.10)',
      targetLine: 'rgba(22,163,74,0.55)',
      axis: 'rgba(15,23,42,0.14)',
      text: '#475569',
    }
  }
  return {
    bg: '#0a0a0a',
    band05: 'rgba(56,189,248,0.14)',
    band25: 'rgba(56,189,248,0.34)',
    median: '#f1f5f9',
    targetFill: 'rgba(34,197,94,0.12)',
    targetLine: 'rgba(34,197,94,0.5)',
    axis: 'rgba(148,163,184,0.22)',
    text: '#94a3b8',
  }
}

/** Escapes XML special characters in text content. @internal */
function escapeXml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  )
}

/** Rounds to one decimal for compact, deterministic coordinates. @internal */
function fmt(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Renders an Ambulatory Glucose Profile chart as an SVG string.
 *
 * @param readings - Glucose readings with ISO 8601 timestamps (mg/dL or mmol/L)
 * @param options - Dimensions, theme, time zone, and title
 * @returns A complete, self-contained SVG document string
 *
 * @example
 * ```ts
 * const svg = agpChartToSVG(readings, { theme: 'dark' })
 * // <svg ...>…</svg> — drop into HTML, a README, an email, or a PDF
 * ```
 *
 * @category Render
 * @public
 */
export function agpChartToSVG(
  readings: GlucoseReading[],
  options?: AGPChartOptions
): string {
  const width = options?.width ?? 800
  const height = options?.height ?? 320
  const theme = options?.theme ?? 'dark'
  const c = palette(theme)

  const profile = buildAGPProfile(readings, {
    percentiles: PERCENTILES,
    timeZone: options?.timeZone,
    binMinutes: options?.binMinutes,
  })

  const margin = { top: 20, right: 16, bottom: 28, left: 44 }
  const plotW = width - margin.left - margin.right
  const plotH = height - margin.top - margin.bottom

  const xScale = (minuteOfDay: number): number =>
    margin.left + (minuteOfDay / 1440) * plotW
  const yScale = (value: number): number => {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, value))
    return margin.top + (1 - (clamped - Y_MIN) / (Y_MAX - Y_MIN)) * plotH
  }

  // Group consecutive bins that have data into runs (breaks at sensor gaps).
  const runs: AGPProfileBin[][] = []
  let current: AGPProfileBin[] = []
  for (const bin of profile.bins) {
    if (bin.n > 0) {
      current.push(bin)
    } else if (current.length > 0) {
      runs.push(current)
      current = []
    }
  }
  if (current.length > 0) runs.push(current)

  const bandPath = (run: AGPProfileBin[], upper: number, lower: number): string => {
    const top = run.map((b) => `${fmt(xScale(b.minuteOfDay))},${fmt(yScale(b.percentiles[upper]!))}`)
    const bottom = [...run]
      .reverse()
      .map((b) => `${fmt(xScale(b.minuteOfDay))},${fmt(yScale(b.percentiles[lower]!))}`)
    return `M${top.join(' L')} L${bottom.join(' L')} Z`
  }
  const medianPoints = (run: AGPProfileBin[]): string =>
    run.map((b) => `${fmt(xScale(b.minuteOfDay))},${fmt(yScale(b.percentiles[50]!))}`).join(' ')

  const parts: string[] = []
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Ambulatory Glucose Profile">`
  )
  parts.push(`<rect width="${width}" height="${height}" fill="${c.bg}"/>`)

  // Target range shading + boundary lines (redundant encoding for CVD safety).
  const yHigh = fmt(yScale(TARGET_HIGH))
  const yLow = fmt(yScale(TARGET_LOW))
  parts.push(
    `<rect x="${margin.left}" y="${yHigh}" width="${fmt(plotW)}" height="${fmt(yLow - yHigh)}" fill="${c.targetFill}"/>`
  )
  for (const [ty, label] of [
    [yLow, `${TARGET_LOW}`],
    [yHigh, `${TARGET_HIGH}`],
  ] as const) {
    parts.push(
      `<line x1="${margin.left}" y1="${ty}" x2="${fmt(margin.left + plotW)}" y2="${ty}" stroke="${c.targetLine}" stroke-width="1" stroke-dasharray="4 3"/>`
    )
    parts.push(
      `<text x="${fmt(margin.left + plotW + 2)}" y="${fmt(ty + 3)}" fill="${c.targetLine}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="9" text-anchor="start">${label}</text>`
    )
  }

  // y grid + labels
  for (const ty of Y_TICKS) {
    const y = fmt(yScale(ty))
    parts.push(
      `<line x1="${margin.left}" y1="${y}" x2="${fmt(margin.left + plotW)}" y2="${y}" stroke="${c.axis}" stroke-width="1"/>`
    )
    parts.push(
      `<text x="${margin.left - 6}" y="${fmt(y + 3)}" fill="${c.text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="9" text-anchor="end">${ty}</text>`
    )
  }

  // x labels
  X_TICKS.forEach((tx, i) => {
    parts.push(
      `<text x="${fmt(xScale(tx))}" y="${height - 10}" fill="${c.text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="9" text-anchor="middle">${X_LABELS[i]}</text>`
    )
  })

  // Percentile bands + median (per run, so gaps break cleanly)
  for (const run of runs) {
    parts.push(`<path d="${bandPath(run, 95, 5)}" fill="${c.band05}"/>`)
    parts.push(`<path d="${bandPath(run, 75, 25)}" fill="${c.band25}"/>`)
    parts.push(
      `<polyline points="${medianPoints(run)}" fill="none" stroke="${c.median}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
    )
  }

  if (runs.length === 0) {
    parts.push(
      `<text x="${fmt(width / 2)}" y="${fmt(height / 2)}" fill="${c.text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" text-anchor="middle">No data</text>`
    )
  }

  if (options?.title) {
    parts.push(
      `<text x="${margin.left}" y="13" fill="${c.text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-weight="600" text-anchor="start">${escapeXml(options.title)}</text>`
    )
  }

  parts.push('</svg>')
  return parts.join('')
}
