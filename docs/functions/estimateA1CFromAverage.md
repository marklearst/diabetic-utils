[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / estimateA1CFromAverage

# Function: estimateA1CFromAverage()

> **estimateA1CFromAverage**(`avgGlucose`, `unit`): `number`

Defined in: [conversions.ts:60](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L60)

Estimates A1C from average glucose.

## Parameters

### avgGlucose

`number`

Average glucose value

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `MG_DL`

Glucose unit (mg/dL or mmol/L)

## Returns

`number`

Estimated A1C

## See

https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
