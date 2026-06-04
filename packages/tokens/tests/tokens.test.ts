import { describe, it, expect } from 'vitest'
import {
  classifyGlucoseZone,
  zoneColor,
  cssVariables,
  GLUCOSE_ZONES,
  ZONE_PALETTE,
  TREND_GLYPHS,
  BRAND,
} from '../src'

describe('classifyGlucoseZone', () => {
  it('classifies the five consensus zones with correct boundaries', () => {
    expect(classifyGlucoseZone(40)).toBe('veryLow')
    expect(classifyGlucoseZone(53.9)).toBe('veryLow')
    expect(classifyGlucoseZone(54)).toBe('low')
    expect(classifyGlucoseZone(69.9)).toBe('low')
    expect(classifyGlucoseZone(70)).toBe('inRange')
    expect(classifyGlucoseZone(180)).toBe('inRange')
    expect(classifyGlucoseZone(180.1)).toBe('high')
    expect(classifyGlucoseZone(250)).toBe('high')
    expect(classifyGlucoseZone(250.1)).toBe('veryHigh')
  })
})

describe('palette', () => {
  it('provides a color for every zone in both themes', () => {
    for (const zone of GLUCOSE_ZONES) {
      expect(ZONE_PALETTE.dark[zone]).toMatch(/^#/)
      expect(ZONE_PALETTE.light[zone]).toMatch(/^#/)
    }
  })

  it('zoneColor defaults to dark and accepts light', () => {
    expect(zoneColor('inRange')).toBe(ZONE_PALETTE.dark.inRange)
    expect(zoneColor('veryLow', 'light')).toBe(ZONE_PALETTE.light.veryLow)
  })

  it('exposes brand colors', () => {
    expect(BRAND.black).toBe('#0a0a0a')
    expect(BRAND.drop).toMatch(/^#/)
  })
})

describe('trend glyphs', () => {
  it('covers all eight trend states', () => {
    expect(Object.keys(TREND_GLYPHS)).toHaveLength(8)
    expect(TREND_GLYPHS.flat).toBe('→')
    expect(TREND_GLYPHS.rapidRising).toBe('⇈')
    expect(TREND_GLYPHS.unknown).toBe('·')
  })
})

describe('cssVariables', () => {
  it('emits a CSS custom-property block for a theme', () => {
    const css = cssVariables('dark')
    expect(css).toContain('--giq-zone-inrange:')
    expect(css).toContain(ZONE_PALETTE.dark.inRange)
    expect(css).toContain('--giq-bg:')
  })

  it('defaults to dark', () => {
    expect(cssVariables()).toBe(cssVariables('dark'))
  })

  it('uses a white background in the light theme', () => {
    expect(cssVariables('light')).toContain('--giq-bg: #ffffff;')
  })
})
