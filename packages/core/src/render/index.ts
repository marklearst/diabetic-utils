/**
 * @file src/render/index.ts
 *
 * Zero-dependency SVG-string renderers. Each returns a self-contained SVG
 * string that runs anywhere — Node, email, PDF, README, RSC, any framework.
 */

export { agpChartToSVG, type AGPChartOptions } from './agp-svg'
export { tirBarToSVG, type TIRBarOptions } from './tir-bar'
export { trendTileToSVG, type TrendTileOptions } from './trend-tile'
