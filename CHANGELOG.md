# Changelog

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
