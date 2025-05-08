[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / parseGlucoseString

# Function: parseGlucoseString()

> **parseGlucoseString**(`input`): `object`

Defined in: [glucose.ts:64](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/glucose.ts#L64)

Parses a glucose string like "100 mg/dL" or "5.5 mmol/L" into a value and unit.

## Parameters

### input

`string`

A string in the format "value unit" (e.g., "100 mg/dL").

## Returns

`object`

An object with numeric `value` and validated `unit`.

### unit

> **unit**: [`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

### value

> **value**: `number`

## Throws

If the input string is invalid or not in the expected format.

## Example

```ts
parseGlucoseString("100 mg/dL") // { value: 100, unit: "mg/dL" }
```

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
