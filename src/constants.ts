// @file src/constants.ts

export const HYPO_THRESHOLD_MGDL = 70
export const HYPER_THRESHOLD_MGDL = 180

export const HYPO_THRESHOLD_MMOLL = 3.9
export const HYPER_THRESHOLD_MMOLL = 10

export const A1C_TO_EAG_MULTIPLIER = 28.7
export const A1C_TO_EAG_CONSTANT = 46.7

export const MGDL_MMOLL_CONVERSION = 18.0182

export const MG_DL = 'mg/dL' as const
export const MMOL_L = 'mmol/L' as const

export const GLUCOSE_COLOR_LOW = '#D32F2F' // Red (low)
export const GLUCOSE_COLOR_NORMAL = '#388E3C' // Green (steady normal)
export const GLUCOSE_COLOR_NORMAL_UP = '#4CAF50' // Lighter Green (normal, trending up)
export const GLUCOSE_COLOR_NORMAL_DOWN = '#2E7D32' // Darker Green (normal, trending down)
export const GLUCOSE_COLOR_ELEVATED = '#FBC02D' // Yellow (over 140)
export const GLUCOSE_COLOR_HIGH = '#F57C00' // Orange (over 180)

export const GLUCOSE_ZONE_COLORS = {
  LOW: GLUCOSE_COLOR_LOW, // Red
  NORMAL: GLUCOSE_COLOR_NORMAL, // Green
  ELEVATED: GLUCOSE_COLOR_ELEVATED, // Yellow
  HIGH: GLUCOSE_COLOR_HIGH, // Orange
  // Colors for trending normal up and down
  NORMAL_UP: GLUCOSE_COLOR_NORMAL_UP, // Lighter Green
  NORMAL_DOWN: GLUCOSE_COLOR_NORMAL_DOWN, // Darker Green
}

export const TREND_ARROWS = {
  STEADY: '→',
  RISING: '↗',
  FALLING: '↘',
  RAPIDRISE: '↑',
  RAPIDFALL: '↓',
}
