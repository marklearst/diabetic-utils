# Integrations

**diabetic-utils** is platform-agnostic and can be used with any diabetes data source. Here's how to integrate with popular platforms and data formats.

---

## Google Fit / Health Connect

- **Google Fit** and **Health Connect** often use mmol/L for glucose values.
- Use diabetic-utils to convert units, validate, and analyze data before writing or after reading.

```ts
import { mgdlToMmol, mmolToMgdl, estimateA1CFromAverage } from 'diabetic-utils'

// Convert mg/dL to mmol/L for Google Fit
const glucoseMgdl = 120
const glucoseMmol = mgdlToMmol(glucoseMgdl) // 6.66

// Estimate A1C from Health Connect data
const a1c = estimateA1CFromAverage(glucoseMmol, 'mmol/L')
```

---

## Nightscout

- Nightscout stores glucose data in mg/dL by default.
- Use diabetic-utils for conversions, labeling, and analytics on Nightscout data.

```ts
import { labelGlucoseStatus, calculateTimeInRange } from 'diabetic-utils'

const readings = [90, 110, 150, 200, 80]
const tir = calculateTimeInRange(readings, 'mg/dL')
const status = labelGlucoseStatus(65, 'mg/dL') // 'low'
```

---

## CSV / Manual Data

- Use diabetic-utils to parse, validate, and process data from CSVs or manual entry.

```ts
import { parseGlucoseString, isValidGlucoseValue } from 'diabetic-utils'

const input = '7.2 mmol/L'
const { value, unit } = parseGlucoseString(input)
if (isValidGlucoseValue(value, unit)) {
  // process value
}
```

---

## Simulated Data (e.g., cgmsim-lib)

- Use cgmsim-lib or similar to generate test data, then process it with diabetic-utils.

```ts
// Simulate data (pseudo-code)
const simulatedReadings = [5.5, 6.2, 7.8, 4.9] // mmol/L
import { mmolToMgdl, calculateTimeInRange } from 'diabetic-utils'
const readingsMgdl = simulatedReadings.map(mmolToMgdl)
const tir = calculateTimeInRange(readingsMgdl, 'mg/dL')
```

---

**Best Practices:**

- Always validate and convert units before analysis.
- Use type-safe APIs for reliability.
- See [Examples](./examples.md) for more real-world code.
