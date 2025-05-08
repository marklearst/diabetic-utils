[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / estimateGMI

# Function: estimateGMI()

> **estimateGMI**(`valueOrOptions`, `unit?`): `number`

Defined in: [conversions.ts:85](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/conversions.ts#L85)

Estimate Glucose Management Indicator (GMI) from average glucose.

## Parameters

### valueOrOptions

Glucose value, string, or options object

`string` | `number` | [`EstimateGMIOptions`](../interfaces/EstimateGMIOptions.md)

### unit?

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

Glucose unit (if value is a number)

## Returns

`number`

GMI value

## Throws

If unit is required but not provided when input is a number.

## Throws

If the glucose unit is unsupported.

## Throws

If the glucose value is not a positive number.

## See

https://diatribe.org/glucose-management-indicator-gmi
