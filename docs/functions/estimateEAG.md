[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / estimateEAG

# Function: estimateEAG()

> **estimateEAG**(`a1c`): `number`

Defined in: [conversions.ts:45](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L45)

Estimates eAG (estimated average glucose, mg/dL) from clinical A1C value.
Throws if input is negative. Used for clinical and research reporting.

## Parameters

### a1c

`number`

A1C value (percentage)

## Returns

`number`

Estimated average glucose (mg/dL)

## Throws

If a1c is negative

## See

https://www.cdc.gov/diabetes/managing/managing-blood-sugar/a1c.html
