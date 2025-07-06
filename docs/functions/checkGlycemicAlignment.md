[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / checkGlycemicAlignment

# Function: checkGlycemicAlignment()

> **checkGlycemicAlignment**(`a1c`, `glucose`, `insulin`): `object`

Defined in: alignment.ts:96

Checks clinical consistency among A1C, fasting glucose, and fasting insulin markers.

Returns:
  - Estimated average glucose (mg/dL), calculated per CDC formula
  - HOMA-IR result (value and interpretation)
  - Flags for potential inconsistencies
  - Educational recommendation and disclaimer

Used for high-level clinical insight and trend alignment, not for diagnosis.

## Parameters

### a1c

`number`

A1C value (percentage). Must be a positive finite number.

### glucose

`number`

Fasting glucose value in mg/dL. Must be a positive finite number.

### insulin

`number`

Fasting insulin value in µIU/mL. Must be a positive finite number.

## Returns

`object`

Object with estimated average glucose (mg/dL), HOMA-IR result object, flags array, recommendation string, and disclaimer.

### disclaimer

> **disclaimer**: `string` = `'This tool is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment.'`

### estimatedAverageGlucose

> **estimatedAverageGlucose**: `number` = `estimatedAvg`

### flags

> **flags**: `string`[]

### homaIR

> **homaIR**: `object` = `homaResult`

#### homaIR.interpretation

> **interpretation**: `string`

#### homaIR.value

> **value**: `number` = `score`

### recommendation

> **recommendation**: `string`

## Throws

If any input value is invalid (non-finite, zero, or negative).

## See

https://www.cdc.gov/diabetes/diabetes-testing/prediabetes-a1c-test.html (CDC: eAG formula)
