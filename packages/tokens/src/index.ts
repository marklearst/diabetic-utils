/**
 * @glucoseiq/tokens — the canonical GlucoseIQ design tokens.
 *
 * One glucose-zone model (per the 2019 international consensus), one palette
 * (dark-first, colorblind-safe by redundancy — always pair color with a label
 * or position), one trend-glyph set. Shared by web, watch, native, and the
 * zero-dependency SVG renderers so every surface reads identically.
 *
 * Zero runtime dependencies.
 */

/** The five consensus glucose zones. */
export type GlucoseZone = 'veryLow' | 'low' | 'inRange' | 'high' | 'veryHigh'

/** All zones, severity-ordered low → high. */
export const GLUCOSE_ZONES: readonly GlucoseZone[] = [
  'veryLow',
  'low',
  'inRange',
  'high',
  'veryHigh',
] as const

/** Zone thresholds in mg/dL (Battelino 2019): <54, 54–69, 70–180, >180–250, >250. */
export const ZONE_THRESHOLDS_MGDL = {
  veryLowMax: 54, // exclusive
  lowMax: 70, // exclusive
  inRangeMax: 180, // inclusive
  highMax: 250, // inclusive
} as const

/**
 * Classifies a glucose value (mg/dL) into its consensus zone.
 */
export function classifyGlucoseZone(mgdl: number): GlucoseZone {
  if (mgdl < ZONE_THRESHOLDS_MGDL.veryLowMax) return 'veryLow'
  if (mgdl < ZONE_THRESHOLDS_MGDL.lowMax) return 'low'
  if (mgdl <= ZONE_THRESHOLDS_MGDL.inRangeMax) return 'inRange'
  if (mgdl <= ZONE_THRESHOLDS_MGDL.highMax) return 'high'
  return 'veryHigh'
}

/** Theme name. */
export type Theme = 'dark' | 'light'

/** Zone → hex color, per theme. Dark is the brand default (pure-black canvas). */
export const ZONE_PALETTE: Record<Theme, Record<GlucoseZone, string>> = {
  dark: {
    veryLow: '#b91c1c',
    low: '#f87171',
    inRange: '#22c55e',
    high: '#fbbf24',
    veryHigh: '#f97316',
  },
  light: {
    veryLow: '#991b1b',
    low: '#dc2626',
    inRange: '#16a34a',
    high: '#d97706',
    veryHigh: '#ea580c',
  },
} as const

/** Core brand colors. */
export const BRAND = {
  /** Pure-black canvas. */
  black: '#0a0a0a',
  /** The red blood-drop accent. */
  drop: '#ef4444',
  /** Panel surface on black. */
  surface: '#111318',
  /** Hairline border on black. */
  border: '#1e232c',
  /** Muted text on black. */
  muted: '#94a3b8',
} as const

/** Trend state → glyph (mirrors the CGMTrend union in @glucoseiq/core). */
export const TREND_GLYPHS = {
  rapidRising: '⇈',
  rising: '↑',
  slightlyRising: '↗',
  flat: '→',
  slightlyFalling: '↘',
  falling: '↓',
  rapidFalling: '⇊',
  unknown: '·',
} as const

/** Trend key type. */
export type TrendKey = keyof typeof TREND_GLYPHS

/**
 * Returns the color for a zone in a theme (default 'dark').
 */
export function zoneColor(zone: GlucoseZone, theme: Theme = 'dark'): string {
  return ZONE_PALETTE[theme][zone]
}

/**
 * Emits the tokens as a CSS custom-property block, e.g. for a `:root` rule.
 *
 * @example
 * ```ts
 * const style = `:root { ${cssVariables('dark')} }`
 * ```
 */
export function cssVariables(theme: Theme = 'dark'): string {
  const zones = GLUCOSE_ZONES.map(
    (z) => `--giq-zone-${z.toLowerCase()}: ${ZONE_PALETTE[theme][z]};`
  ).join(' ')
  const bg = theme === 'dark' ? BRAND.black : '#ffffff'
  return `${zones} --giq-bg: ${bg}; --giq-drop: ${BRAND.drop}; --giq-surface: ${BRAND.surface}; --giq-border: ${BRAND.border}; --giq-muted: ${BRAND.muted};`
}
