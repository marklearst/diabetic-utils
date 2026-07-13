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
export {
  buildAGPProfile,
  type AGPProfileOptions,
  type AGPProfileBin,
  type AGPProfileResult,
  type PercentileMethod,
} from './agp-profile'
export { glucoseAUC, incrementalAUC, type AUCOptions } from './auc'
export { glucoseMAG, glucoseGVP } from './curve'
export { glucoseMValue, type MValueOptions } from './m-value'
export { calculateIGC, type IGCOptions, type IGCResult } from './igc'
export { calculateGVIPGS, type GVIPGSOptions, type GVIPGSResult } from './gvi-pgs'
export {
  analyzeMealResponse,
  type MealResponseOptions,
  type MealResponseResult,
} from './meal'
export {
  detectEpisodes,
  type GlucoseEpisode,
  type EpisodeOptions,
  type EpisodeSummary,
  type EpisodeResult,
} from './episodes'
