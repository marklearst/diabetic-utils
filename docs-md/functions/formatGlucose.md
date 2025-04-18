[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / formatGlucose

# Function: formatGlucose()

> **formatGlucose**(`val`, `unit`, `options`): `string`

Defined in: [formatters.ts:13](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/formatters.ts#L13)

Formats a glucose value with its unit and optional rounding.

## Parameters

### val

`number`

Glucose value to format.

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

Unit of measurement (mg/dL or mmol/L).

### options

Formatting options: number of digits and whether to include the unit suffix (default: { digits: 0, suffix: true }).

#### digits?

`number`

#### suffix?

`boolean`

## Returns

`string`

Formatted glucose string, e.g., '5.5 mmol/L' or '120 mg/dL'.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
