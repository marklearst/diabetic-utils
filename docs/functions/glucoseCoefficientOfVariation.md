[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / glucoseCoefficientOfVariation

# Function: glucoseCoefficientOfVariation()

> **glucoseCoefficientOfVariation**(`readings`): `number`

Defined in: [variability.ts:48](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/variability.ts#L48)

Calculates the coefficient of variation (CV) for glucose values.
CV = (SD / mean) × 100. Used to assess glycemic variability.

## Parameters

### readings

`number`[]

Array of glucose values (numbers)

## Returns

`number`

Coefficient of variation as a percentage, or NaN if <2 values or mean is 0

## Throws

If readings is not an array

## See

[ADA 2019: Glycemic Targets](https://care.diabetesjournals.org/content/42/8/1593)

## Example

```ts
glucoseCoefficientOfVariation([100, 120, 140]) // 18.26
glucoseCoefficientOfVariation([100]) // NaN
glucoseCoefficientOfVariation([]) // NaN
```

## Remarks

- If readings contains <2 values or mean is 0, returns NaN.
- Handles NaN/Infinity values by propagating them in the result.
