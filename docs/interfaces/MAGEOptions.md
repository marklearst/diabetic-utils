[**diabetic-utils**](../README.md)

***

[diabetic-utils](../globals.md) / MAGEOptions

# Interface: MAGEOptions

Defined in: [mage.ts:118](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/mage.ts#L118)

Configuration options for clinical-grade MAGE calculation.

## Properties

### direction?

> `optional` **direction**: `"auto"` \| `"ascending"` \| `"descending"`

Defined in: [mage.ts:131](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/mage.ts#L131)

Excursion direction: 'auto', 'ascending', or 'descending'

***

### longWindow?

> `optional` **longWindow**: `number`

Defined in: [mage.ts:123](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/mage.ts#L123)

Long moving average window (default: 32)

***

### shortWindow?

> `optional` **shortWindow**: `number`

Defined in: [mage.ts:120](https://github.com/marklearst/diabetic-utils/blob/0d03b5cd2e2b5edbf58275075cc81d8df31ac230/src/mage.ts#L120)

Short moving average window (default: 5)
