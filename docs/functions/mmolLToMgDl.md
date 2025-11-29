[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / mmolLToMgDl

# Function: mmolLToMgDl()

> **mmolLToMgDl**(`val`): `number`

Defined in: [conversions.ts:144](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L144)

Converts clinical glucose value from mmol/L to mg/dL.
Used for international interoperability and reporting.

## Parameters

### val

`number`

Glucose value in mmol/L

## Returns

`number`

Value in mg/dL

## Throws

If val is not a finite number or is negative/zero

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
