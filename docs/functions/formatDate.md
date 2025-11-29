[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / formatDate

# Function: formatDate()

> **formatDate**(`iso`, `timeZone?`): `string`

Defined in: [formatters.ts:44](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/formatters.ts#L44)

Formats a UTC ISO 8601 timestamp to a local-readable date/time string.
Used for clinical charting, logs, and reports. Supports optional IANA time zone.

## Parameters

### iso

`string`

ISO 8601 timestamp string (e.g., '2024-03-20T10:00:00Z')

### timeZone?

`string`

Optional IANA time zone (e.g., 'America/New_York')

## Returns

`string`

Localized date/time string (e.g., 'Mar 20, 2024, 06:00 AM')

## Throws

If the ISO string is invalid or cannot be parsed
