# API Reference

Welcome to the **diabetic-utils** API Reference. All functions are fully type-safe and documented with JSDoc in the codebase.

---

## Glucose Unit Conversions

| Function             | Signature                                                                                         | Description                      |
| -------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `mgDlToMmolL`        | `(mgdl: number) => number`                                                                        | Convert mg/dL to mmol/L          |
| `mmolLToMgDl`        | `(mmol: number) => number`                                                                        | Convert mmol/L to mg/dL          |
| `convertGlucoseUnit` | `({ value, unit }: { value: number, unit: GlucoseUnit }) => { value: number, unit: GlucoseUnit }` | Convert between mg/dL and mmol/L |

---

## A1C & GMI Estimation

| Function                 | Signature                                                                      | Description                              |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------- |
| `estimateA1CFromAverage` | `(average: number, unit: GlucoseUnit) => number`                               | Estimate A1C from average glucose        |
| `estimateEAG`            | `(a1c: number) => number`                                                      | Estimate eAG (estimated average glucose) |
| `estimateGMI`            | `(valueOrOptions: number \| EstimateGMIOptions, unit?: GlucoseUnit) => number` | Estimate GMI from average glucose        |

---

## Time-in-Range (TIR)

| Function               | Signature                                                          | Description                           |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| `calculateTimeInRange` | `({ readings, unit, range }: TIROptions) => TIRResult`             | Calculate time in range, below, above |
| `getTIRSummary`        | `(results: TIRResult[]) => TIRResult`                              | Summarize multiple TIR results        |
| `groupByDay`           | `(readings: GlucoseReading[]) => Record<string, GlucoseReading[]>` | Group readings by day                 |

---

## Glucose Formatting

- `formatGlucose(value: number, unit: GlucoseUnit, options?: { digits?: number; suffix?: boolean }): string`
  Format a glucose value with its unit.
- `formatPercentage(value: number, digits?: number): string`
  Format a number as a percentage string.
- `formatDate(iso: string, timeZone?: string): string`
  Format an ISO timestamp to a local-readable string.

---

## Glucose Utilities

- `isHypo(val: number, unit: GlucoseUnit): boolean`
  Returns true if value is below hypoglycemia threshold.
- `isHyper(val: number, unit: GlucoseUnit): boolean`
  Returns true if value is above hyperglycemia threshold.
- `getGlucoseLabel(val: number, unit: GlucoseUnit): 'low' | 'normal' | 'high'`
  Returns a glucose status label.

---

## Validation & Parsing

- `isValidGlucoseValue(value: unknown, unit: unknown): boolean`
  Check if a glucose value and unit are valid.
- `parseGlucoseString(input: string): { value: number, unit: GlucoseUnit }`
  Parse a glucose string (e.g., '100 mg/dL').

---

## Type Guards

- `isEstimateGMIOptions(obj: unknown): obj is EstimateGMIOptions`
  Type guard for EstimateGMIOptions.
- `isValidGlucoseString(input: unknown): input is string`
  Type guard for valid glucose strings.

---

For detailed usage, see [Examples](./examples.md) or the JSDoc comments in the codebase.
