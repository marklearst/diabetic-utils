[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / estimateGMI

# Function: estimateGMI()

> **estimateGMI**(`valueOrOptions`, `unit?`): `number`

Defined in: [conversions.ts:89](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L89)

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
