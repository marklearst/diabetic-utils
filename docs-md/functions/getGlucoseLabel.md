[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / getGlucoseLabel

# Function: getGlucoseLabel()

> **getGlucoseLabel**(`val`, `unit`): `"normal"` \| `"low"` \| `"high"`

Defined in: [glucose.ts:46](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/glucose.ts#L46)

Returns a glucose status label ('low', 'normal', or 'high') based on thresholds for the given unit.

## Parameters

### val

`number`

Glucose value to label.

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `MG_DL`

Unit of measurement (mg/dL or mmol/L). Defaults to mg/dL.

## Returns

`"normal"` \| `"low"` \| `"high"`

'low' if below hypo threshold, 'high' if above hyper threshold, otherwise 'normal'.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
