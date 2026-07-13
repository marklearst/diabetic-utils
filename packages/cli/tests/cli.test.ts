import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { run, type CliIO } from '../src'

function makeIO(): CliIO & { outLines: string[]; errLines: string[] } {
  const outLines: string[] = []
  const errLines: string[] = []
  return {
    outLines,
    errLines,
    out: (l) => outLines.push(l),
    err: (l) => errLines.push(l),
  }
}

let dir: string
let csvPath: string

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'giq-cli-'))
  csvPath = join(dir, 'data.csv')
  const rows = ['Timestamp,Glucose Value (mg/dL)']
  const base = Date.UTC(2024, 0, 1, 0, 0, 0)
  for (let i = 0; i < 288; i++) {
    const v = Math.round(110 + 30 * Math.sin(i / 12))
    rows.push(`${new Date(base + i * 5 * 60000).toISOString()},${v}`)
  }
  writeFileSync(csvPath, rows.join('\n'))
})

describe('glucoseiq CLI', () => {
  it('prints help with --help (exit 0) and with no args (exit 1)', () => {
    const io1 = makeIO()
    expect(run(['--help'], io1)).toBe(0)
    expect(io1.outLines.join('\n')).toContain('Usage:')
    const io2 = makeIO()
    expect(run([], io2)).toBe(1)
  })

  it('rejects unknown commands', () => {
    const io = makeIO()
    expect(run(['frobnicate', 'x.csv'], io)).toBe(1)
    expect(io.errLines[0]).toMatch(/Unknown command/)
  })

  it('errors cleanly on a missing file', () => {
    const io = makeIO()
    expect(run(['report', join(dir, 'nope.csv')], io)).toBe(1)
    expect(io.errLines[0]).toMatch(/Cannot read file/)
  })

  it('errors cleanly on a bad column name', () => {
    const io = makeIO()
    expect(run(['report', csvPath, '--value-col', 'Missing'], io)).toBe(1)
    expect(io.errLines[0]).toMatch(/column not found/)
  })

  it('errors when the file has no valid readings', () => {
    const empty = join(dir, 'empty.csv')
    writeFileSync(empty, 'Timestamp,Glucose Value (mg/dL)\nbad,not-a-number')
    const io = makeIO()
    expect(run(['report', empty], io)).toBe(1)
    expect(io.errLines[0]).toMatch(/No valid readings/)
  })

  it('prints a human report with metrics and disclaimer', () => {
    const io = makeIO()
    expect(run(['report', csvPath], io)).toBe(0)
    const text = io.outLines.join('\n')
    expect(text).toContain('GlucoseIQ report')
    expect(text).toContain('Glucose IQ')
    expect(text).toContain('Time in range')
    expect(text).toContain('not medical advice')
  })

  it('emits JSON with --json', () => {
    const io = makeIO()
    expect(run(['report', csvPath, '--json'], io)).toBe(0)
    const parsed = JSON.parse(io.outLines.join('\n'))
    expect(parsed.report.valid).toBe(true)
    expect(parsed.glucoseIQ.score).toBeGreaterThan(0)
  })

  it('writes the AGP SVG with --agp-svg and honors --timezone', () => {
    const out = join(dir, 'agp.svg')
    const io = makeIO()
    expect(run(['report', csvPath, '--agp-svg', out, '--timezone', 'America/New_York'], io)).toBe(0)
    expect(existsSync(out)).toBe(true)
    expect(readFileSync(out, 'utf8')).toContain('<svg')
    expect(io.outLines.at(-1)).toContain('AGP chart written')

    // and without an explicit timezone (default UTC path)
    const out2 = join(dir, 'agp-utc.svg')
    const io2 = makeIO()
    expect(run(['report', csvPath, '--agp-svg', out2], io2)).toBe(0)
    expect(existsSync(out2)).toBe(true)
  })
})
