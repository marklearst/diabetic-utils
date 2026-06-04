import { describe, it, expect } from 'vitest'
import { generateCGMSeries, scenarios } from '../src'

describe('generateCGMSeries', () => {
  it('is deterministic for the same seed', () => {
    const a = generateCGMSeries({ seed: 7 })
    const b = generateCGMSeries({ seed: 7 })
    expect(a).toEqual(b)
  })

  it('differs across seeds', () => {
    const a = generateCGMSeries({ seed: 1 })
    const b = generateCGMSeries({ seed: 2 })
    expect(a.map((r) => r.value)).not.toEqual(b.map((r) => r.value))
  })

  it('produces days × 288 five-minute readings by default', () => {
    const r = generateCGMSeries({ days: 2 })
    expect(r).toHaveLength(576)
    expect(Date.parse(r[1].timestamp) - Date.parse(r[0].timestamp)).toBe(5 * 60000)
    expect(r[0].unit).toBe('mg/dL')
  })

  it('stays within physiological bounds', () => {
    const r = generateCGMSeries({ days: 3, seed: 99 })
    for (const x of r) {
      expect(x.value).toBeGreaterThanOrEqual(40)
      expect(x.value).toBeLessThanOrEqual(400)
    }
  })

  it('honors interval, start, and unit options', () => {
    const r = generateCGMSeries({ days: 1, intervalMin: 15, start: '2025-06-01T00:00:00Z', unit: 'mmol/L' })
    expect(r).toHaveLength(96)
    expect(r[0].timestamp).toBe('2025-06-01T00:00:00.000Z')
    expect(r[0].unit).toBe('mmol/L')
    expect(r[0].value).toBeLessThan(25) // mmol scale
  })

  it('injects nocturnal hypos on the requested days', () => {
    const r = generateCGMSeries({ days: 2, seed: 3, nocturnalHypoDays: [1] })
    const day1Night = r.filter((x) => {
      const d = new Date(x.timestamp)
      return d.getUTCDate() === 2 && d.getUTCHours() >= 2 && d.getUTCHours() < 4
    })
    expect(day1Night.some((x) => x.value < 70)).toBe(true)
  })
})

describe('scenarios', () => {
  it('steadyDay stays mostly in range', () => {
    const r = scenarios.steadyDay()
    const inRange = r.filter((x) => x.value >= 70 && x.value <= 180).length
    expect(inRange / r.length).toBeGreaterThan(0.9)
  })

  it('hypoNight contains sub-70 readings', () => {
    expect(scenarios.hypoNight().some((x) => x.value < 70)).toBe(true)
  })

  it('rollercoaster exceeds 180', () => {
    expect(scenarios.rollercoaster().some((x) => x.value > 180)).toBe(true)
  })

  it('gappyTrace has a >30-minute hole', () => {
    const r = scenarios.gappyTrace()
    let maxGap = 0
    for (let i = 1; i < r.length; i++) {
      maxGap = Math.max(maxGap, Date.parse(r[i].timestamp) - Date.parse(r[i - 1].timestamp))
    }
    expect(maxGap).toBeGreaterThan(30 * 60000)
  })
})
