// @file src/a1c.ts

/**
 * Formats an A1C value with % sign.
 * @param val - A1C number
 * @returns A1C as string with percent
 */
export function formatA1C(val: number): string {
  return `${val.toFixed(1)}%`
}
