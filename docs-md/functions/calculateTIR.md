[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / calculateTIR

# Function: calculateTIR()

> **calculateTIR**(`readings`, `target`): [`TIRResult`](../interfaces/TIRResult.md)

Defined in: [tir.ts:12](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/tir.ts#L12)

Calculates the percentage of time glucose readings are in, below, and above a target range.

## Parameters

### readings

[`GlucoseReading`](../interfaces/GlucoseReading.md)[]

Array of glucose readings to analyze.

### target

Object specifying the target range with { min, max } values.

#### max

`number`

#### min

`number`

## Returns

[`TIRResult`](../interfaces/TIRResult.md)

An object with the percentage of readings in range, below range, and above range.

## See

https://care.diabetesjournals.org/content/42/8/1593
