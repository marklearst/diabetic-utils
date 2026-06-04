import { describe, it, expect } from 'vitest'
import { detectGaps, splitDayNight } from '../src/timeseries'
import { createGlucoseReadings } from './test-helpers'
import type { GlucoseReading } from '../src/types'

const at = (isoMin: number, value = 100): GlucoseReading => ({
  value,
  unit: 'mg/dL',
  timestamp: new Date(Date.UTC(2024, 0, 1, 0, 0, 0) + isoMin * 60000).toISOString(),
})

describe('detectGaps', () => {
  it('finds no gaps in evenly-spaced readings', () => {
    expect(detectGaps(createGlucoseReadings([100, 100, 100, 100], 'mg/dL', 5))).toEqual([])
  })

  it('reports a gap when readings are more than maxGap apart', () => {
    const gaps = detectGaps([at(0), at(5), at(60), at(65)])
    expect(gaps).toHaveLength(1)
    expect(gaps[0].durationMinutes).toBe(55)
    expect(gaps[0].start).toBe(at(5).timestamp)
    expect(gaps[0].end).toBe(at(60).timestamp)
  })

  it('honors a custom maxGap and ignores invalid timestamps', () => {
    const readings: GlucoseReading[] = [at(0), { value: 100, unit: 'mg/dL', timestamp: 'bad' }, at(20)]
    expect(detectGaps(readings, { maxGapMinutes: 30 })).toEqual([]) // 20 min < 30
    expect(detectGaps(readings, { maxGapMinutes: 10 })).toHaveLength(1) // 20 min > 10
  })

  it('returns no gaps for fewer than two valid readings', () => {
    expect(detectGaps([at(0)])).toEqual([])
  })
})

describe('splitDayNight', () => {
  it('splits readings into day and night by local hour', () => {
    // 03:00 UTC = night (00–06), 12:00 UTC = day
    const night = at(180) // 03:00
    const day = at(720) // 12:00
    const res = splitDayNight([night, day])
    expect(res.night).toContain(night)
    expect(res.day).toContain(day)
  })

  it('shifts classification by time zone', () => {
    // 05:00 UTC is night in UTC but 00:00 in UTC+? — use a positive offset zone
    const r = at(300) // 05:00 UTC
    expect(splitDayNight([r]).night).toContain(r) // night in UTC
    // In Asia/Kolkata (+5:30) 05:00 UTC = 10:30 local → day
    expect(splitDayNight([r], { timeZone: 'Asia/Kolkata' }).day).toContain(r)
  })

  it('supports a wrap-around night window (22:00–06:00)', () => {
    const late = at(1380) // 23:00 → night (via start)
    const early = at(180) // 03:00 → night (via end)
    const noon = at(720) // 12:00 → day
    const res = splitDayNight([late, early, noon], { nightStartHour: 22, nightEndHour: 6 })
    expect(res.night).toContain(late)
    expect(res.night).toContain(early)
    expect(res.day).toContain(noon)
  })

  it('skips readings with unparseable timestamps', () => {
    const bad: GlucoseReading = { value: 100, unit: 'mg/dL', timestamp: 'nope' }
    const res = splitDayNight([bad, at(720)])
    expect(res.day).toHaveLength(1)
    expect(res.night).toHaveLength(0)
  })

  it('throws on an invalid time zone', () => {
    expect(() => splitDayNight([at(0)], { timeZone: 'Mars/Phobos' })).toThrow()
  })
})
