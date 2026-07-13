import { describe, it, expect } from 'vitest'
import { agpChartToSVG } from '../src/render/agp-svg'
import { createGlucoseReadings } from './test-helpers'
import type { GlucoseReading } from '../src/types'

const rising = createGlucoseReadings(
  Array.from({ length: 24 }, (_, i) => 100 + i * 4),
  'mg/dL',
  5
)

describe('agpChartToSVG', () => {
  it('renders a self-contained SVG string with bands, median, and axes', () => {
    const svg = agpChartToSVG(rising)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('width="800"')
    expect(svg).toContain('height="320"')
    expect(svg).toContain('viewBox="0 0 800 320"')
    expect(svg).toContain('<path') // percentile bands
    expect(svg).toContain('<polyline') // median line
    expect(svg).toContain('12 PM') // static x-axis label
    expect(svg).toContain('#0a0a0a') // dark background (default/brand)
  })

  it('supports a light theme', () => {
    const svg = agpChartToSVG(rising, { theme: 'light' })
    expect(svg).toContain('#ffffff')
  })

  it('honors custom dimensions', () => {
    const svg = agpChartToSVG(rising, { width: 500, height: 200 })
    expect(svg).toContain('width="500"')
    expect(svg).toContain('viewBox="0 0 500 200"')
  })

  it('renders and XML-escapes a title', () => {
    const svg = agpChartToSVG(rising, { title: 'Mark & Co <AGP>' })
    expect(svg).toContain('Mark &amp; Co &lt;AGP&gt;')
  })

  it('renders a "No data" frame for empty input without a median line', () => {
    const svg = agpChartToSVG([])
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('No data')
    expect(svg).not.toContain('<polyline')
  })

  it('draws a run that reaches the final bin of the day', () => {
    const late: GlucoseReading[] = [
      { value: 130, unit: 'mg/dL', timestamp: '2024-01-01T23:50:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T23:55:00Z' },
    ]
    const svg = agpChartToSVG(late, { timeZone: 'UTC' })
    expect(svg).toContain('<path')
  })

  it('is deterministic for the same input', () => {
    expect(agpChartToSVG(rising)).toBe(agpChartToSVG(rising))
  })
})
