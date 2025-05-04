---
id: formatGlucose
title: formatGlucose
sidebar_label: formatGlucose
---

# formatGlucose

▸ **formatGlucose**(`value`: `number`, `unit`: [`GlucoseUnit`](../type-aliases/GlucoseUnit.md) = `'mg/dL'`): `string`

Formats a glucose value with the appropriate unit.

## Parameters

| Name    | Type                                            | Default   | Description                                           |
| :------ | :---------------------------------------------- | :-------- | :---------------------------------------------------- |
| `value` | `number`                                        | -         | The glucose value to format                           |
| `unit`  | [`GlucoseUnit`](../type-aliases/GlucoseUnit.md) | `'mg/dL'` | The unit to format the value in ('mg/dL' or 'mmol/L') |

## Returns

`string`

The formatted glucose value with unit

## Example

```typescript
import { formatGlucose } from 'diabetic-utils'

console.log(formatGlucose(120)) // "120 mg/dL"
console.log(formatGlucose(6.7, 'mmol/L')) // "6.7 mmol/L"
```

## Source

[formatters.ts:12](https://github.com/your-username/diabetic-utils/blob/main/src/formatters.ts#L12)
