[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / isA1CInTarget

# Function: isA1CInTarget()

> **isA1CInTarget**(`a1c`, `target`, `thresholds?`): `boolean`

Defined in: [a1c.ts:60](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/a1c.ts#L60)

Checks if an A1C value is within a target range.

## Parameters

### a1c

`number`

A1C value

### target

\[`number`, `number`\] = `...`

[min, max] range (default: [6.5, 7.0])

### thresholds?

Optional custom thresholds: { min?: number; max?: number }

#### max?

`number`

#### min?

`number`

## Returns

`boolean`

True if in target range
