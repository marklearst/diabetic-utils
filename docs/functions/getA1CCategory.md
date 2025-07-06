[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / getA1CCategory

# Function: getA1CCategory()

> **getA1CCategory**(`a1c`, `thresholds?`): `"normal"` \| `"prediabetes"` \| `"diabetes"` \| `"invalid"`

Defined in: [a1c.ts:41](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/a1c.ts#L41)

Returns the clinical category for an A1C value (normal, prediabetes, diabetes, or invalid).
Uses ADA thresholds by default, but allows custom cutoffs for research or population-specific use.

## Parameters

### a1c

`number`

A1C value (percentage)

### thresholds?

Optional custom thresholds: { normalMax?: number; prediabetesMax?: number }

#### normalMax?

`number`

#### prediabetesMax?

`number`

## Returns

`"normal"` \| `"prediabetes"` \| `"diabetes"` \| `"invalid"`

'normal' | 'prediabetes' | 'diabetes' | 'invalid'
