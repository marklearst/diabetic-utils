[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isEstimateGMIOptions

# Function: isEstimateGMIOptions()

> **isEstimateGMIOptions**(`input`): `input is EstimateGMIOptions`

Defined in: [guards.ts:8](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/guards.ts#L8)

Type guard to check if a value is a valid EstimateGMIOptions object.

## Parameters

### input

`unknown`

The value to check for EstimateGMIOptions shape.

## Returns

`input is EstimateGMIOptions`

True if the input is an object with numeric 'value' and string 'unit' properties, otherwise false.
