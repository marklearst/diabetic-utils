# @glucoseiq/testing

Deterministic, seedable mock-CGM data for tests, demos, and docs.

```ts
import { generateCGMSeries, scenarios } from "@glucoseiq/testing"

const readings = generateCGMSeries({ days: 14, seed: 7 })
const gappy = scenarios.gappyTrace()
```

Same seed → identical output, always.

MIT © Mark Learst
