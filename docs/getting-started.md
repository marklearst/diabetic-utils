# Getting Started with diabetic-utils

Welcome to **diabetic-utils** – the modern, zero-bloat TypeScript utility library for diabetes data!

## 📦 Installation

Install from npm:

```sh
npm install diabetic-utils
# or
pnpm add diabetic-utils
# or
yarn add diabetic-utils
```

## ⚡ Quick Usage Examples

```ts
import {
  mgDlToMmolL,
  mmolLToMgDl,
  estimateA1CFromAverage,
  calculateTIR,
  formatGlucose,
  parseGlucoseString,
  isValidGlucoseValue,
} from 'diabetic-utils'

// Convert mg/dL to mmol/L
const glucoseMgdl = 120
const glucoseMmol = mgDlToMmolL(glucoseMgdl) // 6.66

// Convert mmol/L to mg/dL
const glucoseMmol2 = 7.2
const glucoseMgdl2 = mmolLToMgDl(glucoseMmol2) // 130

// Estimate A1C from mg/dL
const a1c = estimateA1CFromAverage(glucoseMgdl, 'mg/dL') // 5.9

// Estimate A1C from mmol/L
const a1c2 = estimateA1CFromAverage(glucoseMmol2, 'mmol/L') // 6.7

// Calculate Time-in-Range (TIR)
const readings = [
  { value: 90, unit: 'mg/dL', timestamp: '2024-03-20T10:00:00Z' },
  { value: 110, unit: 'mg/dL', timestamp: '2024-03-20T11:00:00Z' },
  { value: 150, unit: 'mg/dL', timestamp: '2024-03-20T12:00:00Z' },
  { value: 200, unit: 'mg/dL', timestamp: '2024-03-20T13:00:00Z' },
  { value: 80, unit: 'mg/dL', timestamp: '2024-03-20T14:00:00Z' },
]
const tir = calculateTIR(readings, { min: 70, max: 180 }) // { inRange: 3, belowRange: 1, aboveRange: 1 }
// Format glucose value
const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'

// Parse a glucose string
const { value, unit } = parseGlucoseString('7.2 mmol/L')

// Validate a glucose value
const isValid = isValidGlucoseValue(value, unit) // true
```

---

![Coverage](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)

> **Test coverage:** 100% (v1.1.0)

---

## 🚦 Launch Status

- **Docs:** Up to date and professional
- **Code structure:** Flat, clean, and maintainable
- **Test coverage:** 100% (fully covered with Vitest)
- **Error handling:** Robust and type-safe
- **CI/Codecov:** Live badges and automated checks
- **NPM publish:** Live!
- **Community/branding:** Ready (socials, website, call to action)

> **You're ready for a modern, production-quality diabetes utility library!**

## 🛠️ Why diabetic-utils?

- Zero-bloat, focused utilities
- 100% test coverage
- Strict TypeScript throughout
- Modern build with tsup
- TypeScript-first, but works in JS too
- Perfect for apps, research, and data science

---

For more, see the [API Reference](./api-reference.md) and [Examples](./examples.md).

---

## 🚀 Connect & Community

**Follow, share, and help make diabetic-utils go viral!**

- X (Twitter): [@marklearst](https://x.com/marklearst)
- LinkedIn: [Mark Learst](https://linkedin.com/in/marklearst)
- GitHub: [marklearst](https://github.com/marklearst)
- Website: [diabetic-utils.health](https://diabetic-utils.health) _(coming soon)_

> 💬 Mention or DM me if you use diabetic-utils in your project—I'd love to feature your work!
>
> ⭐ Star the repo, share on socials, and help us build the best diabetes data toolkit together!

## 🧩 Features

See [Features](./features.md) for a full list of current, planned, and future features.

---

## 🤝 Contributing

See [Contributing](./contributing.md) for how to get involved.

---

## ❓ FAQ

See [FAQ](./faq.md) for common questions and answers.
