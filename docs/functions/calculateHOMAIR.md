[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / calculateHOMAIR

# Function: calculateHOMAIR()

> **calculateHOMAIR**(`glucose`, `insulin`): `object`

Defined in: alignment.ts:34

Calculates HOMA-IR (Homeostatic Model Assessment for Insulin Resistance) from fasting glucose and insulin.

Formula: HOMA-IR = (fasting glucose [mg/dL] × fasting insulin [µIU/mL]) / 405

Used for estimating insulin resistance in clinical analytics and research. Not a diagnostic tool—interpret with clinical context.

## Parameters

### glucose

`number`

Fasting glucose value in mg/dL. Must be a positive finite number.

### insulin

`number`

Fasting insulin value in µIU/mL. Must be a positive finite number.

## Returns

`object`

Object with numeric HOMA-IR value and clinical interpretation label.

### interpretation

> **interpretation**: `string`

### value

> **value**: `number` = `score`

## Throws

If glucose or insulin are invalid (non-finite, zero, or negative).

## See

 - https://pubmed.ncbi.nlm.nih.gov/3899825/ (Original HOMA-IR publication)
 - https://diabetesjournals.org/care/article/26/1/118/22567/Prevalence-and-Concomitants-of-Glucose-Intolerance (ADA: Glucose Intolerance and HOMA-IR context)
