// Placeholder for glucoseLabel
export function glucoseLabel(value: number): string {
  // TODO: Implement labeling
  if (value < 70) return 'Low'
  if (value > 180) return 'High'
  return 'In Range'
}
