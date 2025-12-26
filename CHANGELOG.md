# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
