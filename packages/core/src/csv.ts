/**
 * @file src/csv.ts
 *
 * Generic CSV → glucose readings parser. Point it at any CGM export (Dexcom
 * Clarity, LibreView, Nightscout, Tidepool, …) by naming the timestamp and
 * value columns; it handles quoted fields, custom delimiters, and skips rows
 * that don't parse. Pure, dependency-free, and format-agnostic (no fragile
 * hard-coded vendor layouts).
 */

import type { GlucoseReading, GlucoseUnit } from './types'
import { MG_DL } from './constants'
import { ParseError } from './errors'

/** Options for {@link parseGlucoseCSV}. */
export interface CSVParseOptions {
  /** Header name of the timestamp column. */
  readonly timestampColumn: string
  /** Header name of the glucose value column. */
  readonly valueColumn: string
  /** Unit of the values (default 'mg/dL'). */
  readonly unit?: GlucoseUnit
  /** Field delimiter (default ','). */
  readonly delimiter?: string
}

/** Parses a single CSV line into fields, honoring quotes and escaped quotes. @internal */
function parseLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      fields.push(field)
      field = ''
    } else {
      field += ch
    }
  }
  fields.push(field)
  return fields
}

/** Safely reads and trims a cell, tolerating short rows. @internal */
function cell(fields: string[], index: number): string {
  return (fields[index] ?? '').trim()
}

/**
 * Parses CSV text into glucose readings.
 *
 * @param text - The CSV document
 * @param options - Column names, unit, and delimiter
 * @returns Parsed readings (rows with an unparseable value or timestamp are skipped)
 * @throws {Error} If a named column is not present in the header
 *
 * @example
 * ```ts
 * const readings = parseGlucoseCSV(csv, {
 *   timestampColumn: 'Timestamp (YYYY-MM-DDThh:mm:ss)',
 *   valueColumn: 'Glucose Value (mg/dL)',
 * })
 * ```
 *
 * @category IO
 * @public
 */
export function parseGlucoseCSV(text: string, options: CSVParseOptions): GlucoseReading[] {
  const unit = options.unit ?? MG_DL
  const delimiter = options.delimiter ?? ','

  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length < 2) return []

  const header = parseLine(lines[0], delimiter).map((h) => h.trim())
  const tsIdx = header.indexOf(options.timestampColumn)
  const valIdx = header.indexOf(options.valueColumn)
  if (tsIdx === -1 || valIdx === -1) {
    throw new ParseError(
      `parseGlucoseCSV: column not found (timestamp="${options.timestampColumn}", value="${options.valueColumn}")`,
      'CSV_COLUMN_NOT_FOUND'
    )
  }

  const readings: GlucoseReading[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i], delimiter)
    const value = Number(cell(cols, valIdx))
    if (!Number.isFinite(value) || value <= 0) continue
    const ms = Date.parse(cell(cols, tsIdx))
    if (Number.isNaN(ms)) continue
    readings.push({ value, unit, timestamp: new Date(ms).toISOString() })
  }
  return readings
}
