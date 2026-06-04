import { describe, it, expect } from 'vitest'
import {
  GlucoseIQError,
  ParseError,
  DomainError,
  EmptyDatasetError,
  TimestampError,
} from '../src/errors'
import { calculateEnhancedTIR, calculatePregnancyTIR } from '../src/tir-enhanced'
import { buildAGPProfile } from '../src/metrics/agp-profile'
import { calculateAGPMetrics } from '../src/metrics/agp'
import { calculateGRI } from '../src/metrics/gri'
import { parseGlucoseCSV } from '../src/csv'
import { parseGlucoseString } from '../src/glucose'
import { parseDexcomDate } from '../src/connectors/dexcom'
import { normalizeLibreEntry } from '../src/connectors/libre'

describe('error hierarchy', () => {
  it('subclasses carry stable codes and extend GlucoseIQError and Error', () => {
    const e = new DomainError('nope', 'INVALID_GLUCOSE_VALUE')
    expect(e).toBeInstanceOf(Error)
    expect(e).toBeInstanceOf(GlucoseIQError)
    expect(e).toBeInstanceOf(DomainError)
    expect(e.code).toBe('INVALID_GLUCOSE_VALUE')
    expect(e.message).toBe('nope')
    expect(e.name).toBe('DomainError')
  })
})

describe('typed throws across the library', () => {
  it('empty datasets throw EmptyDatasetError (messages preserved)', () => {
    expect(() => calculateEnhancedTIR([])).toThrow(EmptyDatasetError)
    expect(() => calculateEnhancedTIR([])).toThrow(
      'Cannot calculate Enhanced TIR: readings array is empty'
    )
    expect(() => calculatePregnancyTIR([])).toThrow(EmptyDatasetError)
    expect(() => calculateAGPMetrics([])).toThrow(EmptyDatasetError)
  })

  it('invalid values and options throw DomainError', () => {
    expect(() =>
      calculateEnhancedTIR([{ value: 900, unit: 'mg/dL', timestamp: '2024-01-01T00:00:00Z' }])
    ).toThrow(DomainError)
    expect(() => buildAGPProfile([], { binMinutes: 0 })).toThrow(DomainError)
    expect(() => buildAGPProfile([], { timeZone: 'Mars/Phobos' })).toThrow(DomainError)
    expect(() =>
      calculateGRI({ veryLowPercent: -1, lowPercent: 0, highPercent: 0, veryHighPercent: 0 })
    ).toThrow(DomainError)
  })

  it('parse failures throw ParseError', () => {
    expect(() => parseGlucoseCSV('a,b\n1,2', { timestampColumn: 'x', valueColumn: 'b' })).toThrow(
      ParseError
    )
    expect(() => parseGlucoseString('garbage')).toThrow(ParseError)
  })

  it('vendor timestamp failures throw TimestampError', () => {
    expect(() => parseDexcomDate('garbage')).toThrow(TimestampError)
    expect(() =>
      normalizeLibreEntry({ Value: 100, TrendArrow: 3, Timestamp: 'garbage' })
    ).toThrow(TimestampError)
  })
})
