# Getting Started with diabetic-utils

Welcome to **diabetic-utils** – the modern, zero-bloat TypeScript utility library for diabetes data!

## 📦 Installation

> **Note:** diabetic-utils is not yet published to NPM. Stay tuned for the v1.0.0 launch!

_If you want to try it early, you can install directly from GitHub:_

```sh
pnpm add marklearst/diabetic-utils
# or
npm install github:marklearst/diabetic-utils
# or
yarn add github:marklearst/diabetic-utils
```

## ⚡ Quick Usage Examples

```ts
import {
  mgdlToMmol,
  mmolToMgdl,
  estimateA1CFromAverage,
  calculateTimeInRange,
  formatGlucose,
  labelGlucoseStatus,
  parseGlucoseString,
  isValidGlucoseValue,
} from 'diabetic-utils'

// Convert mg/dL to mmol/L
const glucoseMgdl = 120
const glucoseMmol = mgdlToMmol(glucoseMgdl) // 6.66

// Convert mmol/L to mg/dL
const glucoseMmol2 = 7.2
const glucoseMgdl2 = mmolToMgdl(glucoseMmol2) // 130

// Estimate A1C from mg/dL
const a1c = estimateA1CFromAverage(glucoseMgdl, 'mg/dL') // 5.9

// Estimate A1C from mmol/L
const a1c2 = estimateA1CFromAverage(glucoseMmol2, 'mmol/L') // 6.7

// Calculate Time-in-Range (TIR)
const readings = [90, 110, 150, 200, 80]
const tir = calculateTimeInRange(readings, 'mg/dL') // { inRange: 3, low: 1, high: 1 }

// Format glucose value
const formatted = formatGlucose(5.5, 'mmol/L') // '5.5 mmol/L'

// Label glucose status
const status = labelGlucoseStatus(65, 'mg/dL') // 'low'

// Parse a glucose string
const { value, unit } = parseGlucoseString('7.2 mmol/L')

// Validate a glucose value
const isValid = isValidGlucoseValue(value, unit) // true
```

---

![Coverage](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)

> **Test coverage:** 70% (aiming for 100% before v1.0.0 launch!)

---

## 🚦 Launch Status

- **Docs:** Complete and professional
- **Code structure:** Modular, clean, scalable
- **Test coverage:** 70% (final push to 100% for launch)
- **Error handling:** Final polish/edge cases in progress
- **CI/Codecov:** Set up for live badges
- **NPM publish:** Coming soon after above
- **Community/branding:** Ready (socials, website, call to action)

> **You're very close to a launch-ready 1.0.0!**
> Finalize coverage, polish, and CI, then publish and promote 🚀

## 🛠️ Why diabetic-utils?

- Zero-bloat, focused utilities
- 100% test coverage
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

See [Features](./features.md) for a full list of current, planned, and out-of-scope features.

---

## 🤝 Contributing

See [Contributing](./contributing.md) for how to get involved.

---

## ❓ FAQ

See [FAQ](./faq.md) for common questions and answers.
