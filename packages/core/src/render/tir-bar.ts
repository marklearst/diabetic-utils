/**
 * @file src/render/tir-bar.ts
 *
 * Renders the Time-in-Range stacked bar (the vertical 5-zone bar from an AGP
 * report) as a self-contained SVG string. Zones are ordered high→low with
 * always-on percent labels, so severity is encoded by position and text — not
 * color alone (colorblind-safe by redundancy).
 *
 * Pure and dependency-free.
 *
 * @see {@link https://diabetesjournals.org/care/article/42/8/1593 | International Consensus on Time in Range (2019)}
 */

import type { GlucoseReading } from '../types'
import { MG_DL, MGDL_MMOLL_CONVERSION } from '../constants'
import { calculateEnhancedTIR } from '../tir-enhanced'

/** Options for {@link tirBarToSVG}. */
export interface TIRBarOptions {
  /** SVG width in px (default 180). */
  readonly width?: number
  /** SVG height in px (default 320). */
  readonly height?: number
  /** Color theme (default 'dark'). */
  readonly theme?: 'light' | 'dark'
}

const ZONE_COLORS = {
  veryHigh: '#f97316',
  high: '#fbbf24',
  inRange: '#22c55e',
  low: '#f87171',
  veryLow: '#b91c1c',
} as const

/**
 * Renders a Time-in-Range stacked bar as an SVG string.
 *
 * @param readings - Glucose readings (mg/dL or mmol/L)
 * @param options - Dimensions and theme
 * @returns A self-contained SVG document string
 *
 * @example
 * ```ts
 * const svg = tirBarToSVG(readings)
 * ```
 *
 * @category Render
 * @public
 */
export function tirBarToSVG(readings: GlucoseReading[], options?: TIRBarOptions): string {
  const width = options?.width ?? 180
  const height = options?.height ?? 320
  const theme = options?.theme ?? 'dark'
  const bg = theme === 'light' ? '#ffffff' : '#0a0a0a'
  const text = theme === 'light' ? '#475569' : '#94a3b8'

  const clean = readings.filter((r) => {
    if (!Number.isFinite(r.value) || r.value <= 0) return false
    const mgdl = r.unit === MG_DL ? r.value : r.value * MGDL_MMOLL_CONVERSION
    if (mgdl > 600) return false
    return !Number.isNaN(Date.parse(r.timestamp))
  })

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Time in Range">`,
    `<rect width="${width}" height="${height}" fill="${bg}"/>`,
  ]

  if (clean.length === 0) {
    parts.push(
      `<text x="${width / 2}" y="${height / 2}" fill="${text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" text-anchor="middle">No data</text>`
    )
    parts.push('</svg>')
    return parts.join('')
  }

  const tir = calculateEnhancedTIR(clean)
  const zones = [
    { pct: tir.veryHigh.percentage, color: ZONE_COLORS.veryHigh, label: 'Very High' },
    { pct: tir.high.percentage, color: ZONE_COLORS.high, label: 'High' },
    { pct: tir.inRange.percentage, color: ZONE_COLORS.inRange, label: 'In Range' },
    { pct: tir.low.percentage, color: ZONE_COLORS.low, label: 'Low' },
    { pct: tir.veryLow.percentage, color: ZONE_COLORS.veryLow, label: 'Very Low' },
  ]

  const margin = { top: 16, bottom: 16 }
  const barX = 16
  const barW = 44
  const plotH = height - margin.top - margin.bottom
  const total = zones.reduce((s, z) => s + z.pct, 0)

  let y = margin.top
  for (const z of zones) {
    const h = (z.pct / total) * plotH
    const segH = Math.max(0, h - 2) // 2px surface gap between segments
    parts.push(
      `<rect x="${barX}" y="${Math.round(y * 10) / 10}" width="${barW}" height="${Math.round(segH * 10) / 10}" rx="2" fill="${z.color}"/>`
    )
    if (z.pct > 0) {
      parts.push(
        `<text x="${barX + barW + 8}" y="${Math.round((y + h / 2 + 3) * 10) / 10}" fill="${text}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" text-anchor="start">${z.label} ${z.pct}%</text>`
      )
    }
    y += h
  }

  parts.push('</svg>')
  return parts.join('')
}
