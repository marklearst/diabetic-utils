[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / formatGlucose

# Function: formatGlucose()

> **formatGlucose**(`val`, `unit`, `options`): `string`

Defined in: [formatters.ts:14](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/formatters.ts#L14)

Formats a clinical glucose value with unit and optional rounding.
Used for clinical reporting, charting, and data export.

## Parameters

### val

`number`

Glucose value (number)

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

Glucose unit ('mg/dL' or 'mmol/L')

### options

Formatting options: { digits?: number; suffix?: boolean } (default: { digits: 0, suffix: true })

#### digits?

`number`

#### suffix?

`boolean`

## Returns

`string`

Formatted glucose string (e.g., '5.5 mmol/L', '120 mg/dL')

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
