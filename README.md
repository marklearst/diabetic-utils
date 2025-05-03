# 🩸 diabetic-utils

A modern TypeScript utility library for glucose, A1C, and diabetic health data.
Built for developers, health apps, and next-gen CGM integrations.

[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)

---

## 📦 Installation

````bash
pnpm add @marklearst/diabetic-utils
# or
npm install @marklearst/diabetic-utils

## 🧪 Quick Start

```ts
import { estimateA1CFromAverage } from '@marklearst/diabetic-utils';

const a1c = estimateA1CFromAverage(100); // returns ~5.1

⚙️ Recommended package.json Scripts

```json
"scripts": {
  "dev": "vitest",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "build": "tsup src/index.ts --dts --format esm,cjs"
}
````

💡 Coming Soon

- 📈 Predictive A1C & glucose trends
- ⏱️ Time-in-range utils
- 🔄 Glucose unit conversions (mg/dL ⇄ mmol/L)
- 🏷️ Formatter & status labeling functions
- 📝 Typed result models & constants
- 📚 Docs site: diabeticutils.com

✍️ Author

Built by @marklearst

Pushing pixels with purpose. Tools for humans.
