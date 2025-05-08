[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / groupByDay

# Function: groupByDay()

> **groupByDay**(`readings`): `Record`\<`string`, [`GlucoseReading`](../interfaces/GlucoseReading.md)[]\>

Defined in: [tir.ts:56](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/tir.ts#L56)

Groups glucose readings by date (YYYY-MM-DD).

## Parameters

### readings

[`GlucoseReading`](../interfaces/GlucoseReading.md)[]

Array of glucose readings to group.

## Returns

`Record`\<`string`, [`GlucoseReading`](../interfaces/GlucoseReading.md)[]\>

An object mapping each date string to an array of readings for that day.
