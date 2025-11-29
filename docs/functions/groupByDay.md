[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / groupByDay

# Function: groupByDay()

> **groupByDay**(`readings`): `Record`\<`string`, [`GlucoseReading`](../interfaces/GlucoseReading.md)[]\>

Defined in: [tir.ts:58](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/tir.ts#L58)

Groups glucose readings by date (YYYY-MM-DD).

## Parameters

### readings

[`GlucoseReading`](../interfaces/GlucoseReading.md)[]

Array of glucose readings to group.

## Returns

`Record`\<`string`, [`GlucoseReading`](../interfaces/GlucoseReading.md)[]\>

An object mapping each date string to an array of readings for that day.
