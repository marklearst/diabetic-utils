[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / getGlucoseLabel

# Function: getGlucoseLabel()

> **getGlucoseLabel**(`val`, `unit`, `thresholds?`): `"normal"` \| `"low"` \| `"high"`

Defined in: [glucose.ts:62](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/glucose.ts#L62)

Returns a clinical glucose status label ('low', 'normal', or 'high') based on thresholds for the given unit.
Used for clinical charting, alerts, and reporting.

## Parameters

### val

`number`

Glucose value (number)

### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `MG_DL`

Glucose unit ('mg/dL' or 'mmol/L'), default: 'mg/dL'

### thresholds?

Optional custom thresholds for hypo/hyper ({ hypo?: { mgdl?: number; mmoll?: number }, hyper?: { mgdl?: number; mmoll?: number } })

#### hyper?

\{ `mgdl?`: `number`; `mmoll?`: `number`; \}

#### hyper.mgdl?

`number`

#### hyper.mmoll?

`number`

#### hypo?

\{ `mgdl?`: `number`; `mmoll?`: `number`; \}

#### hypo.mgdl?

`number`

#### hypo.mmoll?

`number`

## Returns

`"normal"` \| `"low"` \| `"high"`

'low', 'normal', or 'high' based on clinical thresholds

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-level-ranges.html
