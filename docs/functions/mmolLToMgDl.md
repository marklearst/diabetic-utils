[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / mmolLToMgDl

# Function: mmolLToMgDl()

> **mmolLToMgDl**(`val`): `number`

Defined in: [conversions.ts:144](https://github.com/marklearst/glucoseiq/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L144)

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

https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BIOPRO_L.htm
