// Placeholder for calculateTimeInRange
export function calculateTimeInRange(
  readings: number[],
  lower: number,
  upper: number
): number {
  // TODO: Implement calculation
  const inRange = readings.filter((r) => r >= lower && r <= upper).length
  return (inRange / readings.length) * 100
}
