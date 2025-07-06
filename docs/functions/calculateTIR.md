[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / calculateTIR

# Function: calculateTIR()

> **calculateTIR**(`readings`, `target`): [`TIRResult`](../interfaces/TIRResult.md)

Defined in: [tir.ts:13](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/tir.ts#L13)

Calculates clinical Time in Range (TIR) metrics for glucose readings.
Returns the percentage of readings in, below, and above the specified clinical target range.

## Parameters

### readings

[`GlucoseReading`](../interfaces/GlucoseReading.md)[]

Array of glucose readings to analyze

### target

Object specifying the target range ({ min, max })

#### max

`number`

#### min

`number`

## Returns

[`TIRResult`](../interfaces/TIRResult.md)

Object with in-range, below-range, and above-range percentages

## See

https://care.diabetesjournals.org/content/42/8/1593
