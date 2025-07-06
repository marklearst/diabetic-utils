[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isValidGlucoseValue

# Function: isValidGlucoseValue()

> **isValidGlucoseValue**(`value`, `unit`): `boolean`

Defined in: [glucose.ts:112](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/glucose.ts#L112)

Validates a clinical glucose value and unit.
Ensures value is a positive finite number and unit is supported for analytics.

## Parameters

### value

`unknown`

Glucose value to validate

### unit

`unknown`

Glucose unit to validate

## Returns

`boolean`

True if value and unit are clinically valid
