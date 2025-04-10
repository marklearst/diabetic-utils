// @file src/tir.ts

import { GlucoseReading, TIRResult } from './types'

/**
 * Calculates the percentage of time glucose readings are in, below, and above a target range.
 * @param readings - Array of glucose readings to analyze.
 * @param target - Object specifying the target range with { min, max } values.
 * @returns An object with the percentage of readings in range, below range, and above range.
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
 * Generates a human-readable summary string from a TIRResult object.
 * @param result - The TIR result breakdown to summarize.
 * @returns A string summarizing the in-range, below-range, and above-range percentages (e.g., 'In Range: 70%, Below: 10%, Above: 20%').
 */
export function getTIRSummary(result: TIRResult): string {
  return `In Range: ${result.inRange}%, Below: ${result.belowRange}%, Above: ${result.aboveRange}%`
}

/**
 * Groups glucose readings by date (YYYY-MM-DD).
 * @param readings - Array of glucose readings to group.
 * @returns An object mapping each date string to an array of readings for that day.
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
 * Calculates the percentage of readings within a specified numeric range.
 * @param readings - Array of glucose values (numbers) to analyze.
 * @param lower - Lower bound of the target range (inclusive).
 * @param upper - Upper bound of the target range (inclusive).
 * @returns The percentage of readings within the specified range (0-100).
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
