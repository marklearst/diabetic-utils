/**
 * @glucoseiq/cli — zero-code CGM analysis from the terminal.
 *
 *   npx @glucoseiq/cli report data.csv --timestamp-col Timestamp --value-col "Glucose Value (mg/dL)"
 *
 * The `run` function is the whole CLI (the bin is a two-line shim), so it is
 * fully unit-testable with injected IO.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import {
  parseGlucoseCSV,
  analyzeGlucose,
  glucoseIQScore,
  agpChartToSVG,
  type GlucoseUnit,
} from '@glucoseiq/core'

/** Injected IO so tests can capture output. */
export interface CliIO {
  out(line: string): void
  err(line: string): void
}

const HELP = `glucoseiq — zero-code CGM analysis (powered by @glucoseiq/core)

Usage:
  glucoseiq report <file.csv> [options]

Options:
  --timestamp-col <name>   CSV column holding ISO timestamps (default "Timestamp")
  --value-col <name>       CSV column holding glucose values (default "Glucose Value (mg/dL)")
  --unit <mg/dL|mmol/L>    Unit of the values (default mg/dL)
  --delimiter <char>       Field delimiter (default ",")
  --timezone <IANA>        Time zone for the AGP profile (default UTC)
  --json                   Emit the full report as JSON
  --agp-svg <out.svg>      Also write the AGP chart as a self-contained SVG
  --help                   Show this help

Informational only — not medical advice.`

/** Parses --flag value pairs and positionals. @internal */
function parseArgs(argv: string[]): { positionals: string[]; flags: Map<string, string | true> } {
  const positionals: string[] = []
  const flags = new Map<string, string | true>()
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const name = arg.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags.set(name, next)
        i++
      } else {
        flags.set(name, true)
      }
    } else {
      positionals.push(arg)
    }
  }
  return { positionals, flags }
}

/**
 * Runs the CLI. Returns a process exit code.
 */
export function run(argv: string[], io: CliIO): number {
  const { positionals, flags } = parseArgs(argv)

  if (flags.has('help') || positionals.length === 0) {
    io.out(HELP)
    return positionals.length === 0 && !flags.has('help') ? 1 : 0
  }

  const [command, file] = positionals
  if (command !== 'report' || !file) {
    io.err(`Unknown command: ${positionals.join(' ')} (try --help)`)
    return 1
  }

  let text: string
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    io.err(`Cannot read file: ${file}`)
    return 1
  }

  let readings
  try {
    readings = parseGlucoseCSV(text, {
      timestampColumn: String(flags.get('timestamp-col') ?? 'Timestamp'),
      valueColumn: String(flags.get('value-col') ?? 'Glucose Value (mg/dL)'),
      unit: (flags.get('unit') as GlucoseUnit | undefined) ?? 'mg/dL',
      delimiter: String(flags.get('delimiter') ?? ','),
    })
  } catch (err) {
    /* c8 ignore next -- parseGlucoseCSV only throws Error subclasses; String(err) is a defensive fallback */
    const message = err instanceof Error ? err.message : String(err)
    io.err(message)
    return 1
  }

  const timeZone = flags.get('timezone')
  const report = analyzeGlucose(readings, {
    timeZone: typeof timeZone === 'string' ? timeZone : undefined,
  })
  if (!report.valid) {
    io.err('No valid readings found in the file.')
    return 1
  }
  const iq = glucoseIQScore(readings)

  if (flags.has('json')) {
    io.out(JSON.stringify({ report, glucoseIQ: iq }, null, 2))
  } else {
    const tir = report.timeInRange!
    io.out('GlucoseIQ report')
    io.out('────────────────────────────────')
    io.out(`Readings        ${report.dataSufficiency.totalReadings} over ${report.dataSufficiency.daysOfData} days`)
    io.out(`Glucose IQ      ${iq.score} (${iq.rating}, zone ${iq.zone})`)
    io.out(`Mean / GMI      ${report.meanGlucose} mg/dL · GMI ${report.gmi}%`)
    io.out(`Variability     SD ${report.sd} · CV ${report.cv}%`)
    io.out(`Time in range   ${tir.inRange.percentage}% (70-180) · tight ${report.tightRange!.inRange}% (70-140)`)
    io.out(`Below range     ${tir.low.percentage}% low · ${tir.veryLow.percentage}% very low`)
    io.out(`Above range     ${tir.high.percentage}% high · ${tir.veryHigh.percentage}% very high`)
    io.out(`Episodes        ${report.episodes!.summary.hypoCount} hypo · ${report.episodes!.summary.hyperCount} hyper`)
    io.out('────────────────────────────────')
    io.out('Informational only — not medical advice.')
  }

  const svgOut = flags.get('agp-svg')
  if (typeof svgOut === 'string') {
    writeFileSync(svgOut, agpChartToSVG(readings, {
      timeZone: typeof timeZone === 'string' ? timeZone : undefined,
    }))
    io.out(`AGP chart written to ${svgOut}`)
  }

  return 0
}
