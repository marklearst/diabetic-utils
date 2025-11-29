[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isHyper

# Function: isHyper()

> **isHyper**(`val`, `unit`, `thresholds?`): `boolean`

Defined in: [glucose.ts:43](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/glucose.ts#L43)

Checks if a glucose value is clinically hyperglycemic for the given unit.
Used for detecting high glucose events in clinical analytics and reporting.

## Parameters

### val

`number`

Glucose value (number)

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `MG_DL`

Glucose unit ('mg/dL' or 'mmol/L'), default: 'mg/dL'

### thresholds?

Optional custom thresholds ({ mgdl?: number; mmoll?: number })

#### mgdl?

`number`

#### mmoll?

`number`

## Returns

`boolean`

True if value is above clinical hyperglycemia threshold

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
