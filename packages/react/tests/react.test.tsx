import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, renderHook, cleanup, act } from '@testing-library/react'
import {
  useGlucoseAnalysis,
  useAGPProfile,
  useGlucoseIQScore,
  useMealResponse,
  useGlucoseLive,
  AgpChart,
  TirBar,
  TrendTile,
} from '../src'
import type { GlucoseReading } from '@glucoseiq/core'

afterEach(cleanup)

const base = Date.UTC(2024, 0, 1, 8, 0, 0)
const mk = (values: number[], stepMin = 5): GlucoseReading[] =>
  values.map((v, i) => ({
    value: v,
    unit: 'mg/dL',
    timestamp: new Date(base + i * stepMin * 60000).toISOString(),
  }))

const readings = mk([100, 110, 120, 130, 140, 150, 145, 135, 125, 115])

describe('analysis hooks', () => {
  it('useGlucoseAnalysis returns the full report and memoizes on identity', () => {
    const { result, rerender } = renderHook(({ r }) => useGlucoseAnalysis(r), {
      initialProps: { r: readings },
    })
    expect(result.current.valid).toBe(true)
    expect(result.current.timeInRange?.inRange.percentage).toBe(100)
    const first = result.current
    rerender({ r: readings })
    expect(result.current).toBe(first) // same identity → memo hit
  })

  it('useAGPProfile returns the band series', () => {
    const { result } = renderHook(() => useAGPProfile(readings, { binMinutes: 60 }))
    expect(result.current.bins).toHaveLength(24)
  })

  it('useGlucoseIQScore returns the 0-100 score', () => {
    const { result } = renderHook(() => useGlucoseIQScore(readings))
    expect(result.current.score).toBe(100)
    expect(result.current.rating).toBe('excellent')
  })

  it('useMealResponse analyzes a meal window', () => {
    const { result } = renderHook(() =>
      useMealResponse(readings, new Date(base).toISOString())
    )
    expect(result.current.valid).toBe(true)
    expect(result.current.peakValue).toBe(150)
  })
})

describe('useGlucoseLive', () => {
  it('returns latest reading, trend, and staleness', () => {
    const { result } = renderHook(() => useGlucoseLive(readings))
    expect(result.current.latest?.value).toBe(115)
    expect(result.current.trend.trend).toBeDefined()
    expect(result.current.minutesSince).toBeGreaterThan(0)
  })

  it('re-evaluates staleness on the refresh interval', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useGlucoseLive(readings, { refreshMs: 1000 }))
    const before = result.current.minutesSince!
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(result.current.minutesSince!).toBeGreaterThan(before)
    vi.useRealTimers()
  })

  it('handles empty readings', () => {
    const { result } = renderHook(() => useGlucoseLive([]))
    expect(result.current.latest).toBeNull()
    expect(result.current.minutesSince).toBeNull()
    expect(result.current.trend.trend).toBe('unknown')
  })
})

describe('chart components', () => {
  it('AgpChart renders an inline SVG with className/style passthrough', () => {
    const { container } = render(
      <AgpChart readings={readings} className="agp" style={{ width: 400 }} />
    )
    const div = container.firstElementChild as HTMLElement
    expect(div.className).toBe('agp')
    expect(div.querySelector('svg')).not.toBeNull()
  })

  it('TirBar renders the zone bar', () => {
    const { container } = render(<TirBar readings={readings} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('TrendTile renders the current value', () => {
    const { container } = render(<TrendTile readings={readings} />)
    expect(container.innerHTML).toContain('115')
  })

  it('components accept renderer options', () => {
    const { container } = render(
      <AgpChart readings={readings} options={{ theme: 'light', width: 500 }} />
    )
    expect(container.innerHTML).toContain('#ffffff')
    expect(container.innerHTML).toContain('width="500"')
  })
})
