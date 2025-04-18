[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / calculateTimeInRange

# Function: calculateTimeInRange()

> **calculateTimeInRange**(`readings`, `lower`, `upper`): `number`

Defined in: [tir.ts:74](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/tir.ts#L74)

Calculates the percentage of readings within a specified numeric range.

## Parameters

### readings

`number`[]

Array of glucose values (numbers) to analyze.

### lower

`number`

Lower bound of the target range (inclusive).

### upper

`number`

Upper bound of the target range (inclusive).

## Returns

`number`

The percentage of readings within the specified range (0-100).
