import { describe, it, expect } from 'vitest'
import { trendTileToSVG } from '../src/render/trend-tile'
import { createGlucoseReadings } from './test-helpers'

describe('trendTileToSVG', () => {
  it('renders an in-range reading with a trend arrow', () => {
    const svg = trendTileToSVG(createGlucoseReadings([100, 110, 120], 'mg/dL', 5))
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('120')
    expect(svg).toContain('IN RANGE')
    expect(svg).toContain('#22c55e')
  })

  it('renders a low reading in red', () => {
    const svg = trendTileToSVG(createGlucoseReadings([60, 58, 55], 'mg/dL', 5))
    expect(svg).toContain('55')
    expect(svg).toContain('LOW')
    expect(svg).toContain('#ef4444')
  })

  it('renders a high reading in amber', () => {
    const svg = trendTileToSVG(createGlucoseReadings([190, 200, 210], 'mg/dL', 5))
    expect(svg).toContain('210')
    expect(svg).toContain('HIGH')
    expect(svg).toContain('#fbbf24')
  })

  it('renders a single reading with an unknown trend', () => {
    const svg = trendTileToSVG(createGlucoseReadings([120]))
    expect(svg).toContain('120')
  })

  it('renders a "No data" frame for empty input', () => {
    expect(trendTileToSVG([])).toContain('No data')
  })

  it('honors custom dimensions and light theme', () => {
    const svg = trendTileToSVG(createGlucoseReadings([100, 110]), {
      width: 300,
      height: 180,
      theme: 'light',
    })
    expect(svg).toContain('viewBox="0 0 300 180"')
    expect(svg).toContain('#ffffff')
  })
})
