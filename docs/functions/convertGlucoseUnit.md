[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / convertGlucoseUnit

# Function: convertGlucoseUnit()

> **convertGlucoseUnit**(`__namedParameters`): `object`

Defined in: [conversions.ts:160](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/conversions.ts#L160)

Converts clinical glucose value between mg/dL and mmol/L.
Used for clinical interoperability and analytics.

## Parameters

### \_\_namedParameters

#### unit

[`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

#### value

`number`

## Returns

`object`

Object with converted value and new unit

### unit

> **unit**: [`GlucoseUnit`](../type-aliases/GlucoseUnit.md)

### value

> **value**: `number`

## Throws

If value is not a finite number or is negative/zero

## Throws

If unit is not a supported glucose unit

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
