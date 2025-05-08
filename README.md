# Diabetic Utils

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)

A modern TypeScript utility library for glucose, A1C, and diabetic health data. **No bloat. No guesswork. Just sharp utilities built for real-world usage.**

> 🎉 Version 1.1.0 is here! Featuring a streamlined architecture, 100% test coverage, and improved developer experience.
> NPM release coming soon.

![Status](https://img.shields.io/badge/status-stable-green)
[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)
![CI](https://github.com/marklearst/diabetic-utils/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/marklearst/diabetic-utils)
![GitHub last commit](https://img.shields.io/github/last-commit/marklearst/diabetic-utils)
![GitHub code size](https://img.shields.io/github/languages/code-size/marklearst/diabetic-utils)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)

---

## 📦 Installation

> **Note:** diabetic-utils is not yet published to NPM. Stay tuned for the v1.1.0 launch!
>
> _Early testers: install from GitHub:_
>
> ```sh
> pnpm add marklearst/diabetic-utils
> # or
> npm install github:marklearst/diabetic-utils
> # or
> yarn add github:marklearst/diabetic-utils
> ```

## ⚡ Quick Usage

```ts
import { estimateGMI, formatGlucose } from '@marklearst/diabetic-utils'

// Estimate GMI from glucose values
estimateGMI(100, 'mg/dL') // → 5.4
estimateGMI('5.5 mmol/L') // → ~12.1
estimateGMI({ value: 100, unit: 'mg/dL' }) // → 5.4

// Format glucose values with units
formatGlucose(120, 'mg/dL') // '120 mg/dL'
formatGlucose(5.5, 'mmol/L', { digits: 1 }) // '5.5 mmol/L'
```

## 🧑‍💻 Full Examples

Here are some real-world TypeScript examples to get you started:

```ts
import {
  mgDlToMmolL,
  mmolLToMgDl,
  estimateA1CFromAverage,
  calculateTimeInRange,
  formatGlucose,
  parseGlucoseString,
  isValidGlucoseValue,
} from '@marklearst/diabetic-utils'

// Convert mg/dL to mmol/L
const mmol = mgDlToMmolL(100) // 5.55

// Convert mmol/L to mg/dL
const mgdl = mmolLToMgDl(7.2) // 130

// Estimate A1C from average glucose (mg/dL)
const a1c = estimateA1CFromAverage(120, 'mg/dL') // 5.9

// Estimate A1C from average glucose (mmol/L)
const a1c2 = estimateA1CFromAverage(6.7, 'mmol/L') // 6.7

// Calculate Time-in-Range (TIR)
const readings = [
  { value: 90, unit: 'mg/dL', timestamp: '2024-03-20T10:00:00Z' },
  { value: 110, unit: 'mg/dL', timestamp: '2024-03-20T11:00:00Z' },
  { value: 150, unit: 'mg/dL', timestamp: '2024-03-20T12:00:00Z' },
  { value: 200, unit: 'mg/dL', timestamp: '2024-03-20T13:00:00Z' },
  { value: 80, unit: 'mg/dL', timestamp: '2024-03-20T14:00:00Z' },
]
const tir = calculateTimeInRange({ readings, unit: 'mg/dL', range: [70, 180] })
// tir = { inRange: 3, belowRange: 1, aboveRange: 1 }

// Format a glucose value
const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'

// Parse a glucose string
const { value, unit } = parseGlucoseString('7.2 mmol/L')

// Validate a glucose value
const isValid = isValidGlucoseValue(value, unit) // true

// ...and more!
```

## 🛠️ Why diabetic-utils?

- Zero-bloat, focused utilities
- 100% test coverage achieved
- TypeScript-first, works in JS too
- Perfect for apps, research, and data science

## 🧱 Architecture Highlights

- ✅ Flat, maintainable directory structure
- ✅ Fully tested core utilities with 100% coverage via Vitest
- ✅ Input guards and string parsing for robust DX - protect users from malformed data
- ✅ Strictly typed inputs and outputs using modern TypeScript best practices
- ✅ Predictable, composable function signatures designed for safe integrations
- ✅ Developer-first architecture: clear file organization and helper separation
- ✅ Built with CGM apps, dashboards, and wearable integrations in mind
- ✅ Readable, ergonomic API that's easy to use in both clinical and wellness-focused tools
- ✅ Performance-focused - **zero external runtime dependencies**

## 🌱 Coming Soon

- 🧠 Predictive A1C & glucose trends
- 🔁 Advanced glucose unit conversions
- 🧪 Lab value constants, ranges, and typed result models
- 🌐 Docs site: <https://diabeticutils.com>

## 🚦 Status

- Docs: Complete
- Code: Clean, modular, and maintainable
- Coverage: 100% achieved
- NPM: Coming soon!

## ✍️ Author

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

---

## 📚 More Examples

See [docs/examples.md](./docs/examples.md) for advanced and integration scenarios.
