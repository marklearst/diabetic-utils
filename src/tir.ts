// @file src/tir.ts

import { GlucoseReading, TIRResult } from './types'

/**
 * Calculates % time in range, below, and above range.
 * @param readings - Array of glucose readings
 * @param target - Range object { min, max }
 * @returns TIRResult object
 * @see https://care.diabetesjournals.org/content/42/8/1593
 */
export function calculateTIR(
  readings: GlucoseReading[],
  target: { min: number; max: number }
): TIRResult {
  if (readings.length === 0) {
    return {
      inRange: 0.0,
      belowRange: 0.0,
      aboveRange: 0.0,
    }
  }

  let inRange = 0
  let belowRange = 0
  let aboveRange = 0

  for (const r of readings) {
    if (r.value < target.min) belowRange++
    else if (r.value > target.max) aboveRange++
    else inRange++
  }

  const total = readings.length
  return {
    inRange: +((inRange / total) * 100).toFixed(1),
    belowRange: +((belowRange / total) * 100).toFixed(1),
    aboveRange: +((aboveRange / total) * 100).toFixed(1),
  }
}

/**
 * Generates a readable summary from TIRResult.
 * @param result - TIR result breakdown
 * @returns Summary string
 */
export function getTIRSummary(result: TIRResult): string {
  return `In Range: ${result.inRange}%, Below: ${result.belowRange}%, Above: ${result.aboveRange}%`
}

/**
 * Groups glucose readings by date (YYYY-MM-DD).
 * @param readings - Array of readings
 * @returns Record of readings per day
 */
export function groupByDay(
  readings: GlucoseReading[]
): Record<string, GlucoseReading[]> {
  return readings.reduce((acc, reading) => {
    const day = reading.timestamp.split('T')[0]
    acc[day] = acc[day] || []
    acc[day].push(reading)
    return acc
  }, {} as Record<string, GlucoseReading[]>)
}

/**
 * Calculates the percentage of readings within a specified range.
 * @param readings - Array of glucose values
 * @param lower - Lower bound of the target range
 * @param upper - Upper bound of the target range
 * @returns Percentage of readings within the specified range
 */
export function calculateTimeInRange(
  readings: number[],
  lower: number,
  upper: number
): number {
  if (readings.length === 0) {
    return 0
  }

  const inRange = readings.filter((r) => r >= lower && r <= upper).length
  return (inRange / readings.length) * 100
}
