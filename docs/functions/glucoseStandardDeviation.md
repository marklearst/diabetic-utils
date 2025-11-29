[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / glucoseStandardDeviation

# Function: glucoseStandardDeviation()

> **glucoseStandardDeviation**(`readings`): `number`

Defined in: [variability.ts:23](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/variability.ts#L23)

Calculates the unbiased sample standard deviation (SD) of glucose values.
Uses n-1 in the denominator (sample SD), as recommended in clinical research and guidelines.

## Parameters

### readings

`number`[]

Array of glucose values (numbers)

## Returns

`number`

Standard deviation, or NaN if fewer than 2 values

## Throws

If readings is not an array

## See

 - [ADA 2019: Glycemic Targets](https://care.diabetesjournals.org/content/42/8/1593)
 - [ISPAD 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7445493/)

## Example

```ts
glucoseStandardDeviation([100, 120, 140]) // 20
glucoseStandardDeviation([]) // NaN
```

## Remarks

- If readings contains <2 values, returns NaN (not enough data for SD).
- Handles NaN/Infinity values by propagating them in the result.
