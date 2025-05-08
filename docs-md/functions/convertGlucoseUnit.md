[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / convertGlucoseUnit

# Function: convertGlucoseUnit()

> **convertGlucoseUnit**(`__namedParameters`): `object`

Defined in: [conversions.ts:153](https://github.com/marklearst/diabetic-utils/blob/eb1ce0a8bb58eaa6c7bbfdb97ff24106b8893a34/src/conversions.ts#L153)

Converts glucose value between mg/dL and mmol/L.

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

If value is not a finite number or is negative/zero.

## Throws

If unit is not a supported glucose unit.

## See

https://www.diabetes.co.uk/diabetes_care/blood-sugar-conversion.html
