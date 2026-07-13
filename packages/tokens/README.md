# @glucoseiq/tokens

GlucoseIQ design tokens — the canonical 5-zone glucose palette, trend glyphs, and zone classification shared by every GlucoseIQ surface.

```bash
npm install @glucoseiq/tokens
```

```ts
import { classifyGlucoseZone, zoneColor, cssVariables } from "@glucoseiq/tokens"

classifyGlucoseZone(65)      // "low"
zoneColor("inRange")         // "#22c55e"
document.documentElement.style.cssText += cssVariables("dark")
```

MIT © Mark Learst
