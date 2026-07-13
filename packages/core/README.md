# 🩸 GlucoseIQ

**The headless engine behind glucose on every screen.**

A zero-dependency TypeScript toolkit for CGM and diabetes analytics — the AGP percentile-band series, Time-in-Range, a full suite of cited variability & risk metrics, meal-response analysis, a live trend model, and render-ready SVG charts. One pure engine that runs the same on a server, in a browser, in a React app, or behind an Apple Watch complication.

> _**GlucoseIQ 1.0** expands `diabetic-utils` into a scoped package ecosystem with a zero-dependency headless core. Projects on `diabetic-utils` 1.5.x can adopt the 2.0 compatibility bridge without changing source imports (see [Migration](#-migration))._

> **Disclaimer:** For informational and educational purposes only. Not medical advice, diagnosis, or treatment.

![Node](https://img.shields.io/badge/node-%E2%89%A524-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-100%25-success)
![Types](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Dependencies](https://img.shields.io/badge/dependencies-0-success)
![License](https://img.shields.io/github/license/marklearst/glucoseiq)

---

## Why GlucoseIQ

- **Zero runtime dependencies** in the core. Tree-shakable, tiny (~15 KB gzipped), runs anywhere.
- **Cited, researcher-grade math.** Every metric traces to a published guideline, golden-tested against reference values (including the R `iglu` package and Nightscout).
- **Headless by design.** Pure functions in, render-ready data out — draw it with any chart library, or use the built-in zero-dependency SVG renderers.
- **100% test coverage**, strict TypeScript, ESM + CJS.

---

## Packages

| Package | What it is |
|---|---|
| **`@glucoseiq/core`** | The zero-dependency headless engine — all analytics, series, live model, interop, and SVG renderers. |
| **`@glucoseiq/react`** | Memoized hooks + headless `<AgpChart/>`, `<TirBar/>`, `<TrendTile/>` components (React ≥18 peer). |
| **`@glucoseiq/tokens`** | The canonical 5-zone palette, trend glyphs, and CSS variables. |
| **`@glucoseiq/testing`** | Seedable mock-CGM generator + scenario fixtures (same seed → identical output). |
| **`@glucoseiq/cli`** | `npx @glucoseiq/cli report data.csv` — zero-code analysis of any CGM export. |
| **`diabetic-utils`** | 2.0 compatibility bridge for projects moving from `diabetic-utils` 1.5.x to `@glucoseiq/core`. |

```bash
npm install @glucoseiq/core
```

---

## 30-second demo

```ts
import { analyzeGlucose } from '@glucoseiq/core'

const report = analyzeGlucose(readings, { timeZone: 'America/New_York' })

report.gmi                            // 6.8   (estimated A1C)
report.timeInRange.inRange.percentage // 72.5  (%)
report.tightRange.inRange             // 58.1  (% in 70–140)
report.risk.gri.zone                  // 'B'   (Glycemia Risk Index zone)
report.episodes.summary.hypoCount     // 3     (≥15-min hypo events)
report.agpProfile.bins                // 288 time-of-day percentile bins
```

One normalized pass → a clinician-grade report: summary scalars, enhanced 5-range TIR, tight range, the full risk-metric set, hypo/hyper episodes, data sufficiency, and the AGP band series.

---

## AGP-in-a-tag

The Ambulatory Glucose Profile — the chart every CGM dashboard renders — as a self-contained, dependency-free **SVG string** you can drop into a README, an email, a PDF, or any framework:

```ts
import { agpChartToSVG, tirBarToSVG, trendTileToSVG } from '@glucoseiq/core'

element.innerHTML = agpChartToSVG(readings, { theme: 'dark' })
```

Follow the [dashboard guide](https://glucoseiq.health/docs/dashboard) to compose
a full dashboard from `@glucoseiq/core` without a chart library or framework.

---

## What's inside

**Analytics & series**
`analyzeGlucose` (one-call report) · `buildAGPProfile` (time-of-day percentile bands) · enhanced 5-range TIR + pregnancy TIR · `calculateTITR` (time in tight range) · `glucoseMValue` · `calculateIGC` · `calculateGVIPGS` (Nightscout parity) · `aggregateCohort` · `detectGaps` / `splitDayNight` / `alignToGrid`

**Variability & risk** _(all cited, golden-tested)_
GMI/eAG · SD/CV/percentiles · MAGE · LBGI/HBGI · ADRR · GRADE · GRI · J-Index · MODD · CONGA · **M-value** · **IGC** (Rodbard) · **GVI/PGS** (Nightscout parity) · **MAG** · **GVP** · `calculateAGPMetrics` (all at once)

**Events & meals**
`detectEpisodes` (consensus ≥15-min hypo/hyper events) · `analyzeMealResponse` · `glucoseAUC` / `incrementalAUC` (Wolever iAUC)

**Live model**
`computeGlucoseTrend` (rate-of-change + trend) · `latestReading` · `minutesSinceLastReading`

**Score**
`glucoseIQScore` — a 0–100 wellness score (100 − GRI) with an A–E zone

**Render (zero-dependency SVG strings)**
`agpChartToSVG` · `tirBarToSVG` · `trendTileToSVG`

**Connectors & interop**
Dexcom / Libre / Nightscout normalizers · FHIR CGM IG payloads (LOINC codes verified against v1.0.0) · Open mHealth

**Ingestion**
`parseGlucoseCSV` — point it at any Dexcom Clarity / LibreView / Nightscout / Tidepool export

---

## Everything is unit-aware

Mixed mg/dL and mmol/L input is normalized correctly everywhere. Where a metric's formula is calibrated for mg/dL, values are converted first — so international (mmol/L) data never silently produces wrong numbers.

---

## 🔄 Migration

`diabetic-utils@2` is the compatibility bridge from the 1.5.x package to
`@glucoseiq/core@1`. Existing source imports stay the same:

```ts
import { calculateEnhancedTIR, estimateGMI } from 'diabetic-utils' // still works
```

New projects should depend on `@glucoseiq/core` directly. The compatibility
major requires Node ≥24 and covers the package move, typed results on empty
data, corrected FHIR LOINC codes, and the Libre unit fix. Clinical formulas
keep their 1.5.x numeric behavior and cited results stay reproducible.

---

## Development

```bash
pnpm install
pnpm build          # turbo: builds all packages
pnpm test           # turbo: runs all package tests
pnpm test:coverage  # 100% enforced
```

Node ≥24. Turborepo + pnpm workspaces.

---

## References

TIR & episodes: Battelino 2019, Danne 2017 · A1C/eAG: Nathan 2008 · LBGI/HBGI/ADRR: Kovatchev 2006 · GRADE: Hill 2007 · GRI: Klonoff 2023 · MODD: Service 1980 · CONGA: McDonnell 2005 · MAGE: Service 1970 · M-value: Schlichtkrull 1965 · IGC: Rodbard 2009 · GVP: Peyser 2018 · MAG: Hermanides 2010 · iAUC: Wolever & Jenkins 1986 · FHIR: HL7 CGM IG v1.0.0

---

## License

MIT © [Mark Learst](https://marklearst.com)

Built with ❤️ for the diabetes community.
