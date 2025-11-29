[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / formatPercentage

# Function: formatPercentage()

> **formatPercentage**(`val`, `digits`): `string`

Defined in: [formatters.ts:32](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/formatters.ts#L32)

Formats a value as a clinical percentage string (e.g., '85.0%').
Used for reporting TIR, CV, and other clinical metrics.

## Parameters

### val

`number`

Value to format (fraction or percent)

### digits

`number` = `1`

Number of decimal places (default: 1)

## Returns

`string`

Formatted percentage string (e.g., '85.0%')
