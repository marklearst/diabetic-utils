# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-03-12

### Added
- **Advanced CGM Metrics Suite**: ADRR (Kovatchev 2006), GRADE with hypo/eu/hyper partitioning (Hill 2007), J-Index (Wojcicki 1995), CONGA intra-day variability (McDonnell 2005), Active Percent wear-time tracking (Danne 2017)
- **AGP Aggregate**: `calculateAGPMetrics()` computes all Tier 1 CGM metrics (mean, SD, CV, LBGI, HBGI, ADRR, GRADE, GRI, J-Index, MODD, CONGA, Active Percent) in a single call
- **LBGI / HBGI**: Low and High Blood Glucose Index risk scores (Kovatchev 2006)
- **GRI**: Glycemia Risk Index with zone A-E classification (Klonoff 2023)
- **MODD**: Mean of Daily Differences for day-to-day glucose variability (Service 1980)
- **CGM Connector Adapters**: `normalizeDexcomEntries()`, `normalizeLibreEntries()`, `normalizeNightscoutEntries()` — pure transformation helpers mapping vendor payloads into canonical `NormalizedCGMReading` type with trend and source metadata
- **FHIR CGM IG**: `buildFHIRCGMSummary()`, `buildFHIRSensorReading()`, `buildFHIRSensorReadings()` for HL7 FHIR-aligned CGM observation payloads
- **Open mHealth**: `buildOMHBloodGlucose()`, `buildOMHBloodGlucoseList()`, `buildOMHDataPoint()` for standards-compliant health data exchange
- Edge-case tests for out-of-order timestamps, mixed units, and cross-module interactions

### Changed
- Softened authority-implying medical language across documentation and code comments
- Test suite expanded from 295 to 337 passing tests, maintaining 100% coverage

### Fixed
- Enhanced TIR interval estimation now robust to unsorted timestamps
- FHIR component schema alignment and tighter Open mHealth types
- GRI and MODD calculations refined from review feedback

## [1.4.2] - 2024-11-11

### Documentation
- Complete README overhaul with v1.4.0 feature showcase
- Added working code examples for Enhanced TIR and Pregnancy TIR
- Improved structure and visual hierarchy
- Added architecture diagram and clinical references section
- Enhanced developer experience with copy-paste ready examples

## [1.4.1] - 2024-11-11

### Documentation
- Updated README with v1.4.0 feature examples
- Fixed broken code blocks in README
- Added Enhanced TIR usage examples
- Improved visual hierarchy and structure
- Added clinical references section

## [1.4.0] - 2024-11-11

### Added
- `GMI_COEFFICIENTS` constant with documented formula coefficients for GMI/A1C calculations
- [ConversionResult](src/types.ts:55:0-60:1) interface for type-safe glucose unit conversion returns
- Type predicates for better TypeScript type narrowing ([isValidInsulin](src/validators.ts:2:0-16:1))
- Test helpers module ([tests/test-helpers.ts](tests/test-helpers.ts:0:0-0:0)) with shared test utilities
- Enhanced TIR functions: [calculateEnhancedTIR()](src/tir-enhanced.ts:49:0-168:1) and [calculatePregnancyTIR()](src/tir-enhanced.ts:170:0-293:1)
- Comprehensive test suite for Enhanced TIR (205 tests, 100% coverage)

### Changed
- Improved type safety by removing `any` types from type guards
- Enhanced constants with `as const` assertions for literal type inference
- Refactored GMI calculation functions to use named constants instead of magic numbers
- Extracted helper functions in TIR/MAGE for better maintainability
- Added `@example` JSDoc tags to conversion functions
- Improved documentation with `@category` tags

### Fixed
- Test coverage now 100% across all metrics (statements, branches, functions, lines)
- Coverage edge cases in MAGE and TIR calculations
- Removed unused error parameter in MAGE catch block

### Developer Experience
- Better autocomplete with literal types
- Self-documenting code with named constants
- Reusable test helpers for consistent test data generation
- Working code examples in documentation

## [1.3.1] - 2024-11-10
- Previous release

## [1.1.0] - 2024-03-20

### Architecture Changes

- Migrated from nested directory structure to flat organization
- Consolidated related functionality into single, focused files
- Simplified import paths and reduced complexity

### File Consolidation

- Combined A1C calculations (`estimateA1C`, `estimateGMI`, `estimateEAG`) into `a1c.ts`
- Unified glucose unit conversions (`mgdlToMmol`, `mmolToMgdl`) into `conversions.ts`
- Merged glucose utilities (validation, formatting, status) into `glucose.ts`
- Consolidated time-in-range calculations into `tir.ts`
- Combined type guards into `guards.ts`
- Unified formatters into `formatters.ts`

### Testing Improvements

- Reorganized test files to mirror new structure
- Added comprehensive type definition tests
- Increased test coverage to 100% for all functional code
- Total test count increased from 34 to 63 tests

### Type System

- Centralized type definitions in `types.ts`
- Added explicit validation for type structures
- Improved type safety across the library

### Build & Configuration

- Updated build configuration for flat structure
- Optimized package exports configuration
- Maintained backward compatibility with existing APIs

This release focuses on improving maintainability and developer experience while preserving all existing functionality and type safety.
