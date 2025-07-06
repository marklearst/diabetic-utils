[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / a1cTrend

# Function: a1cTrend()

> **a1cTrend**(`readings`): `"increasing"` \| `"decreasing"` \| `"stable"` \| `"insufficient data"`

Defined in: [a1c.ts:88](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/a1c.ts#L88)

Determines the trend of A1C values over time.

## Parameters

### readings

`number`[]

Array of A1C values (chronological order)

## Returns

`"increasing"` \| `"decreasing"` \| `"stable"` \| `"insufficient data"`

'increasing' | 'decreasing' | 'stable' | 'insufficient data'
