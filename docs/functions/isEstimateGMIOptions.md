[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isEstimateGMIOptions

# Function: isEstimateGMIOptions()

> **isEstimateGMIOptions**(`input`): `input is EstimateGMIOptions`

Defined in: [guards.ts:10](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/guards.ts#L10)

Clinical type guard for EstimateGMIOptions.
Validates that the input matches the required shape for GMI estimation options (numeric value, string unit).
Useful for ensuring safe handling of clinical glucose data and interoperability with analytics functions.

## Parameters

### input

`unknown`

Candidate value to validate.

## Returns

`input is EstimateGMIOptions`

True if input is a valid EstimateGMIOptions object.
