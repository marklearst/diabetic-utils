[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / getTIRSummary

# Function: getTIRSummary()

> **getTIRSummary**(`result`): `string`

Defined in: [tir.ts:47](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/tir.ts#L47)

Generates a human-readable summary string from a TIRResult object.

## Parameters

### result

[`TIRResult`](../interfaces/TIRResult.md)

The TIR result breakdown to summarize.

## Returns

`string`

A string summarizing the in-range, below-range, and above-range percentages (e.g., 'In Range: 70%, Below: 10%, Above: 20%').
