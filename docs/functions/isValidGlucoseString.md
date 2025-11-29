[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isValidGlucoseString

# Function: isValidGlucoseString()

> **isValidGlucoseString**(`input`): `input is string`

Defined in: [guards.ts:30](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/guards.ts#L30)

Validates a clinical glucose string (e.g., "100 mg/dL", "5.5 mmol/L").
Ensures the string is in a recognized clinical format for glucose values, supporting safe parsing and conversion.

## Parameters

### input

`unknown`

Value to check as a clinical glucose string.

## Returns

`input is string`

True if input is a valid glucose string for clinical use.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
