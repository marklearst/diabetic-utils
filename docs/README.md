**diabetic-utils**

***

# Diabetic Utils

**The professional TypeScript toolkit for diabetes analytics and clinical-grade health data.**

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)

A modern, strictly-typed utility library for glucose, A1C, insulin, and diabetes metrics. Designed for reliability, transparency, and real-world clinical use—no bloat, no guesswork, just robust utilities and authoritative references.

> ⚠️ v1+ is a full rewrite: strict TypeScript, runtime validation, modular design, and 100% test coverage. Trusted by developers, clinicians, and researchers alike.

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

## 📚 Table of Contents

- [Installation](#-installation)
- [Quick Usage](#-quick-usage)
- [Features](#-features)
- [Full Examples](#-full-examples)
- [Contributing](#-contributing)
- [License](#-license)

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
```

## 🌟 Features

- TypeScript-first, fully typed API
- Glucose, A1C, GMI, HOMA-IR, and time-in-range utilities
- Input parsing and robust clinical validation
- Labeling and categorization helpers
- Centralized clinical constants and thresholds
- 100% test coverage (unit, edge, and error cases)
- No dependencies, no bloat
- Authoritative references (ADA, CDC, PubMed, ISPAD)
- Modern TSDoc and auto-generated API documentation

---

## 🏆 Why Choose diabetic-utils?

- **Modern TypeScript-first API:** Strict types, runtime validation, and full TSDoc coverage.
- **100% Test Coverage:** Every function, edge case, and error branch is tested.
- **Clinical-Grade Analytics:** HOMA-IR, A1C, GMI, TIR, and glucose variability metrics with authoritative references.
- **Input Validation:** All clinical values are validated with robust, reusable guards.
- **No Bloat, No Guesswork:** Focused, modular utilities—tree-shakable and production-ready.
- **Trusted References:** All algorithms and thresholds are transparently sourced from ADA, CDC, PubMed, and ISPAD guidelines.
- **Ready for SDKs and Apps:** Small bundle, ESM/CJS support, and zero dependencies.

---

## 🚀 What's New in 1.3.0

- **Alignment Module:**
  - Added `alignment.ts` for HOMA-IR calculation and glycemic marker alignment.
  - Fully documented with clinical references and disclaimers.
  - 100% test coverage including edge cases and invalid input handling.
- **Modern Validators:**
  - New `validators.ts` for insulin and future biomarker validation.
- **Constants Centralized:**
  - All clinical thresholds and formulas now in `constants.ts`.
- **Improved TSDoc:**
  - All public and internal functions now feature detailed TSDoc with clinical context.
- **Magic Numbers Eliminated:**
  - All formulas use named constants for clarity and maintainability.
- **Robust Error Handling:**
  - Functions throw clear, descriptive errors on invalid input.
- **Authoritative References:**
  - Only trusted, relevant clinical sources cited.

---

## 📚 Documentation

- **API Reference:**
  Auto-generated [Typedoc documentation](https://marklearst.github.io/diabetic-utils/) covers all functions, types, and constants.
- **Usage Examples:**
  See the "Full Examples" and "Quick Usage" sections below for real-world TypeScript snippets.

---

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

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin my-feature`)
5. Open a pull request

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💬 Support

For questions, issues, or feature requests, open an issue on GitHub or email mark@marklearst.com.

---

## 🔗 Project Links

- [GitHub Repository](https://github.com/marklearst/diabetic-utils)
- [NPM Package](https://www.npmjs.com/package/diabetic-utils)
- [Documentation](https://marklearst.github.io/diabetic-utils/)

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
