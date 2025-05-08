[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / a1cTrend

# Function: a1cTrend()

> **a1cTrend**(`readings`): `"increasing"` \| `"decreasing"` \| `"stable"` \| `"insufficient data"`

Defined in: [a1c.ts:71](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/a1c.ts#L71)

Determines the trend of A1C values over time.

## Parameters

### readings

`number`[]

Array of A1C values (chronological order)

## Returns

`"increasing"` \| `"decreasing"` \| `"stable"` \| `"insufficient data"`

'increasing' | 'decreasing' | 'stable' | 'insufficient data'
