# @glucoseiq/react

Thin React adapter for [GlucoseIQ](https://glucoseiq.health) — memoized analysis hooks and headless chart components over the zero-dependency `@glucoseiq/core` engine.

```bash
npm install @glucoseiq/react @glucoseiq/core
```

```tsx
import { useGlucoseAnalysis, useGlucoseLive, AgpChart, TirBar, TrendTile } from "@glucoseiq/react"

function Dashboard({ readings }) {
  const report = useGlucoseAnalysis(readings)
  const live = useGlucoseLive(readings, { refreshMs: 30_000 })
  return (
    <>
      <TrendTile readings={readings} />
      <AgpChart readings={readings} options={{ theme: "dark" }} />
      <TirBar readings={readings} />
      <p>GMI {report.gmi} · {live.minutesSince?.toFixed(0)} min ago</p>
    </>
  )
}
```

React ≥18 is a peer dependency; nothing else.

MIT © Mark Learst
