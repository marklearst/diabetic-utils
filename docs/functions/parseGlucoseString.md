[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / parseGlucoseString

# Function: parseGlucoseString()

> **parseGlucoseString**(`input`): `object`

Defined in: [glucose.ts:85](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/glucose.ts#L85)

Parses a clinical glucose string (e.g., "100 mg/dL", "5.5 mmol/L") into value and unit.
Used for robust input validation and clinical data ingestion.

## Parameters

### input

`string`

String in the format "value unit" (e.g., "100 mg/dL")

## Returns

`object`

Object with numeric value and validated unit

### unit

> **unit**: [`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

### value

> **value**: `number`

## Throws

If input string is invalid or not in expected format

## Example

```ts
parseGlucoseString("100 mg/dL") // { value: 100, unit: "mg/dL" }
```

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
