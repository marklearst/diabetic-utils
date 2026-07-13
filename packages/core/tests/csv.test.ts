import { describe, it, expect } from 'vitest'
import { parseGlucoseCSV } from '../src/csv'

describe('parseGlucoseCSV', () => {
  it('parses a simple CSV into readings with ISO timestamps', () => {
    const csv = `Timestamp,Glucose Value (mg/dL)
2024-01-01T08:00:00Z,120
2024-01-01T08:05:00Z,135`
    const readings = parseGlucoseCSV(csv, {
      timestampColumn: 'Timestamp',
      valueColumn: 'Glucose Value (mg/dL)',
    })
    expect(readings).toEqual([
      { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00.000Z' },
      { value: 135, unit: 'mg/dL', timestamp: '2024-01-01T08:05:00.000Z' },
    ])
  })

  it('handles quoted fields with commas and escaped quotes', () => {
    const csv = `"Time, local","Value"
"2024-01-01T08:00:00Z","120"
"has ""quote""","150"`
    const readings = parseGlucoseCSV(csv, {
      timestampColumn: 'Time, local',
      valueColumn: 'Value',
    })
    // second row's timestamp is not a date → skipped
    expect(readings).toHaveLength(1)
    expect(readings[0].value).toBe(120)
  })

  it('skips rows with a non-numeric or non-positive value', () => {
    const csv = `t,v
2024-01-01T08:00:00Z,120
2024-01-01T08:05:00Z,Low
2024-01-01T08:10:00Z,-5
2024-01-01T08:15:00Z,140`
    const readings = parseGlucoseCSV(csv, { timestampColumn: 't', valueColumn: 'v' })
    expect(readings.map((r) => r.value)).toEqual([120, 140])
  })

  it('supports mmol/L and a custom delimiter', () => {
    const csv = `t\tv
2024-01-01T08:00:00Z\t5.5
2024-01-01T08:05:00Z\t6.1`
    const readings = parseGlucoseCSV(csv, {
      timestampColumn: 't',
      valueColumn: 'v',
      unit: 'mmol/L',
      delimiter: '\t',
    })
    expect(readings).toHaveLength(2)
    expect(readings[0]).toEqual({
      value: 5.5,
      unit: 'mmol/L',
      timestamp: '2024-01-01T08:00:00.000Z',
    })
  })

  it('throws when a named column is missing', () => {
    const csv = `a,b\n1,2`
    expect(() =>
      parseGlucoseCSV(csv, { timestampColumn: 'missing', valueColumn: 'b' })
    ).toThrow(/column/i)
  })

  it('tolerates rows with missing columns', () => {
    const csv = `t,v
2024-01-01T08:00:00Z,120
2024-01-01T08:05:00Z
,140`
    const readings = parseGlucoseCSV(csv, { timestampColumn: 't', valueColumn: 'v' })
    expect(readings).toHaveLength(1)
    expect(readings[0].value).toBe(120)
  })

  it('returns an empty array for header-only or empty input', () => {
    expect(parseGlucoseCSV('t,v', { timestampColumn: 't', valueColumn: 'v' })).toEqual([])
    expect(parseGlucoseCSV('', { timestampColumn: 't', valueColumn: 'v' })).toEqual([])
  })
})
