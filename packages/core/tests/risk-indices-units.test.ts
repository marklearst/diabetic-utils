import { describe, it, expect } from 'vitest'
import {
  glucoseLBGI,
  glucoseHBGI,
  calculateGRADE,
  calculateJIndex,
} from '../src/metrics'
import { MGDL_MMOLL_CONVERSION } from '../src/constants'

// Same physiological trace expressed in both units.
const MGDL = [45, 65, 90, 120, 160, 210, 280]
const MMOL = MGDL.map((v) => v / MGDL_MMOLL_CONVERSION)

describe('risk indices are unit-aware', () => {
  it('LBGI: mmol/L input matches the mg/dL-equivalent result', () => {
    expect(glucoseLBGI(MMOL, 'mmol/L')).toBeCloseTo(glucoseLBGI(MGDL, 'mg/dL'), 6)
  })

  it('HBGI: mmol/L input matches the mg/dL-equivalent result', () => {
    expect(glucoseHBGI(MMOL, 'mmol/L')).toBeCloseTo(glucoseHBGI(MGDL, 'mg/dL'), 6)
  })

  it('J-Index: mmol/L input matches the mg/dL-equivalent result', () => {
    expect(calculateJIndex(MMOL, 'mmol/L')).toBeCloseTo(
      calculateJIndex(MGDL, 'mg/dL'),
      2
    )
  })

  it('GRADE: mmol/L input matches the mg/dL-equivalent result', () => {
    const fromMmol = calculateGRADE(MMOL, 70, 140, 'mmol/L')
    const fromMgdl = calculateGRADE(MGDL, 70, 140, 'mg/dL')
    expect(fromMmol.grade).toBeCloseTo(fromMgdl.grade, 2)
    expect(fromMmol.gradeHypoglycemia).toBeCloseTo(fromMgdl.gradeHypoglycemia, 2)
    expect(fromMmol.gradeEuglycemia).toBeCloseTo(fromMgdl.gradeEuglycemia, 2)
    expect(fromMmol.gradeHyperglycemia).toBeCloseTo(fromMgdl.gradeHyperglycemia, 2)
  })

  it('defaults to mg/dL so existing numeric outputs are unchanged (sacred math)', () => {
    expect(glucoseLBGI(MGDL)).toBe(glucoseLBGI(MGDL, 'mg/dL'))
    expect(glucoseHBGI(MGDL)).toBe(glucoseHBGI(MGDL, 'mg/dL'))
    expect(calculateJIndex(MGDL)).toBe(calculateJIndex(MGDL, 'mg/dL'))
    expect(calculateGRADE(MGDL)).toEqual(calculateGRADE(MGDL, 70, 140, 'mg/dL'))
  })

  it('confirms unit matters: mmol/L values mislabeled as mg/dL give a very different result', () => {
    expect(glucoseLBGI(MMOL)).not.toBeCloseTo(glucoseLBGI(MGDL, 'mg/dL'), 1)
  })
})
