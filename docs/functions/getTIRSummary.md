[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / getTIRSummary

# Function: getTIRSummary()

> **getTIRSummary**(`result`): `string`

Defined in: [tir.ts:49](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/tir.ts#L49)

Generates a clinical summary string from a TIRResult object.
Used for reporting and visualization of TIR analytics.

## Parameters

### result

[`TIRResult`](../interfaces/TIRResult.md)

TIR result breakdown to summarize

## Returns

`string`

String summarizing in-range, below-range, and above-range percentages (e.g., 'In Range: 70%, Below: 10%, Above: 20%')
