/**
 * @file src/errors.ts
 *
 * Typed error classes. Every intentional throw in @glucoseiq/core is a
 * GlucoseIQError subclass carrying a stable string `code`, so consumers can
 * `instanceof`-narrow or switch on `error.code` instead of matching message
 * strings. Messages are unchanged from earlier releases.
 */

/** Stable machine-readable error codes. */
export type GlucoseIQErrorCode =
  | 'EMPTY_DATASET'
  | 'INVALID_GLUCOSE_VALUE'
  | 'INVALID_A1C_VALUE'
  | 'INVALID_INSULIN_VALUE'
  | 'INVALID_UNIT'
  | 'INVALID_OPTION'
  | 'INVALID_TIMEZONE'
  | 'PARSE_FAILED'
  | 'CSV_COLUMN_NOT_FOUND'
  | 'TIMESTAMP_UNPARSEABLE'

/** Base class for all intentional @glucoseiq/core errors. */
export class GlucoseIQError extends Error {
  /** Stable machine-readable code. */
  readonly code: GlucoseIQErrorCode

  constructor(message: string, code: GlucoseIQErrorCode) {
    super(message)
    this.name = new.target.name
    this.code = code
  }
}

/** Input text (CSV, glucose string, payload) could not be parsed. */
export class ParseError extends GlucoseIQError {}

/** A value or option is outside its valid domain. */
export class DomainError extends GlucoseIQError {}

/** An operation requires data but the dataset is empty. */
export class EmptyDatasetError extends GlucoseIQError {
  constructor(message: string) {
    super(message, 'EMPTY_DATASET')
  }
}

/** A timestamp could not be parsed. */
export class TimestampError extends GlucoseIQError {
  constructor(message: string) {
    super(message, 'TIMESTAMP_UNPARSEABLE')
  }
}
