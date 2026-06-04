import { describe, it, expect } from 'vitest'
import { alignToGrid } from '../src/align'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

const base = Date.UTC(2024, 0, 1, 8, 0, 0)
const at = (min: number, value: number): GlucoseReading => ({
  value,
  unit: 'mg/dL',
  timestamp: new Date(base + min * 60000).toISOString(),
})

describe('alignToGrid', () => {
  it('passes through readings already on the grid', () => {
    const grid = alignToGrid(createGlucoseReadings([100, 110, 120], 'mg/dL', 5))
    expect(grid).toHaveLength(3)
    expect(grid.map((g) => g.value)).toEqual([100, 110, 120])
    expect(grid.every((g) => g.interpolated === false)).toBe(true)
  })

  it('snaps off-grid readings to the nearest slot', () => {
    const grid = alignToGrid([at(0, 100), at(4.5, 110), at(10.2, 120)])
    expect(grid.map((g) => g.value)).toEqual([100, 110, 120])
    expect(grid[1].timestamp).toBe(at(5, 0).timestamp)
  })

  it('picks the nearer reading when two candidates flank one slot', () => {
    // slot at 5 min: 3.5 min is 1.5 away, 6 min is 1.0 away → 120 wins
    const grid = alignToGrid([at(0, 100), at(3.5, 110), at(6, 120), at(10, 130)])
    const slot5 = grid.find((g) => g.timestamp === at(5, 0).timestamp)!
    expect(slot5.value).toBe(120)
    expect(slot5.interpolated).toBe(false)

    // mirrored: 4 min is 1.0 away, 6.6 min is 1.6 away → 110 wins
    const grid2 = alignToGrid([at(0, 100), at(4, 110), at(6.6, 120), at(10, 130)])
    expect(grid2.find((g) => g.timestamp === at(5, 0).timestamp)!.value).toBe(110)
  })

  it('linearly interpolates slots inside a small gap and flags them', () => {
    const grid = alignToGrid([at(0, 100), at(10, 120)])
    expect(grid).toHaveLength(3)
    expect(grid[1].value).toBe(110)
    expect(grid[1].interpolated).toBe(true)
    expect(grid[0].interpolated).toBe(false)
  })

  it('leaves holes across gaps larger than maxInterpolateGapMin', () => {
    const grid = alignToGrid([at(0, 100), at(60, 120)])
    expect(grid).toHaveLength(2) // no slots invented across the hour
  })

  it('honors a custom interval and interpolation window', () => {
    const grid = alignToGrid([at(0, 100), at(30, 130)], {
      intervalMin: 15,
      maxInterpolateGapMin: 45,
    })
    expect(grid).toHaveLength(3)
    expect(grid[1].value).toBe(115)
    expect(grid[1].interpolated).toBe(true)
  })

  it('normalizes mmol/L and can emit mmol/L', () => {
    const readings = createGlucoseReadings([100, 110], 'mg/dL', 5).map((r) => ({
      value: r.value / MGDL_MMOLL_CONVERSION,
      unit: 'mmol/L' as const,
      timestamp: r.timestamp,
    }))
    const grid = alignToGrid(readings, { unit: 'mmol/L' })
    expect(grid[0].value).toBe(5.5) // 100 mg/dL = 5.55 → 5.5 at 1dp
  })

  it('returns [] for fewer than two valid readings', () => {
    expect(alignToGrid([])).toEqual([])
    expect(alignToGrid([at(0, 100)])).toEqual([])
    expect(
      alignToGrid([
        { value: NaN, unit: 'mg/dL', timestamp: at(0, 0).timestamp },
        { value: 100, unit: 'mg/dL', timestamp: 'bad' },
      ])
    ).toEqual([])
  })
})
