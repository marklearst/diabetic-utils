[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isValidGlucoseValue

# Function: isValidGlucoseValue()

> **isValidGlucoseValue**(`value`, `unit`): `boolean`

Defined in: [glucose.ts:90](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/glucose.ts#L90)

Checks if a glucose value and unit are valid.

## Parameters

### value

`unknown`

Glucose value to validate.

### unit

`unknown`

Glucose unit to validate.

## Returns

`boolean`

True if the value is a positive finite number and the unit is supported, otherwise false.
