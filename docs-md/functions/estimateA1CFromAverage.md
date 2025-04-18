[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / estimateA1CFromAverage

# Function: estimateA1CFromAverage()

> **estimateA1CFromAverage**(`avgGlucose`, `unit`): `number`

Defined in: [conversions.ts:57](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/conversions.ts#L57)

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
