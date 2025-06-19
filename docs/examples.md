# Examples

> **Note:** These examples use diabetic-utils v1.1.0+ with the new flat API structure.

Here are practical examples for using **diabetic-utils** in real-world scenarios.

---

## Glucose Unit Conversion

```ts
import { mgDlToMmolL, mmolLToMgDl } from 'diabetic-utils'

const mgdl = 100
const mmol = mgDlToMmolL(mgdl) // 5.55

const mmol2 = 7.2
const mgdl2 = mmolLToMgDl(mmol2) // 130
```

---

## Estimate A1C from Average Glucose

```ts
import { estimateA1CFromAverage } from 'diabetic-utils'

const avgGlucose = 120
const a1c = estimateA1CFromAverage(avgGlucose, 'mg/dL') // 5.9
```

---

## Calculate Time-in-Range (TIR)

```ts
import { calculateTIR } from 'diabetic-utils'

const readings = [
  { value: 90, unit: 'mg/dL', timestamp: '2024-03-20T10:00:00Z' },
  { value: 110, unit: 'mg/dL', timestamp: '2024-03-20T11:00:00Z' },
  { value: 150, unit: 'mg/dL', timestamp: '2024-03-20T12:00:00Z' },
  { value: 200, unit: 'mg/dL', timestamp: '2024-03-20T13:00:00Z' },
  { value: 80, unit: 'mg/dL', timestamp: '2024-03-20T14:00:00Z' },
]
const tir = calculateTIR(readings, { min: 70, max: 180 })
// tir = { inRange: 3, belowRange: 1, aboveRange: 1 }
```

---

## Glucose Formatting

```ts
import { formatGlucose } from 'diabetic-utils'

const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'
```

---

## Validation & Parsing

```ts
import { isValidGlucoseValue, parseGlucoseString } from 'diabetic-utils'

const input = '7.2 mmol/L'
const { value, unit } = parseGlucoseString(input)
if (isValidGlucoseValue(value, unit)) {
  // safe to use value
}
```

---

See [Features](./features.md) for more details on available utilities.
