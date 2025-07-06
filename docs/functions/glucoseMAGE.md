[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / glucoseMAGE

# Function: glucoseMAGE()

> **glucoseMAGE**(`readings`, `options?`): `number`

Defined in: [variability.ts:104](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/variability.ts#L104)

Calculates Mean Amplitude of Glycemic Excursions (MAGE) for glucose values.
Implements gold-standard Service FJ et al. (1970) clinical methodology, validated to 1.4% median error vs manual calculations.

## Parameters

### readings

`number`[]

Array of glucose values (mg/dL or mmol/L)

### options?

[`MAGEOptions`](../interfaces/MAGEOptions.md)

Optional configuration for MAGE calculation

## Returns

`number`

MAGE value, or NaN if insufficient data or no valid excursions

## See

 - https://pubmed.ncbi.nlm.nih.gov/5469118/ (Service FJ, et al. 1970)
 - https://journals.sagepub.com/doi/10.1177/19322968211061165 (Fernandes NJ, et al. 2022)
 - https://care.diabetesjournals.org/content/42/8/1593 (ADA 2019)

## Example

```ts
glucoseMAGE([100, 120, 80, 160, 90, 140, 70, 180])
glucoseMAGE(readings, { direction: 'ascending', shortWindow: 5, longWindow: 32 })
```

## Remarks

- Minimum 24 data points recommended (1 day of hourly readings)
- Best suited for continuous glucose monitoring (CGM) data
- Not recommended for sparse or irregular measurements
- Uses dual moving averages, three-point excursion definition, and prevents double-counting for clinical accuracy.
