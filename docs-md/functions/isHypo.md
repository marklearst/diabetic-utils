[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isHypo

# Function: isHypo()

> **isHypo**(`val`, `unit`): `boolean`

Defined in: [glucose.ts:22](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/glucose.ts#L22)

Determines if a glucose value is below the hypoglycemia threshold for the given unit.

## Parameters

### val

`number`

Glucose value to check.

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `MG_DL`

Unit of measurement (mg/dL or mmol/L). Defaults to mg/dL.

## Returns

`boolean`

True if the value is below the hypoglycemia threshold, otherwise false.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
