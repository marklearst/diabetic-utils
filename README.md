# 🩸 Diabetic Utils

**The professional TypeScript toolkit for diabetes analytics and clinical-grade health data.**

![Diabetic Utils Logo](https://raw.githubusercontent.com/marklearst/diabetic-utils/refs/heads/main/assets/dujs.png)

A modern, strictly-typed utility library for glucose, A1C, insulin, and diabetes metrics. Designed for reliability, transparency, and real-world clinical use—no bloat, no guesswork, just robust utilities backed by authoritative clinical references.

> ⚠️ **v1.4+** features enhanced TIR calculations, 100% test coverage, zero `any` types, and clinical-grade glucose variability analytics. Trusted by developers, clinicians, and researchers.

---

## 📊 Status & Quality

![Status](https://img.shields.io/badge/status-stable-brightgreen)
[![codecov](https://codecov.io/gh/marklearst/diabetic-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/marklearst/diabetic-utils)
![CI](https://github.com/marklearst/diabetic-utils/actions/workflows/ci-cd.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25_Strict-blue?logo=typescript)
![Coverage](https://img.shields.io/badge/coverage-100%25-success)
![npm](https://img.shields.io/npm/v/diabetic-utils)
![npm downloads](https://img.shields.io/npm/dm/diabetic-utils)
![License](https://img.shields.io/github/license/marklearst/diabetic-utils)

---

## 🚀 What's New in v1.4.0

### 🎯 Enhanced Time-in-Range (TIR)
Clinical-grade TIR calculations per **International Consensus 2019** and **ADA 2024 Guidelines**:
- **5-Range Enhanced TIR**: Very Low, Low, In Range, High, Very High
- **Pregnancy TIR**: Tighter targets (63-140 mg/dL / 3.5-7.8 mmol/L)
- **Clinical Recommendations**: Automated insights based on targets
- **Population-Specific Goals**: Standard, older-adults, high-risk

### 🛡️ Type Safety Excellence
- **Zero `any` types** - Complete type safety throughout
- **Type Predicates** - Better TypeScript narrowing
- **Literal Types** - `as const` for autocomplete perfection
- **Named Return Types** - `ConversionResult` interface

### 📚 Self-Documenting Code
- **Named Constants**: `GMI_COEFFICIENTS` with clinical references
- **Working Examples**: Every function has `@example` tags
- **Test Helpers**: Reusable test utilities for your own projects

### ✅ 100% Test Coverage
- 205 passing tests
- Every line, branch, and function covered
- Defensive code properly documented

---

## 📦 Installation

```bash
npm install diabetic-utils
# or
pnpm add diabetic-utils
# or
yarn add diabetic-utils
```

**Requirements:** TypeScript 4.5+ or JavaScript (ES2020+)

---

## ⚡ Quick Start

### Basic Conversions & Calculations

```typescript
import {
  mgDlToMmolL,
  mmolLToMgDl,
  estimateGMI,
  estimateA1CFromAverage
} from 'diabetic-utils'

// Glucose unit conversions
mgDlToMmolL(180)  // → 10.0
mmolLToMgDl(5.5)  // → 99

// GMI calculation (multiple input formats)
estimateGMI(100, 'mg/dL')              // → 5.4
estimateGMI('5.5 mmol/L')              // → 5.4
estimateGMI({ value: 100, unit: 'mg/dL' })  // → 5.4

// A1C estimation
estimateA1CFromAverage(154, 'mg/dL')  // → 7.0
```

### Enhanced Time-in-Range (NEW!)

```typescript
import { calculateEnhancedTIR } from 'diabetic-utils'
import type { GlucoseReading } from 'diabetic-utils'

const readings: GlucoseReading[] = [
  { value: 120, unit: 'mg/dL', timestamp: '2024-01-01T08:00:00Z' },
  { value: 95,  unit: 'mg/dL', timestamp: '2024-01-01T08:05:00Z' },
  { value: 180, unit: 'mg/dL', timestamp: '2024-01-01T08:10:00Z' },
  // ... more readings
]

const result = calculateEnhancedTIR(readings)

console.log(`TIR: ${result.inRange.percentage}%`)
// TIR: 72.5%

console.log(`Very Low: ${result.veryLow.percentage}%`)
// Very Low: 0.5%

console.log(`Assessment: ${result.meetsTargets.overallAssessment}`)
// Assessment: good

console.log(result.meetsTargets.recommendations)
// ['Excellent glycemic control! All metrics meet clinical targets...']
```

### Pregnancy TIR (NEW!)

```typescript
import { calculatePregnancyTIR } from 'diabetic-utils'

const result = calculatePregnancyTIR(readings)

console.log(`TIR (63-140 mg/dL): ${result.inRange.percentage}%`)
// TIR (63-140 mg/dL): 85.2%

console.log(`Meets pregnancy targets: ${result.meetsPregnancyTargets}`)
// Meets pregnancy targets: true

console.log(result.recommendations)
// ['Excellent glycemic control for pregnancy!...']
```

### Glucose Labeling & Validation

```typescript
import {
  getGlucoseLabel,
  isHypo,
  isHyper,
  isValidGlucoseValue
} from 'diabetic-utils'

// Label glucose values
getGlucoseLabel(60, 'mg/dL')   // → 'low'
getGlucoseLabel(5.5, 'mmol/L') // → 'normal'
getGlucoseLabel(200, 'mg/dL')  // → 'high'

// Clinical checks
isHypo(65, 'mg/dL')   // → true
isHyper(180, 'mg/dL') // → false

// Validation
isValidGlucoseValue(120, 'mg/dL')  // → true
isValidGlucoseValue(-10, 'mg/dL')  // → false
```

### Clinical Variability Analytics

```typescript
import {
  glucoseStandardDeviation,
  glucoseCoefficientOfVariation,
  glucosePercentiles,
  calculateMAGE
} from 'diabetic-utils'

const data = [90, 100, 110, 120, 130, 140, 150, 160, 170, 180]

// Standard deviation (unbiased sample SD, n-1)
glucoseStandardDeviation(data)  // → 30.28

// Coefficient of variation (CV%)
glucoseCoefficientOfVariation(data)  // → 22.43

// Percentiles (nearest-rank method)
glucosePercentiles(data, [10, 50, 90])
// → { 10: 90, 50: 130, 90: 170 }

// MAGE (Mean Amplitude of Glycemic Excursions)
const mage = calculateMAGE(readings)
console.log(`MAGE: ${mage.value} mg/dL`)
```

### Custom Thresholds

```typescript
import { getGlucoseLabel, isHypo, getA1CCategory } from 'diabetic-utils'

// Custom hypoglycemia threshold
isHypo(75, 'mg/dL', { mgdl: 80 })  // → true

// Custom hyperglycemia threshold
isHyper(9.0, 'mmol/L', { mmoll: 8.5 })  // → true

// Custom glucose label thresholds
getGlucoseLabel(75, 'mg/dL', {
  hypo: { mgdl: 80 },
  hyper: { mgdl: 160 }
})  // → 'low'

// Custom A1C category cutoffs
getA1CCategory(6.5, {
  normalMax: 6.0,
  prediabetesMax: 7.0
})  // → 'prediabetes'
```

---

## 🌟 Features

### Core Utilities
- ✅ **Glucose Conversions**: mg/dL ⇄ mmol/L
- ✅ **A1C Calculations**: GMI, eAG, A1C estimation
- ✅ **Time-in-Range**: Enhanced TIR (5 ranges), Pregnancy TIR
- ✅ **HOMA-IR**: Insulin resistance calculation
- ✅ **Variability Metrics**: SD, CV, MAGE, percentiles
- ✅ **Validation**: Input guards, string parsing
- ✅ **Labeling**: Glucose status (low/normal/high)

### Quality & DX
- ✅ **TypeScript-First**: 100% strict mode, zero `any` types
- ✅ **100% Test Coverage**: 205 tests, all edge cases covered
- ✅ **Zero Dependencies**: No bloat, tree-shakable
- ✅ **Clinical References**: ADA, CDC, ISPAD, PubMed citations
- ✅ **TSDoc**: Complete API documentation
- ✅ **ESM + CJS**: Works everywhere
- ✅ **Type Predicates**: Better type narrowing
- ✅ **Named Constants**: Self-documenting formulas

---

## 🏆 Why Choose Diabetic Utils?

### Clinical-Grade Accuracy
Every formula, threshold, and calculation is sourced from authoritative clinical guidelines:
- **International Consensus on Time in Range (2019)** - TIR calculations
- **ADA Standards of Care (2024)** - Pregnancy targets, A1C guidelines
- **ISPAD Guidelines (2018)** - Glucose variability metrics
- **NIH/NIDDK** - HOMA-IR, eAG formulas

### Production-Ready
- **100% Test Coverage** - Every line tested
- **Type-Safe** - Catch errors at compile time
- **Zero Dependencies** - Small bundle, no supply chain risk
- **Modern ESM** - Tree-shakable, works with Vite, Next.js, etc.

### Developer-Friendly
- **Clear API** - Predictable function signatures
- **Great DX** - Autocomplete with literal types
- **Working Examples** - Copy-paste ready code
- **Test Helpers** - Utilities for your own tests

### Unique Features
**Only TypeScript/JavaScript library with:**
- Enhanced TIR (5-range breakdown)
- Pregnancy-specific TIR metrics
- Clinical-grade MAGE calculation
- Type predicates for validation

---

## 📚 Full API Reference

### Glucose Conversions
- `mgDlToMmolL(value)` - Convert mg/dL to mmol/L
- `mmolLToMgDl(value)` - Convert mmol/L to mg/dL
- `convertGlucoseUnit({ value, unit })` - Generic unit conversion

### A1C & GMI
- `estimateA1CFromAverage(glucose, unit)` - A1C from average glucose
- `estimateGMI(input, unit?)` - GMI from average glucose
- `a1cToGMI(a1c)` - Convert A1C to GMI
- `a1cToAverageGlucose(a1c, unit)` - A1C to eAG

### Time-in-Range
- `calculateTimeInRange(readings, low, high)` - Basic TIR
- `calculateEnhancedTIR(readings, options?)` - 5-range TIR
- `calculatePregnancyTIR(readings, options?)` - Pregnancy TIR

### Glucose Analysis
- `getGlucoseLabel(value, unit, thresholds?)` - Label as low/normal/high
- `isHypo(value, unit, threshold?)` - Check hypoglycemia
- `isHyper(value, unit, threshold?)` - Check hyperglycemia
- `isValidGlucoseValue(value, unit)` - Validate glucose value

### A1C Analysis
- `getA1CCategory(a1c, cutoffs?)` - Categorize A1C
- `isA1CInTarget(a1c, target?)` - Check if A1C meets target

### Variability Metrics
- `glucoseStandardDeviation(readings)` - SD (unbiased)
- `glucoseCoefficientOfVariation(readings)` - CV%
- `glucosePercentiles(readings, percentiles)` - Percentile ranks
- `calculateMAGE(readings)` - Mean Amplitude of Glycemic Excursions

### Insulin Metrics
- `calculateHOMAIR(glucose, insulin, unit)` - HOMA-IR
- `isValidInsulin(value)` - Validate insulin value

### Utilities
- `parseGlucoseString(str)` - Parse "120 mg/dL" → { value, unit }
- `formatGlucose(value, unit)` - Format glucose with unit
- `isValidGlucoseString(str)` - Validate glucose string

**[View Complete API Docs →](https://marklearst.github.io/diabetic-utils/)**

---

## 🧪 Test Helpers (NEW!)

Use our test utilities in your own projects:

```typescript
import {
  createGlucoseReadings,
  COMMON_TEST_VALUES,
  TEST_TIMESTAMP_BASE
} from 'diabetic-utils/tests/test-helpers'

// Create test data easily
const readings = createGlucoseReadings([100, 110, 120], 'mg/dL', 5)
// → 3 readings at 5-minute intervals

// Use common test values
const { NORMAL_GLUCOSE_MGDL, HYPO_GLUCOSE_MGDL } = COMMON_TEST_VALUES
```

---

## 🔬 Clinical References

All calculations are based on peer-reviewed clinical sources:

- **Time-in-Range**: [International Consensus (2019)](https://diabetesjournals.org/care/article/42/8/1593)
- **Pregnancy TIR**: [ADA Standards of Care (2024)](https://diabetesjournals.org/care/article/47/Supplement_1/S282)
- **A1C/eAG**: [Nathan et al. (2008)](https://diabetesjournals.org/care/article/31/8/1473)
- **HOMA-IR**: [Matthews et al. (1985)](https://diabetesjournals.org/diabetes/article/34/12/1212)
- **MAGE**: [Service et al. (1970)](https://diabetesjournals.org/diabetes/article/19/9/644)
- **Variability**: [ISPAD Guidelines (2018)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/)

---

## 🏗️ Architecture

```
diabetic-utils/
├── src/
│   ├── index.ts           # Main exports
│   ├── constants.ts       # Clinical thresholds & formulas
│   ├── types.ts           # TypeScript types
│   ├── conversions.ts     # Glucose unit conversions
│   ├── a1c.ts            # A1C & GMI calculations
│   ├── tir.ts            # Basic time-in-range
│   ├── tir-enhanced.ts   # Enhanced & pregnancy TIR
│   ├── glucose.ts        # Glucose utilities
│   ├── alignment.ts      # HOMA-IR
│   ├── variability.ts    # SD, CV, percentiles
│   ├── mage.ts           # MAGE calculation
│   ├── formatters.ts     # String formatting
│   ├── guards.ts         # Type guards
│   └── validators.ts     # Input validation
├── tests/
│   ├── test-helpers.ts   # Shared test utilities
│   └── *.test.ts         # 100% coverage tests
└── dist/                 # Built output (ESM + CJS)
```

**Key Principles:**
- ✅ Zero dependencies
- ✅ Tree-shakable modules
- ✅ Strict TypeScript
- ✅ 100% test coverage
- ✅ Clinical references in TSDoc

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feat/my-feature`
3. **Add tests** for any new functionality
4. **Ensure** 100% coverage: `pnpm test:coverage`
5. **Commit** with [conventional commits](https://www.conventionalcommits.org/): `git commit -m "feat: add new feature"`
6. **Push** to your branch: `git push origin feat/my-feature`
7. **Open** a pull request

### Development Commands

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build library
pnpm build

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

© 2024–2025 [Mark Learst](https://marklearst.com)

Use it, fork it, build something that matters.

---

## 🔗 Links

- 📦 [NPM Package](https://www.npmjs.com/package/diabetic-utils)
- 📚 [API Documentation](https://marklearst.github.io/diabetic-utils/)
- 🐙 [GitHub Repository](https://github.com/marklearst/diabetic-utils)
- 🌐 [Website](https://diabeticutils.com) _(coming soon)_

---

## 🙋‍♂️ Author

**Mark Learst**
Full-stack developer, diabetes advocate, and open source contributor.

- 🐦 X (Twitter): [@marklearst](https://x.com/marklearst)
- 💼 LinkedIn: [Mark Learst](https://linkedin.com/in/marklearst)
- 🌐 Portfolio: [marklearst.com](https://marklearst.com)

> 💬 Using diabetic-utils in your project? [Let me know](https://x.com/marklearst)—I'd love to feature it!
> ⭐ Star the repo and help us build the best diabetes toolkit together!

---

## 💬 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/marklearst/diabetic-utils/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/marklearst/diabetic-utils/discussions)
- 📧 **Email**: mark@marklearst.com

---

## 📝 A Personal Note

I built diabetic-utils because I believe in the power of data-driven diabetes management. As someone who's lived with diabetes, I know how hard it can be to make sense of the numbers.

That's why I've poured my heart into creating a library that's both **clinically accurate** and **easy to use**. Whether you're building an app, working on research, or just trying to understand your own data, I hope diabetic-utils can help.

Let's work together to make diabetes management better, one data point at a time. 🩸

---

**Built with ❤️ by the diabetes community, for the diabetes community.**
