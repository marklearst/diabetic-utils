# API Reference

Welcome to the **diabetic-utils** API Reference. All functions are fully type-safe and documented with JSDoc in the codebase.

---

## Glucose Unit Conversions

| Function             | Signature                              | Description                      |
| -------------------- | -------------------------------------- | -------------------------------- |
| `mgdlToMmol`         | `(mgdl: number) => number`             | Convert mg/dL to mmol/L          |
| `mmolToMgdl`         | `(mmol: number) => number`             | Convert mmol/L to mg/dL          |
| `convertGlucoseUnit` | `({ value, unit }) => { value, unit }` | Convert between mg/dL and mmol/L |

---

## A1C & GMI Estimation

| Function                 | Signature                                                | Description                              |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------- |
| `estimateA1CFromAverage` | `(average: number, unit: 'mg/dL' \| 'mmol/L') => number` | Estimate A1C from average glucose        |
| `estimateEAG`            | `(a1c: number) => number`                                | Estimate eAG (estimated average glucose) |
| `estimateGMI`            | `(valueOrOptions, unit?) => number`                      | Estimate GMI from average glucose        |

---

## Time-in-Range (TIR)

| Function               | Signature                                                                   | Description                        |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| `calculateTimeInRange` | `(readings: number[], unit: 'mg/dL' \| 'mmol/L') => { inRange, low, high }` | Calculate time in range, low, high |

---

## Glucose Formatting & Labeling

| Function             | Signature                                                                   | Description                           |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| `formatGlucose`      | `(value: number, unit: 'mg/dL' \| 'mmol/L') => string`                      | Format a glucose value with its unit  |
| `labelGlucoseStatus` | `(value: number, unit: 'mg/dL' \| 'mmol/L') => 'low' \| 'normal' \| 'high'` | Label glucose as low, normal, or high |
| `glucoseLabel`       | `(value: number) => string`                                                 | Simple label for glucose value        |

---

## Validation & Parsing

| Function              | Signature                                    | Description                                 |
| --------------------- | -------------------------------------------- | ------------------------------------------- |
| `isValidGlucoseValue` | `(value: unknown, unit: unknown) => boolean` | Check if a glucose value and unit are valid |
| `parseGlucoseString`  | `(input: string) => { value, unit }`         | Parse a glucose string (e.g., '100 mg/dL')  |

---

For detailed usage, see [Examples](./examples.md) or the JSDoc comments in the codebase.
