[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / mgDlToMmolL

# Function: mgDlToMmolL()

> **mgDlToMmolL**(`val`): `number`

Defined in: [conversions.ts:130](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L130)

Converts clinical glucose value from mg/dL to mmol/L.
Used for international interoperability and reporting.

## Parameters

### val

`number`

Glucose value in mg/dL

## Returns

`number`

Value in mmol/L

## Throws

If val is not a finite number or is negative/zero

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
