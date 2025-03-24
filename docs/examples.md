# Examples

Here are practical examples for using **diabetic-utils** in real-world scenarios.

---

## Glucose Unit Conversion

```ts
import { mgdlToMmol, mmolToMgdl } from 'diabetic-utils'

const mgdl = 100
const mmol = mgdlToMmol(mgdl) // 5.55

const mmol2 = 7.2
const mgdl2 = mmolToMgdl(mmol2) // 130
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
import { calculateTimeInRange } from 'diabetic-utils'

const readings = [90, 110, 150, 200, 80]
const tir = calculateTimeInRange(readings, 'mg/dL')
// tir = { inRange: 3, low: 1, high: 1 }
```

---

## Glucose Formatting & Labeling

```ts
import { formatGlucose, labelGlucoseStatus } from 'diabetic-utils'

const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'
const status = labelGlucoseStatus(65, 'mg/dL') // 'low'
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

## Integration with Simulated Data

```ts
// Simulated readings from cgmsim-lib or similar
const simulated = [5.5, 6.2, 7.8, 4.9] // mmol/L
import { mmolToMgdl, calculateTimeInRange } from 'diabetic-utils'
const readingsMgdl = simulated.map(mmolToMgdl)
const tir = calculateTimeInRange(readingsMgdl, 'mg/dL')
```

---

See [Integrations](./integrations.md) for more platform-specific examples.
