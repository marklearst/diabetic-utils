/**
 * @file src/components.tsx
 *
 * Headless chart components — thin React wrappers around the zero-dependency
 * SVG-string renderers in @glucoseiq/core. Each renders a wrapper element with
 * the chart SVG inlined; style it like any element (className/style pass
 * through). No chart library, no client-side layout work, SSR/RSC-friendly.
 */

import { useMemo, type CSSProperties, type JSX } from 'react'
import {
  agpChartToSVG,
  tirBarToSVG,
  trendTileToSVG,
  type GlucoseReading,
  type AGPChartOptions,
  type TIRBarOptions,
  type TrendTileOptions,
} from '@glucoseiq/core'

/** Common props for all chart components. */
export interface ChartBaseProps {
  readonly readings: GlucoseReading[]
  readonly className?: string
  readonly style?: CSSProperties
}

function SvgBox(props: {
  svg: string
  className?: string
  style?: CSSProperties
}): JSX.Element {
  return (
    <div
      className={props.className}
      style={props.style}
      // The SVG is produced by @glucoseiq/core from numeric data with
      // XML-escaped text — safe to inline.
      dangerouslySetInnerHTML={{ __html: props.svg }}
    />
  )
}

/** The Ambulatory Glucose Profile chart. */
export function AgpChart(props: ChartBaseProps & { options?: AGPChartOptions }): JSX.Element {
  const svg = useMemo(
    () => agpChartToSVG(props.readings, props.options),
    [props.readings, props.options]
  )
  return <SvgBox svg={svg} className={props.className} style={props.style} />
}

/** The five-zone Time-in-Range stacked bar. */
export function TirBar(props: ChartBaseProps & { options?: TIRBarOptions }): JSX.Element {
  const svg = useMemo(
    () => tirBarToSVG(props.readings, props.options),
    [props.readings, props.options]
  )
  return <SvgBox svg={svg} className={props.className} style={props.style} />
}

/** The glanceable current-glucose tile (value, trend arrow, zone). */
export function TrendTile(props: ChartBaseProps & { options?: TrendTileOptions }): JSX.Element {
  const svg = useMemo(
    () => trendTileToSVG(props.readings, props.options),
    [props.readings, props.options]
  )
  return <SvgBox svg={svg} className={props.className} style={props.style} />
}
