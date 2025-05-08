[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / formatDate

# Function: formatDate()

> **formatDate**(`iso`, `timeZone?`): `string`

Defined in: [formatters.ts:44](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/formatters.ts#L44)

Formats a UTC ISO timestamp to a local-readable string.

## Parameters

### iso

`string`

ISO 8601 timestamp string (e.g., '2024-03-20T10:00:00Z').

### timeZone?

`string`

Optional IANA time zone name (e.g., 'America/New_York').

## Returns

`string`

Localized date and time string, e.g., 'Mar 20, 2024, 06:00 AM'.

## Throws

If the ISO string is invalid or cannot be parsed by Date.

## See

 - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 - https://en.wikipedia.org/wiki/ISO_8601
