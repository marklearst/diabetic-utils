# Diabetic Utils

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)



A modern TypeScript utility library for glucose, A1C, and diabetic health data. Designed for developers building health apps CGM dashboards, and wellness tools that demand clinical-grade accuracy with clean, modern code.

> ⚠️ This is a full v2 rewrite - rebuilt from the ground up with strict TypeScript types, runtime guards, and modular, test-driven architecture.
> No bloat. No guesswork. Just sharp utilities built for real-world usage.
> NPM release coming soon.

[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)

---

## 📦 Installation

```bash
pnpm add @marklearst/diabetic-utils
# or
npm install @marklearst/diabetic-utils
```

## 🧪 Quick Start

```ts
import { estimateGMI } from '@marklearst/diabetic-utils'

estimateGMI(100, 'mg/dL') // → 5.4
estimateGMI('5.5 mmol/L') // → ~12.1
estimateGMI({ value: 100, unit: 'mg/dL' }) // → 5.4
```

## ⚙️ Recommended Scripts

```json
"scripts": {
  "dev": "vitest",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "build": "tsup src/index.ts --dts --format esm,cjs"
}
```

## 🧱 Architecture Highlights

- ✅ Fully tested core utilities with edge case coverage via Vitest
- ✅ Input guards and string parsing for robust DX - protect users from malformed data
- ✅ Strictly typed inputs and outputs using modern TypeScript best practices
- ✅ Predictable, composable function signatures designed for safe integrations
- ✅ Developer-first architecture: clear folder structure, import aliases, and helper separation
- ✅ Built with CGM apps, dashboards, and wearable integrations in mind
- ✅ Readable, ergonomic API that's easy to use in both clinical and wellness-focused tools
- ✅ Performance-focused - **zero external runtime dependencies**

## 👨🏻‍💻 Developer Notes

I use `@src/` as the root import alias throughout the codebase.
To configure this in editors or projects:

- TypeScript: see `tsconfig.json` → `paths`
- VS Code: ensure `jsconfig.json` or `tsconfig.json` is recognized

## 🌱 Coming Soon

- ⏱️ More time-in-range (TIR) utilities
- 🧠 Predictive A1C & glucose trends
- 🔁 Advanced glucose unit conversions
- 🏷️ Glucose formatting & status labeling (low, normal, high)
- 🧪 Lab value constants, ranges, and typed result models
- 🌐 Docs site: <https://diabeticutils.health>

## ✍️ Author

Built by @marklearst

Pushing pixels with purpose. Tools for humans.
