/**
 * @file src/metrics/index.ts
 *
 * Advanced CGM analytics metrics.
 * LBGI/HBGI, ADRR, GRADE, GRI, J-Index, CONGA, MODD, Active Percent,
 * and the aggregate calculateAGPMetrics function.
 */

export { glucoseLBGI, glucoseHBGI, fbg } from './bgi'
export { calculateADRR } from './adrr'
export { calculateGRADE, type GRADEResult } from './grade'
export { calculateGRI, type GRIInput, type GRIResult } from './gri'
export { calculateJIndex } from './jindex'
export { calculateMODD, type MODDOptions } from './modd'
export { calculateCONGA, type CONGAOptions } from './conga'
export { calculateActivePercent, type ActivePercentOptions, type ActivePercentResult } from './active-percent'
export { calculateAGPMetrics, type AGPMetricsOptions, type AGPMetricsResult } from './agp'
