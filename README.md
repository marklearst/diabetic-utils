# Diabetic Utils

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)

A modern TypeScript utility library for glucose, A1C, and diabetic health data. **No bloat. No guesswork. Just sharp utilities built for real-world usage.**

> ⚠️ This is a full v1 rewrite - rebuilt from the ground up with strict TypeScript types, runtime guards, and modular, test-driven architecture.
> No bloat. No guesswork. Just sharp utilities built for real-world usage.
> NPM release coming soon.

![Status](https://img.shields.io/badge/status-in--development-yellow)
[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)
![CI](https://github.com/marklearst/diabetic-utils/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/marklearst/diabetic-utils)
![GitHub last commit](https://img.shields.io/github/last-commit/marklearst/diabetic-utils)
![GitHub code size](https://img.shields.io/github/languages/code-size/marklearst/diabetic-utils)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)

---

## 📦 Installation

> **Note:** diabetic-utils is not yet published to NPM. Stay tuned for the v1.0.0 launch!
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
import { estimateGMI } from '@marklearst/diabetic-utils'
import { labelGlucoseStatus } from '@marklearst/diabetic-utils'

estimateGMI(100, 'mg/dL') // → 5.4
estimateGMI('5.5 mmol/L') // → ~12.1
estimateGMI({ value: 100, unit: 'mg/dL' }) // → 5.4

// You can also automatically label glucose values as low, normal, or high:
labelGlucoseStatus(60, 'mg/dL') // 'low'
labelGlucoseStatus(5.5, 'mmol/L') // 'normal'
labelGlucoseStatus(200, 'mg/dL') // 'high'
```

## 🧑‍💻 Full Examples

Here are some real-world TypeScript examples to get you started:

```ts
// Convert mg/dL to mmol/L
const mmol = mgdlToMmol(100) // 5.55

// Convert mmol/L to mg/dL
const mgdl = mmolToMgdl(7.2) // 130

// Estimate A1C from average glucose (mg/dL)
const a1c = estimateA1CFromAverage(120, 'mg/dL') // 5.9

// Estimate A1C from average glucose (mmol/L)
const a1c2 = estimateA1CFromAverage(6.7, 'mmol/L') // 6.7

// Calculate Time-in-Range (TIR)
const readings = [90, 110, 150, 200, 80]
const tir = calculateTimeInRange(readings, 'mg/dL')
// tir = { inRange: 3, low: 1, high: 1 }

// Format a glucose value
const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'

// Label glucose status
const status = labelGlucoseStatus(65, 'mg/dL') // 'low'

// Parse a glucose string
const { value, unit } = parseGlucoseString('7.2 mmol/L')

// Validate a glucose value
const isValid = isValidGlucoseValue(value, unit) // true

// ...and more!
```

## 🛠️ Why diabetic-utils?

- Zero-bloat, focused utilities
- 100% test coverage (goal)
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
- 🌐 Docs site: <https://diabeticutils.com>

## 🚦 Launch Status

- Docs: Complete
- Code: Modular, clean, scalable
- Coverage: 70% (aiming for 100%)
- NPM: Coming soon!

## 👨🏻‍💻 Developer Notes

I use `@src/` as the root import alias throughout the codebase.
To configure this in editors or projects:

- TypeScript: see `tsconfig.json` → `paths`
- VS Code: ensure `jsconfig.json` or `tsconfig.json` is recognized

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
