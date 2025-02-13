export const mgdlToMmol = (mgdl: number): number => {
  return +(mgdl / 18.0182).toFixed(2)
}
