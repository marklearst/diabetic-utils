import { describe, it, expect } from 'vitest'
import { detectEpisodes } from '../src/metrics/episodes'
import { createGlucoseReadings } from './test-helpers'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'
import type { GlucoseReading } from '../src/types'

describe('detectEpisodes', () => {
  it('detects a Level 1 hypoglycemia event of at least 15 minutes', () => {
    const readings = createGlucoseReadings([100, 65, 60, 62, 68, 100, 110], 'mg/dL', 5)
    const { hypoEvents } = detectEpisodes(readings)
    expect(hypoEvents).toHaveLength(1)
    expect(hypoEvents[0].type).toBe('hypo')
    expect(hypoEvents[0].level).toBe(1)
    expect(hypoEvents[0].durationMinutes).toBe(15)
    expect(hypoEvents[0].extremeValue).toBe(60)
    expect(hypoEvents[0].readingCount).toBe(4)
  })

  it('classifies a hypo event with any reading <54 as Level 2', () => {
    const readings = createGlucoseReadings([100, 65, 50, 60, 68, 100], 'mg/dL', 5)
    expect(detectEpisodes(readings).hypoEvents[0].level).toBe(2)
  })

  it('does not report a dip shorter than the minimum duration', () => {
    const readings = createGlucoseReadings([100, 65, 60, 100], 'mg/dL', 5)
    expect(detectEpisodes(readings).hypoEvents).toHaveLength(0)
  })

  it('merges excursions separated by a brief (<15 min) recovery', () => {
    const readings = createGlucoseReadings([60, 60, 100, 60, 60], 'mg/dL', 5)
    const { hypoEvents } = detectEpisodes(readings)
    expect(hypoEvents).toHaveLength(1)
    expect(hypoEvents[0].durationMinutes).toBe(20)
  })

  it('splits excursions separated by a sustained (>=15 min) recovery', () => {
    const readings = createGlucoseReadings(
      [60, 60, 60, 60, 100, 100, 100, 100, 60, 60, 60, 60],
      'mg/dL',
      5
    )
    expect(detectEpisodes(readings).hypoEvents).toHaveLength(2)
  })

  it('detects a Level 1 hyperglycemia event', () => {
    const readings = createGlucoseReadings([120, 200, 210, 205, 190, 120], 'mg/dL', 5)
    const { hyperEvents } = detectEpisodes(readings)
    expect(hyperEvents).toHaveLength(1)
    expect(hyperEvents[0].type).toBe('hyper')
    expect(hyperEvents[0].level).toBe(1)
    expect(hyperEvents[0].extremeValue).toBe(210)
  })

  it('classifies a hyper event >250 as Level 2 and summarizes totals', () => {
    const readings = createGlucoseReadings([120, 200, 260, 210, 190, 120], 'mg/dL', 5)
    const res = detectEpisodes(readings)
    expect(res.hyperEvents[0].level).toBe(2)
    expect(res.summary.hyperCount).toBe(1)
    expect(res.summary.hyperLevel2Count).toBe(1)
    expect(res.summary.totalHyperMinutes).toBe(15)
    expect(res.summary.hypoCount).toBe(0)
  })

  it('returns empty results and zeroed summary when there are no episodes', () => {
    const res = detectEpisodes([])
    expect(res.hypoEvents).toHaveLength(0)
    expect(res.hyperEvents).toHaveLength(0)
    expect(res.summary).toEqual({
      hypoCount: 0,
      hyperCount: 0,
      hypoLevel2Count: 0,
      hyperLevel2Count: 0,
      totalHypoMinutes: 0,
      totalHyperMinutes: 0,
    })
  })

  it('normalizes mmol/L input and ignores invalid readings', () => {
    const mgdl = createGlucoseReadings([100, 65, 60, 62, 68, 100], 'mg/dL', 5)
    const dirty: GlucoseReading[] = [
      ...mgdl.map((r) => ({
        value: r.value / MGDL_MMOLL_CONVERSION,
        unit: 'mmol/L' as const,
        timestamp: r.timestamp,
      })),
      { value: NaN, unit: 'mmol/L', timestamp: mgdl[0].timestamp },
      { value: 5, unit: 'mmol/L', timestamp: 'not-a-date' },
    ]
    const res = detectEpisodes(dirty)
    expect(res.hypoEvents).toHaveLength(1)
    expect(res.hypoEvents[0].extremeValue).toBe(60)
  })

  it('honors custom thresholds and durations', () => {
    const readings = createGlucoseReadings([100, 75, 70, 72, 100], 'mg/dL', 5)
    const res = detectEpisodes(readings, {
      hypoThreshold: 80,
      hypoLevel2: 60,
      hyperThreshold: 160,
      hyperLevel2: 240,
      minDurationMin: 10,
      endDurationMin: 10,
      unit: 'mg/dL',
    })
    expect(res.hypoEvents).toHaveLength(1)
    expect(res.hypoEvents[0].durationMinutes).toBe(10)
    expect(res.hypoEvents[0].level).toBe(1)
  })
})
