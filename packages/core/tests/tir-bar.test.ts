import { describe, it, expect } from 'vitest'
import { tirBarToSVG } from '../src/render/tir-bar'
import { createGlucoseReadings } from './test-helpers'
import type { GlucoseReading } from '../src/types'

describe('tirBarToSVG', () => {
  it('renders a stacked TIR bar with zone colors and percent labels', () => {
    const svg = tirBarToSVG(createGlucoseReadings([100, 120, 140, 160, 150], 'mg/dL', 5))
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true)
    expect(svg).toContain('#22c55e') // in-range green
    expect(svg).toContain('100%')
  })

  it('shows all five zones for a spread of values, ignoring invalid readings', () => {
    const readings: GlucoseReading[] = [
      ...createGlucoseReadings([50, 60, 120, 200, 300], 'mg/dL', 5),
      { value: NaN, unit: 'mg/dL', timestamp: '2024-01-01T09:00:00Z' },
      { value: -5, unit: 'mg/dL', timestamp: '2024-01-01T09:05:00Z' },
      { value: 700, unit: 'mg/dL', timestamp: '2024-01-01T09:10:00Z' },
      { value: 120, unit: 'mg/dL', timestamp: 'bad-timestamp' },
    ]
    const svg = tirBarToSVG(readings)
    expect(svg).toContain('#b91c1c') // very low
    expect(svg).toContain('#f87171') // low
    expect(svg).toContain('#22c55e') // in range
    expect(svg).toContain('#fbbf24') // high
    expect(svg).toContain('#f97316') // very high
    expect(svg).toContain('20%')
  })

  it('accepts mmol/L input', () => {
    const svg = tirBarToSVG([
      { value: 5.5, unit: 'mmol/L', timestamp: '2024-01-01T08:00:00Z' },
      { value: 6.0, unit: 'mmol/L', timestamp: '2024-01-01T08:05:00Z' },
    ])
    expect(svg).toContain('#22c55e') // ~99 and ~108 mg/dL are in range
  })

  it('renders a "No data" frame for empty input', () => {
    const svg = tirBarToSVG([])
    expect(svg).toContain('No data')
  })

  it('honors custom dimensions and light theme', () => {
    const svg = tirBarToSVG(createGlucoseReadings([100, 120]), {
      width: 200,
      height: 400,
      theme: 'light',
    })
    expect(svg).toContain('viewBox="0 0 200 400"')
    expect(svg).toContain('#ffffff')
  })
})
