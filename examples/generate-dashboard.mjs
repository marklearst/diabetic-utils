// examples/generate-dashboard.mjs
//
// Generates a self-contained GlucoseIQ dashboard (examples/dashboard.html) from
// @glucoseiq/core, using only zero-dependency SVG renderers + the one-call
// report. Run after building core:
//
//   pnpm build && node examples/generate-dashboard.mjs
//
// Everything below is composed from the published, headless engine — no chart
// library, no framework, no runtime dependencies.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  analyzeGlucose,
  glucoseIQScore,
  agpChartToSVG,
  tirBarToSVG,
  trendTileToSVG,
} from '../packages/core/dist/index.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Deterministic 14-day glucose curve: circadian baseline + three meal spikes/day.
const START = Date.UTC(2024, 0, 1, 0, 0, 0)
const readings = []
for (let d = 0; d < 14; d++) {
  for (let m = 0; m < 288; m++) {
    const min = m * 5
    const circadian = 22 * Math.sin((2 * Math.PI * (min - 300)) / 1440)
    const meals = [[420, 105], [780, 125], [1140, 95]].reduce((s, [t, amp]) => {
      const dt = min - t
      return s + (dt >= 0 && dt < 210 ? amp * Math.exp(-dt / 80) * Math.min(1, dt / 25) : 0)
    }, 0)
    const wobble = 12 * Math.sin(min / 21 + d * 1.7)
    // recurring overnight lows (2–4am, every other day) so episodes show up
    const nocturnalLow = d % 2 === 1 && min >= 125 && min <= 240 ? -52 : 0
    readings.push({
      value: Math.round(108 + circadian + meals + wobble + nocturnalLow),
      unit: 'mg/dL',
      timestamp: new Date(START + (d * 1440 + min) * 60000).toISOString(),
    })
  }
}

const report = analyzeGlucose(readings, { timeZone: 'UTC' })
const iq = glucoseIQScore(readings)

const tile = (label, value, sub = '') =>
  `<div class="tile"><div class="tile-label">${label}</div><div class="tile-value">${value}</div><div class="tile-sub">${sub}</div></div>`

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>GlucoseIQ — Dashboard Demo</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0a0a0a; color: #e2e8f0;
    font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", sans-serif; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 40px 24px 64px; }
  header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 4px; }
  .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .logo .drop { color: #ef4444; }
  .tag { color: #64748b; font-size: 13px; }
  .sub { color: #64748b; font-size: 13px; margin-bottom: 28px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .tile { background: #111318; border: 1px solid #1e232c; border-radius: 16px; padding: 16px 18px; }
  .tile-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  .tile-value { font-size: 30px; font-weight: 700; margin-top: 6px; letter-spacing: -0.01em; }
  .tile-sub { color: #64748b; font-size: 12px; margin-top: 2px; }
  .iq .tile-value { color: #22c55e; }
  .panel { background: #111318; border: 1px solid #1e232c; border-radius: 20px; padding: 20px; margin-bottom: 16px; }
  .panel h2 { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px; font-weight: 600; }
  .row { display: flex; gap: 16px; flex-wrap: wrap; }
  .row .panel { flex: 1; min-width: 260px; }
  svg { max-width: 100%; height: auto; display: block; }
  footer { color: #475569; font-size: 12px; margin-top: 28px; }
  footer code { color: #94a3b8; }
</style></head>
<body><div class="wrap">
  <header><span class="logo"><span class="drop">●</span> GlucoseIQ</span><span class="tag">dashboard demo · 14 days · mock data</span></header>
  <div class="sub">Every element below is rendered from <code>@glucoseiq/core</code> — zero dependencies, zero chart libraries.</div>

  <div class="stats">
    ${tile('Glucose IQ', iq.score, iq.rating)}
    ${tile('GMI', report.gmi + '%', 'est. A1C')}
    ${tile('Mean', report.meanGlucose, 'mg/dL')}
    ${tile('CV', report.cv + '%', report.cv <= 36 ? 'stable' : 'variable')}
    ${tile('Time in Range', report.timeInRange.inRange.percentage + '%', 'target ≥70%')}
    ${tile('GRI Zone', report.risk.gri.zone, 'risk index')}
  </div>

  <div class="panel"><h2>Ambulatory Glucose Profile</h2>${agpChartToSVG(readings, { width: 960, height: 300, timeZone: 'UTC' })}</div>

  <div class="row">
    <div class="panel"><h2>Time in Range</h2>${tirBarToSVG(readings, { width: 260, height: 300 })}</div>
    <div class="panel"><h2>Latest</h2>${trendTileToSVG(readings)}
      <div style="color:#64748b;font-size:12px;margin-top:12px">
        Hypo events: ${report.episodes.summary.hypoCount} · Hyper events: ${report.episodes.summary.hyperCount}<br/>
        Active: ${report.dataSufficiency.activePercent}% · ${report.dataSufficiency.daysOfData} days
      </div>
    </div>
  </div>

  <footer>Informational only — not medical advice. Built with <code>@glucoseiq/core</code>.</footer>
</div></body></html>`

writeFileSync(join(__dirname, 'dashboard.html'), html)
console.log('Wrote examples/dashboard.html —', html.length, 'bytes')
console.log('Glucose IQ:', iq.score, `(${iq.rating})`, '· GMI', report.gmi, '· TIR', report.timeInRange.inRange.percentage + '%', '· CV', report.cv + '%')
