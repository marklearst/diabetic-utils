[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isValidGlucoseString

# Function: isValidGlucoseString()

> **isValidGlucoseString**(`input`): `input is string`

Defined in: [guards.ts:27](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/guards.ts#L27)

Checks if a string is in the format "100 mg/dL" or "5.5 mmol/L".

## Parameters

### input

`unknown`

The value to validate as a glucose string.

## Returns

`input is string`

True if the input is a string matching the glucose value and unit format, otherwise false.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
