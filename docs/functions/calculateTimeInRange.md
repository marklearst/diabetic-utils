[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / calculateTimeInRange

# Function: calculateTimeInRange()

> **calculateTimeInRange**(`readings`, `lower`, `upper`): `number`

Defined in: [tir.ts:77](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/tir.ts#L77)

Calculates the percentage of glucose readings within a specified numeric range.
Used for clinical TIR analytics and custom range assessments.

## Parameters

### readings

`number`[]

Array of glucose values (numbers) to analyze

### lower

`number`

Lower bound of the target range (inclusive)

### upper

`number`

Upper bound of the target range (inclusive)

## Returns

`number`

Percentage of readings within the specified range (0-100)
