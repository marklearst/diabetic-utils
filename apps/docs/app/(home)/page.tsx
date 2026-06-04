import {
  analyzeGlucose,
  glucoseIQScore,
  agpChartToSVG,
  tirBarToSVG,
  computeGlucoseTrend,
} from '@glucoseiq/core'
import { generateCGMSeries } from '@glucoseiq/testing'
import { LogoMark } from '@/lib/logo'
import type { JSX } from 'react'

// ---------------------------------------------------------------------------
// Every number and chart below is computed at build time by @glucoseiq/core
// over deterministic @glucoseiq/testing data. No chart library. No client JS.
// ---------------------------------------------------------------------------

const readings = generateCGMSeries({
  days: 14,
  seed: 7,
  mealAmplitude: 95,
  noise: 10,
  nocturnalHypoDays: [3, 9],
})

const report = analyzeGlucose(readings)
const iq = glucoseIQScore(readings)
const agpSvg = agpChartToSVG(readings, { width: 980, height: 300 })
const tirSvg = tirBarToSVG(readings, { width: 230, height: 300 })

// Live-model strip: the last few readings, newest first (Health-app style).
const recent = [...readings].slice(-4).reverse()
const trend = computeGlucoseTrend(readings.slice(-12))
const lastDay = readings.slice(-288)
const dayLow = Math.min(...lastDay.map((r) => r.value))
const dayHigh = Math.max(...lastDay.map((r) => r.value))
const current = recent[0].value

const ARROW: Record<string, string> = {
  rapidRising: '↑↑', rising: '↑', slightlyRising: '↗', flat: '→',
  slightlyFalling: '↘', falling: '↓', rapidFalling: '↓↓', unknown: '·',
}

function Drop(): JSX.Element {
  return (
    <svg width="22" height="28" viewBox="0 0 64 84" fill="none" aria-hidden="true">
      <path d="M32 7C32 7 9 36.5 9 52a23 23 0 0 0 46 0C55 36.5 32 7 32 7Z" fill="#FF453A" />
    </svg>
  )
}

function ScoreRing(props: { score: number; label: string }): JSX.Element {
  const r = 56
  const c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, props.score / 100))
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label={`Glucose IQ score ${props.score}`}>
      <defs>
        <linearGradient id="score-grad" x1="20" y1="20" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#30D158" />
          <stop offset="0.55" stopColor="#FFD60A" />
          <stop offset="1" stopColor="#FF9F0A" />
        </linearGradient>
      </defs>
      <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
      <circle
        className="giq-ring-draw"
        cx="75" cy="75" r={r} fill="none" stroke="url(#score-grad)" strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 75 75)"
        style={{ ['--giq-c' as string]: `${c}px`, ['--giq-target' as string]: `${c * frac}px` }}
      />
      <text x="75" y="72" textAnchor="middle" fill="#f5f5f7" fontSize="38" fontWeight="700"
        style={{ fontVariantNumeric: 'tabular-nums' }}>{props.score}</text>
      <text x="75" y="95" textAnchor="middle" fill="#a1a1a6" fontSize="12">{props.label}</text>
    </svg>
  )
}

function Tile(props: { label: string; labelColor?: string; children: JSX.Element | JSX.Element[] }): JSX.Element {
  return (
    <div className="giq-tile">
      <div className="giq-tile-label" style={props.labelColor ? { color: props.labelColor } : undefined}>
        {props.label}
      </div>
      {props.children}
    </div>
  )
}

const FEATURES: { title: string; body: string }[] = [
  { title: 'The AGP series, finally.', body: 'buildAGPProfile() returns the time-of-day percentile bands every CGM dashboard renders — render-ready for any chart library, or use the built-in SVG.' },
  { title: '25+ cited metrics.', body: 'TIR, TITR, GMI, MAGE, LBGI/HBGI, ADRR, GRADE, GRI, MODD, CONGA, M-value, IGC, GVI/PGS, MAG, GVP — every formula traces to a published source, golden-tested.' },
  { title: 'Meal response.', body: 'Baseline, peak, delta, time-to-peak, return-to-baseline, and Wolever iAUC. The “what did that bagel do?” card in one pure function.' },
  { title: 'A live model.', body: 'Rate-of-change, derived trend arrows, and sensor staleness — backfilled even when a feed lacks trend. The beating heart of a CGM home screen.' },
  { title: 'Events, not just percentages.', body: 'Consensus ≥15-minute hypo/hyper episodes with level, duration, and nadir — the overnight low that percent-time hides.' },
  { title: 'Zero dependencies.', body: '~15 KB gzipped. 100% test coverage. Strict TypeScript. Unit-safe in mg/dL and mmol/L. FHIR CGM IG and Open mHealth interop included.' },
]

const PACKAGES: { name: string; desc: string }[] = [
  { name: '@glucoseiq/core', desc: 'The zero-dependency headless engine — analytics, series, live model, SVG renderers, interop.' },
  { name: '@glucoseiq/react', desc: 'Memoized hooks + headless <AgpChart/>, <TirBar/>, <TrendTile/> components.' },
  { name: '@glucoseiq/tokens', desc: 'The canonical five-zone palette, trend glyphs, and CSS variables.' },
  { name: '@glucoseiq/testing', desc: 'Seedable mock-CGM generator and scenario fixtures.' },
  { name: '@glucoseiq/cli', desc: 'npx @glucoseiq/cli report data.csv — zero-code analysis of any CGM export.' },
  { name: 'diabetic-utils', desc: '2.0 compatibility bridge for projects moving from diabetic-utils 1.5.x.' },
]

export default function HomePage(): JSX.Element {
  return (
    <main className="giq-home">
      <style>{`
        .giq-home { background: var(--giq-bg); color: var(--giq-ink); }
        .giq-wrap { max-width: 1064px; margin: 0 auto; padding: 0 24px; }

        /* ---- hero ---------------------------------------------------- */
        .giq-hero { text-align: center; padding: 104px 0 64px; position: relative; }
        .giq-hero-glow { position: absolute; inset: -40px 0 auto; height: 420px; pointer-events: none;
          background: radial-gradient(560px 300px at 50% 0%, rgba(255,69,58,0.09), transparent 70%); }
        .giq-hero .mark { margin-bottom: 28px; }
        .giq-h1 { font-size: clamp(44px, 7vw, 80px); line-height: 1.02; letter-spacing: -0.035em;
          font-weight: 700; margin: 0 auto 20px; max-width: 15ch; color: var(--giq-ink); }
        .giq-sub { font-size: clamp(17px, 2vw, 21px); line-height: 1.55; color: var(--giq-ink-2);
          max-width: 620px; margin: 0 auto 32px; }
        .giq-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 18px; }
        .giq-btn { display: inline-flex; align-items: center; min-height: 44px; border-radius: 980px;
          padding: 0 24px; font-size: 15px; font-weight: 600; text-decoration: none;
          transition: transform 150ms var(--ease-out-quart), background-color 150ms ease; }
        .giq-btn:active { transform: scale(0.97); }
        .giq-btn-primary { background: var(--giq-lime); color: #101204; }
        .giq-btn-ghost { border: 1px solid var(--giq-hairline); color: var(--giq-ink); }
        @media (hover: hover) and (pointer: fine) {
          .giq-btn-primary:hover { background: #b5f04e; }
          .giq-btn-ghost:hover { background: rgba(255,255,255,0.04); }
        }
        .giq-install { font-family: ui-monospace, 'SF Mono', SFMono-Regular, monospace; font-size: 13.5px;
          color: var(--giq-ink-3); }
        .giq-install .dollar { color: #48484a; }

        /* ---- complication tiles -------------------------------------- */
        .giq-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 40px 0 12px; }
        @media (max-width: 720px) { .giq-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 460px) { .giq-stats { grid-template-columns: 1fr; } }
        .giq-tile { background: var(--giq-card); border: 1px solid var(--giq-hairline); border-radius: 18px;
          padding: 18px 20px; }
        .giq-tile-label { color: var(--giq-blue); font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .giq-tile-value { font-size: 32px; font-weight: 700; letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums; color: var(--giq-ink); line-height: 1.1; }
        .giq-tile-sub { color: var(--giq-ink-3); font-size: 12.5px; margin-top: 4px; }
        .giq-trio { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
        .giq-trio .lo { color: var(--giq-red); } .giq-trio .hi { color: var(--giq-orange); }
        .giq-trio .cur { color: var(--giq-ink); }
        .giq-trio .sep { color: #3a3a3c; font-weight: 400; padding: 0 6px; }

        /* ---- panels ---------------------------------------------------- */
        .giq-panel { background: var(--giq-card); border: 1px solid var(--giq-hairline); border-radius: 20px;
          padding: 22px; margin-bottom: 14px; overflow-x: auto; }
        .giq-panel h2 { font-size: 11px; color: var(--giq-ink-3); text-transform: uppercase;
          letter-spacing: 0.08em; margin: 0 0 14px; font-weight: 600; }
        .giq-row { display: flex; gap: 14px; flex-wrap: wrap; }
        .giq-row > .giq-panel { flex: 1 1 280px; margin-bottom: 0; }
        .giq-panel svg { max-width: 100%; height: auto; display: block; }
        .giq-panel > div > svg rect:first-child { fill: transparent; } /* charts inherit card bg */

        /* ---- health rows ---------------------------------------------- */
        .giq-readings { display: flex; flex-direction: column; }
        .giq-reading { display: flex; align-items: center; gap: 16px; padding: 14px 4px;
          border-top: 1px solid var(--giq-hairline); }
        .giq-reading:first-child { border-top: none; }
        .giq-reading .v { font-size: 30px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--giq-ink); }
        .giq-reading .u { color: var(--giq-ink-3); font-size: 13px; margin-top: -4px; }
        .giq-reading .t { margin-left: auto; color: var(--giq-ink-3); font-size: 13px;
          font-variant-numeric: tabular-nums; }

        /* ---- score ring draw-in ---------------------------------------- */
        .giq-ring-draw { stroke-dashoffset: 0; animation: giq-draw 900ms var(--ease-out-quart) 1; }
        @keyframes giq-draw { from { stroke-dasharray: 0 var(--giq-c); } }
        @media (prefers-reduced-motion: reduce) { .giq-ring-draw { animation: none; } }

        /* ---- sections / features / code ------------------------------- */
        .giq-kicker { color: var(--giq-red); font-size: 13px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; margin: 88px 0 10px; text-align: center; }
        .giq-h2 { font-size: clamp(30px, 4.4vw, 44px); font-weight: 700; letter-spacing: -0.03em;
          color: var(--giq-ink); margin: 0 0 10px; text-align: center; }
        .giq-h2-sub { color: var(--giq-ink-2); text-align: center; margin: 0 auto 36px; max-width: 560px;
          font-size: 17px; line-height: 1.55; }
        .giq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 14px; }
        .giq-feature { background: var(--giq-card); border: 1px solid var(--giq-hairline); border-radius: 18px;
          padding: 24px; transition: transform 200ms var(--ease-out-quart); }
        @media (hover: hover) and (pointer: fine) { .giq-feature:hover { transform: translateY(-2px); } }
        @media (prefers-reduced-motion: reduce) { .giq-feature { transition: none; } }
        .giq-feature h3 { margin: 0 0 8px; font-size: 17px; letter-spacing: -0.01em; color: var(--giq-ink); }
        .giq-feature p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--giq-ink-2); }
        .giq-code { background: #0d0d0e; border: 1px solid var(--giq-hairline); border-radius: 16px;
          padding: 22px 24px; font-family: ui-monospace, 'SF Mono', SFMono-Regular, monospace;
          font-size: 13.5px; line-height: 1.75; overflow-x: auto; color: #e8e8ed; }
        .giq-code .c { color: #6e6e73; } .giq-code .k { color: #6ac4ff; } .giq-code .s { color: #7ee787; }
        .giq-pkgs { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        .giq-pkgs td { padding: 14px 16px; border-top: 1px solid var(--giq-hairline); vertical-align: top; }
        .giq-pkgs tr:first-child td { border-top: none; }
        .giq-pkgs td:first-child { font-family: ui-monospace, monospace; white-space: nowrap; color: #6ac4ff; font-size: 13.5px; }
        .giq-pkgs td:last-child { color: var(--giq-ink-2); }
        .giq-footer { color: var(--giq-ink-3); font-size: 12.5px; padding: 72px 0 72px; line-height: 1.7;
          text-align: center; }
        .giq-footer code { color: var(--giq-ink-2); }

        /* ---- scroll reveal (no JS, GPU-only, reduced-motion safe) ------ */
        @media (prefers-reduced-motion: no-preference) {
          @supports (animation-timeline: view()) {
            .giq-panel, .giq-feature, .giq-h2, .giq-kicker, .giq-h2-sub {
              animation: giq-rise linear both;
              animation-timeline: view();
              animation-range: entry 2% cover 20%;
            }
            @keyframes giq-rise {
              from { opacity: 0; transform: translateY(22px); }
              to { opacity: 1; transform: translateY(0); }
            }
          }
        }

        /* ---- mobile ---------------------------------------------------- */
        @media (max-width: 640px) {
          .giq-hero { padding: 72px 0 48px; }
          .giq-row > .giq-panel { flex: 1 1 100%; }
          .giq-row > .giq-panel[style] { flex: 1 1 100% !important; }
          .giq-trio { font-size: 22px; }
        }
      `}</style>

      <div className="giq-hero-glow" />
      <div className="giq-wrap">
        {/* HERO */}
        <section className="giq-hero">
          <div className="mark"><LogoMark size={72} /></div>
          <h1 className="giq-h1">Glucose intelligence. On every screen.</h1>
          <p className="giq-sub">
            The zero-dependency TypeScript engine for CGM analytics — the AGP, Time-in-Range,
            25+ cited metrics, meal response, and a live trend model. Headless by design.
          </p>
          <div className="giq-ctas">
            <a className="giq-btn giq-btn-primary" href="/docs">Get started</a>
            <a className="giq-btn giq-btn-ghost" href="https://github.com/marklearst/glucoseiq">GitHub</a>
          </div>
          <div className="giq-install"><span className="dollar">$</span> npm install @glucoseiq/core</div>
        </section>

        {/* COMPLICATION TILES */}
        <section className="giq-stats" aria-label="Key metrics">
          <div className="giq-tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScoreRing score={iq.score} label={iq.rating} />
          </div>
          <Tile label="Today" labelColor="var(--giq-red)">
            <div className="giq-trio">
              <span className="lo">{dayLow}↓</span><span className="sep">·</span>
              <span className="hi">{dayHigh}↑</span><span className="sep">·</span>
              <span className="cur">{current}{ARROW[trend.trend]}</span>
            </div>
            <div className="giq-tile-sub">low · high · now (mg/dL)</div>
          </Tile>
          <Tile label="GMI">
            <div className="giq-tile-value">{report.gmi}%</div>
            <div className="giq-tile-sub">est. A1C</div>
          </Tile>
          <Tile label="Time in Range" labelColor="var(--giq-green)">
            <div className="giq-tile-value">{report.timeInRange!.inRange.percentage}%</div>
            <div className="giq-tile-sub">target ≥70% · 70–180</div>
          </Tile>
          <Tile label="Variability">
            <div className="giq-tile-value">{report.cv}%</div>
            <div className="giq-tile-sub">CV · {report.cv <= 36 ? 'stable' : 'variable'}</div>
          </Tile>
          <Tile label="Episodes" labelColor="var(--giq-orange)">
            <div className="giq-tile-value">
              {report.episodes!.summary.hypoCount}<span style={{ color: '#3a3a3c' }}> · </span>{report.episodes!.summary.hyperCount}
            </div>
            <div className="giq-tile-sub">hypo · hyper (≥15 min)</div>
          </Tile>
        </section>

        {/* DASHBOARD */}
        <section>
          <div className="giq-panel">
            <h2>Ambulatory Glucose Profile · 14 days</h2>
            <div dangerouslySetInnerHTML={{ __html: agpSvg }} />
          </div>
          <div className="giq-row">
            <div className="giq-panel" style={{ flex: '0 1 300px' }}>
              <h2>Time in Range</h2>
              <div dangerouslySetInnerHTML={{ __html: tirSvg }} />
            </div>
            <div className="giq-panel">
              <h2>Latest readings</h2>
              <div className="giq-readings">
                {recent.map((r, i) => (
                  <div className="giq-reading" key={r.timestamp}>
                    <Drop />
                    <div>
                      <div className="v">{r.value}</div>
                      <div className="u">mg/dL</div>
                    </div>
                    <div className="t">{i === 0 ? 'now' : `${i * 5} min ago`}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="giq-panel">
              <h2>One call. The whole report.</h2>
              <pre className="giq-code"><code>
<span className="k">import</span> {'{ analyzeGlucose }'} <span className="k">from</span> <span className="s">'@glucoseiq/core'</span>{'\n\n'}
<span className="k">const</span> report = analyzeGlucose(readings){'\n\n'}
report.gmi                <span className="c">// {report.gmi}</span>{'\n'}
report.timeInRange        <span className="c">// {report.timeInRange!.inRange.percentage}% in 70–180</span>{'\n'}
report.risk.gri.zone      <span className="c">// '{report.risk!.gri.zone}'</span>{'\n'}
report.episodes.summary   <span className="c">// {report.episodes!.summary.hypoCount} hypo · {report.episodes!.summary.hyperCount} hyper</span>{'\n'}
report.agpProfile.bins    <span className="c">// 288 time-of-day bins</span>
</code></pre>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section>
          <div className="giq-kicker">The engine</div>
          <h2 className="giq-h2">Everything a CGM app needs.<br />Nothing it doesn’t.</h2>
          <p className="giq-h2-sub">Researcher-grade math. Dashboard-grade primitives. Apple-grade restraint.</p>
          <div className="giq-grid">
            {FEATURES.map((f) => (
              <div className="giq-feature" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section>
          <div className="giq-kicker">The ecosystem</div>
          <h2 className="giq-h2">One engine. Six packages.</h2>
          <p className="giq-h2-sub">Use exactly the slice you need — the core never carries what you don’t.</p>
          <div className="giq-panel" style={{ padding: '4px 8px' }}>
            <table className="giq-pkgs"><tbody>
              {PACKAGES.map((p) => (
                <tr key={p.name}><td>{p.name}</td><td>{p.desc}</td></tr>
              ))}
            </tbody></table>
          </div>
        </section>

        <footer className="giq-footer">
          Every chart and number on this page is computed at build time by <code>@glucoseiq/core</code> over
          deterministic <code>@glucoseiq/testing</code> data — no chart library, no client JS.<br />
          Informational and educational purposes only — not medical advice. MIT © Mark Learst.
        </footer>
      </div>
    </main>
  )
}
