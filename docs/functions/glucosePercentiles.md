[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / glucosePercentiles

# Function: glucosePercentiles()

> **glucosePercentiles**(`readings`, `percentiles`): `Record`\<`number`, `number`\>

Defined in: [variability.ts:73](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/variability.ts#L73)

Calculates specified percentiles from an array of glucose values using the nearest-rank method.
Used for clinical analytics and glucose variability assessment.

## Parameters

### readings

`number`[]

Array of glucose values (numbers)

### percentiles

`number`[]

Array of percentiles to calculate (e.g., [10, 25, 50, 75, 90])

## Returns

`Record`\<`number`, `number`\>

Object mapping percentile to value, or {} if input is empty

## Throws

If readings or percentiles is not an array

## See

 - https://en.wikipedia.org/wiki/Percentile
 - https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/ (ISPAD 2019)

## Example

```ts
glucosePercentiles([100, 120, 140, 160, 180], [10, 50, 90]) // { 10: 100, 50: 140, 90: 180 }
glucosePercentiles([], [10, 50, 90]) // {}
```

## Remarks

- Returns the value at the nearest-rank for each percentile.
- If readings is empty, returns an empty object.
- Percentiles outside [0, 100] are ignored.
