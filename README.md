# Diabetic Utils

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)

A modern TypeScript utility library for glucose, A1C, and diabetic health data. **No bloat. No guesswork. Just sharp utilities built for real-world usage.**

> ⚠️ This is a full v1 rewrite - rebuilt from the ground up with strict TypeScript types, runtime guards, and modular, test-driven architecture.
> No bloat. No guesswork. Just sharp utilities built for real-world usage.

## 📊 **Status & Badges**

![Status](https://img.shields.io/badge/status-stable-brightgreen)
[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)
![CI](https://github.com/marklearst/diabetic-utils/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/github/license/marklearst/diabetic-utils)
![GitHub last commit](https://img.shields.io/github/last-commit/marklearst/diabetic-utils)
![GitHub code size](https://img.shields.io/github/languages/code-size/marklearst/diabetic-utils)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![npm](https://img.shields.io/npm/v/diabetic-utils)
![npm downloads](https://img.shields.io/npm/dm/diabetic-utils)

---

## 📦 Installation

Install from npm:

```sh
npm install diabetic-utils
# or
pnpm add diabetic-utils
# or
yarn add diabetic-utils
```

## ⚡ Quick Usage

```typescript
import {
  estimateGMI,
  estimateA1CFromAverage,
  mgDlToMmolL,
  mmolLToMgDl,
  calculateTimeInRange,
  formatGlucose,
  parseGlucoseString,
  isValidGlucoseValue,
  getGlucoseLabel,
  isHypo,
  isHyper,
  getA1CCategory,
  isA1CInTarget,
} from 'diabetic-utils'

estimateGMI(100, 'mg/dL') // → 5.4
estimateGMI('5.5 mmol/L') // → ~12.1
estimateGMI({ value: 100, unit: 'mg/dL' }) // → 5.4

// You can also automatically label glucose values as low, normal, or high:
getGlucoseLabel(60, 'mg/dL') // 'low'
getGlucoseLabel(5.5, 'mmol/L') // 'normal'
getGlucoseLabel(200, 'mg/dL') // 'high'

// ---
// Configurable clinical thresholds (NEW!)
// ---

// Custom hypo threshold (mg/dL)
isHypo(75, 'mg/dL', { mgdl: 80 }) // true
isHypo(85, 'mg/dL', { mgdl: 80 }) // false

// Custom hyper threshold (mmol/L)
isHyper(9.0, 'mmol/L', { mmoll: 8.5 }) // true
isHyper(8.0, 'mmol/L', { mmoll: 8.5 }) // false

// Custom thresholds for labeling
getGlucoseLabel(75, 'mg/dL', { hypo: { mgdl: 80 } }) // 'low'
getGlucoseLabel(170, 'mg/dL', { hyper: { mgdl: 160 } }) // 'high'
getGlucoseLabel(100, 'mg/dL', { hypo: { mgdl: 80 }, hyper: { mgdl: 160 } }) // 'normal'

// Custom A1C category cutoffs
getA1CCategory(6.0, { normalMax: 6.0, prediabetesMax: 7.0 }) // 'normal'
getA1CCategory(6.5, { normalMax: 6.0, prediabetesMax: 7.0 }) // 'prediabetes'
getA1CCategory(7.5, { normalMax: 6.0, prediabetesMax: 7.0 }) // 'diabetes'

// ---
// Clinical-Grade Glucose Variability Analytics (NEW!)
// ---

// Calculate unbiased sample standard deviation (SD)

glucoseStandardDeviation([90, 100, 110, 120, 130, 140, 150, 160, 170, 180]) // 30.28

// Calculate coefficient of variation (CV)

glucoseCoefficientOfVariation([90, 100, 110, 120, 130, 140, 150, 160, 170, 180]) // 22.43

// Calculate percentiles (nearest-rank method)

glucosePercentiles(
  [90, 100, 110, 120, 130, 140, 150, 160, 170, 180],
  [10, 25, 50, 75, 90]
)
// { 10: 90, 25: 110, 50: 130, 75: 160, 90: 170 }
```

## Clinical-Grade Glucose Variability Analytics

Diabetic Utils is the **only TypeScript/JavaScript library** offering clinical-grade, research-backed glucose variability metrics:

- **Standard Deviation (SD):** Unbiased sample SD (n-1), as used in clinical research and guidelines ([See ADA 2019](https://care.diabetesjournals.org/content/42/8/1593), [See ISPAD 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/)).
- **Coefficient of Variation (CV):** SD divided by mean, multiplied by 100. Used to assess glycemic variability in clinical trials.
- **Percentiles:** Nearest-rank method, standard in research and clinical reporting.

### Usage Examples

```typescript
import {
  glucoseStandardDeviation,
  glucoseCoefficientOfVariation,
  glucosePercentiles,
} from 'diabetic-utils'

const data = [90, 100, 110, 120, 130, 140, 150, 160, 170, 180]

glucoseStandardDeviation(data) // 30.28

glucoseCoefficientOfVariation(data) // 22.43

glucosePercentiles(data, [10, 50, 90]) // { 10: 90, 50: 130, 90: 170 }
```

> **References:**
>
> - [ADA Standards of Medical Care in Diabetes—2019. Glycemic Targets. Diabetes Care 2019;42(Suppl. 1):S61–S70.](https://care.diabetesjournals.org/content/42/8/1593)
> - [ISPAD Clinical Practice Consensus Guidelines 2018: Assessment and management of hypoglycemia in children and adolescents with diabetes.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/)

These analytics make diabetic-utils uniquely suited for research, clinical trials, and advanced diabetes management apps.

## 🧑‍💻 Full Examples

Here are some real-world TypeScript examples to get you started:

```typescript
// Convert mg/dL to mmol/L
const mmol = mgDlToMmolL(100) // 5.5

// Convert mmol/L to mg/dL
const mgdl = mmolLToMgDl(7.2) // 130

// Estimate A1C from average glucose (mg/dL)
const a1c = estimateA1CFromAverage(120, 'mg/dL') // 5.9

// Estimate A1C from average glucose (mmol/L)
const a1c2 = estimateA1CFromAverage(6.7, 'mmol/L') // 6.7

// Calculate Time-in-Range (TIR)
const readings = [90, 110, 150, 200, 80]
const tir = calculateTimeInRange(readings, 70, 180) // e.g., 60

// Format a glucose value
const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'

// Label glucose status
const status = getGlucoseLabel(65, 'mg/dL') // 'low'

// Parse a glucose string
const { value, unit } = parseGlucoseString('7.2 mmol/L')

// Validate a glucose value
const isValid = isValidGlucoseValue(value, unit) // true

// ...and more!
```

## 🤔 Why diabetic-utils?

- Zero-bloat, focused utilities
- 100% test coverage
- TypeScript-first, works in JS too
- Perfect for apps, research, and data science

## 🧱 Architecture Highlights

- ✅ Fully tested core utilities with edge case coverage via Vitest
- ✅ Input guards and string parsing for robust DX - protect users from malformed data
- ✅ Strictly typed inputs and outputs using modern TypeScript best practices
- ✅ Predictable, composable function signatures designed for safe integrations
- ✅ Developer-first architecture: clear folder structure, import aliases, and helper separation
- ✅ Built with CGM apps, dashboards, and wearable integrations in mind
- ✅ Readable, ergonomic API that's easy to use in both clinical and wellness-focused tools
- ✅ Performance-focused - **zero external runtime dependencies**

## 🌱 Coming Soon

- ⏱️ More time-in-range (TIR) utilities
- 🧠 Predictive A1C & glucose trends
- 🔁 Advanced glucose unit conversions
- 🏷️ Glucose formatting & status labeling (low, normal, high)
- 🧪 Lab value constants, ranges, and typed result models
- 🌐 Docs site: [diabeticutils.com](https://diabeticutils.com)

## 🚦 Launch Status

- Docs: Complete
- Code: Modular, clean, scalable
- Coverage: 100%
- NPM: Live!

## 🙋‍♂️ Author

Built by [@marklearst](https://x.com/marklearst)

_Pushing pixels with purpose. Tools for humans._

## 🌐 Connect

- X (Twitter): [@marklearst](https://x.com/marklearst)
- LinkedIn: [Mark Learst](https://linkedin.com/in/marklearst)
- GitHub: [marklearst](https://github.com/marklearst)
- Portfolio: [marklearst.com](https://marklearst.com)
- Website: [diabeticutils.com](https://diabeticutils.com) _(coming soon)_

> 💬 Mention or DM me if you use diabetic-utils in your project—I'd love to feature your work!
>
> ⭐ Star the repo, share on socials, and help us build the best diabetes data toolkit together!

## 📝 A Personal Note

I built diabetic-utils because I believe in the power of data-driven diabetes management. As someone who's lived with diabetes, I know how hard it can be to make sense of the numbers. That's why I've poured my heart into creating a library that's both clinically accurate and easy to use. Whether you're building an app, working on a research project, or just trying to make sense of your own data, I hope diabetic-utils can help. Let's work together to make diabetes management better, one data point at a time.

## 👨🏻‍💻 Developer Notes

- This library follows **semver** for versioning.
- All calculations are based on peer-reviewed medical sources.
  (See: [NIH A1C](https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test), [ADA conversion formulas](https://diabetes.org/diabetes/a1c/diagnosis))
- Unit tests live in `/test` and run automatically via CI.
- API will stay stable for all `1.x` releases—any breaking change will be in `2.0`.
- Planned next: [ ] Add more unit conversions, [ ] Support for Type 1-specific metrics.
- Got a formula you want to see? File an issue or PR!

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
© 2024–2025 Mark Learst

Use it, fork it, build something that matters.
