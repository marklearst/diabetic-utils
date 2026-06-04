// Generates the API Reference MDX from @glucoseiq/core's TSDoc.
//   node scripts/generate-api.mjs
// Runs typedoc to produce a JSON model, then emits categorized MDX pages.
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dir = dirname(fileURLToPath(import.meta.url))
const core = join(__dir, '../../../packages/core')
const jsonPath = join(__dir, 'api-model.json')
execSync(`./node_modules/.bin/typedoc src/index.ts --json ${jsonPath} --skipErrorChecking --excludeInternal`, { cwd: core, stdio: 'inherit' })
process.argv[2] = process.argv[2] || join(__dir, '../content/docs/api')
process.env.GIQ_API_JSON = jsonPath
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const model = JSON.parse(readFileSync(process.env.GIQ_API_JSON, 'utf8'))
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })

function writePage(path, content) {
  writeFileSync(path, `${content.trimEnd()}\n`)
}

// ---- category mapping (by source file) -------------------------------------
const CATS = [
  { slug: 'reports', title: 'Reports', match: (f) => /(^|\/)analyze\.ts$/.test(f), blurb: 'One-call clinical reports composed from the whole engine.' },
  { slug: 'agp', title: 'AGP & Metrics Aggregate', match: (f) => /(^|\/)metrics\/agp(-profile)?\.ts$/.test(f), blurb: 'The Ambulatory Glucose Profile series and the all-in-one metrics call.' },
  { slug: 'time-in-range', title: 'Time in Range', match: (f) => /(^|\/)tir(-enhanced)?\.ts$/.test(f), blurb: 'Enhanced 5-range TIR, pregnancy TIR, and Time in Tight Range.' },
  { slug: 'score', title: 'Glucose IQ Score', match: (f) => /(^|\/)score\.ts$/.test(f), blurb: 'A single 0–100 wellness score derived from the peer-reviewed GRI.' },
  { slug: 'variability', title: 'Variability & Risk Metrics', match: (f) => /(variability|mage|bgi|adrr|grade|gri|jindex|modd|conga|active-percent|m-value|igc|gvi-pgs|curve)\.ts$/.test(f), blurb: 'Cited variability and risk indices — every formula golden-tested.' },
  { slug: 'meals', title: 'Meals & AUC', match: (f) => /(^|\/)metrics\/(meal|auc)\.ts$/.test(f), blurb: 'Postprandial meal response and area-under-the-curve.' },
  { slug: 'episodes', title: 'Episodes', match: (f) => /(^|\/)metrics\/episodes\.ts$/.test(f), blurb: 'Consensus ≥15-minute hypo/hyper event detection.' },
  { slug: 'live', title: 'Live Model', match: (f) => /(^|\/)live\.ts$/.test(f), blurb: 'Rate-of-change, trend derivation, and sensor staleness.' },
  { slug: 'series', title: 'Time-Series Primitives', match: (f) => /(^|\/)(timeseries|align)\.ts$/.test(f), blurb: 'Gap detection, day/night split, and uniform-grid resampling.' },
  { slug: 'cohort', title: 'Cohort', match: (f) => /(^|\/)cohort\.ts$/.test(f), blurb: 'Population metric distributions across many patients.' },
  { slug: 'render', title: 'Rendering (SVG)', match: (f) => /(^|\/)render\//.test(f), blurb: 'Zero-dependency SVG-string renderers for any surface.' },
  { slug: 'connectors', title: 'Connectors', match: (f) => /(^|\/)connectors\//.test(f), blurb: 'Dexcom, Libre, and Nightscout normalization, capabilities, and safe variants.' },
  { slug: 'ingestion', title: 'Ingestion', match: (f) => /(^|\/)csv\.ts$/.test(f), blurb: 'Parse any Dexcom/Libre/Nightscout/Tidepool CSV export.' },
  { slug: 'interop', title: 'Interoperability', match: (f) => /(^|\/)interop\//.test(f), blurb: 'FHIR CGM IG and Open mHealth payload builders.' },
  { slug: 'conversions', title: 'Conversions, A1C & GMI', match: (f) => /(^|\/)(conversions|a1c)\.ts$/.test(f), blurb: 'Unit conversions and A1C / eAG / GMI estimation.' },
  { slug: 'glucose', title: 'Glucose Values & Formatting', match: (f) => /(^|\/)(glucose|validators|guards|formatters|alignment)\.ts$/.test(f), blurb: 'Labeling, validation, parsing, and formatting helpers.' },
  { slug: 'errors', title: 'Errors', match: (f) => /\/errors\.ts$/.test(f), blurb: 'Typed error classes with stable codes.' },
]
const OTHER = { slug: 'other', title: 'Other', match: () => true, blurb: '' }

// ---- comment/type helpers --------------------------------------------------
function parts(arr) {
  if (!arr) return ''
  return arr.map((p) => (p.kind === 'inline-tag' ? (p.text || p.target?.name || '') : p.text || '')).join('')
}
function esc(s) {
  return String(s).replace(/</g, '&lt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
}
function typeStr(t) {
  if (!t) return 'void'
  switch (t.type) {
    case 'intrinsic': return t.name
    case 'literal': return JSON.stringify(t.value)
    case 'reference': return t.name + (t.typeArguments?.length ? `<${t.typeArguments.map(typeStr).join(', ')}>` : '')
    case 'array': return `${typeStr(t.elementType)}[]`
    case 'union': return t.types.map(typeStr).join(' | ')
    case 'intersection': return t.types.map(typeStr).join(' & ')
    case 'tuple': return `[${(t.elements || []).map(typeStr).join(', ')}]`
    case 'reflection': return t.declaration?.signatures ? 'function' : '{ … }'
    case 'indexedAccess': return `${typeStr(t.objectType)}[${typeStr(t.indexType)}]`
    case 'intrinsic': return t.name
    default: return t.name || 'unknown'
  }
}

function tableCell(value) {
  const rendered = esc(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()
  return rendered || '—'
}
function sigString(name, sig) {
  const ps = (sig.parameters || []).map((p) => {
    const opt = p.flags?.isOptional || p.defaultValue !== undefined ? '?' : ''
    return `${p.name}${opt}: ${typeStr(p.type)}`
  })
  return `${name}(${ps.join(', ')}): ${typeStr(sig.type)}`
}

// ---- collect public reflections --------------------------------------------
const reflections = []
function walk(n) {
  if ([32, 64, 128, 256, 2097152].includes(n.kind)) reflections.push(n)
  ;(n.children || []).forEach(walk)
}
walk(model)

const fns = reflections.filter((n) => n.kind === 64 && n.signatures)
const variables = reflections.filter((n) => n.kind === 32)
const classes = reflections.filter((n) => n.kind === 128)
const interfaces = reflections.filter((n) => n.kind === 256)
const aliases = reflections.filter((n) => n.kind === 2097152)

function catFor(fn) {
  const file = fn.sources?.[0]?.fileName || ''
  return (CATS.find((c) => c.match(file)) || OTHER)
}
const byCat = new Map()
for (const fn of fns) {
  const c = catFor(fn)
  if (!byCat.has(c.slug)) byCat.set(c.slug, { cat: c, items: [] })
  byCat.get(c.slug).items.push(fn)
}

// ---- render ----------------------------------------------------------------
function renderFn(fn) {
  const sig = fn.signatures[0]
  const summary = parts(sig.comment?.summary)
  const tags = sig.comment?.blockTags || []
  const ret = tags.find((t) => t.tag === '@returns')
  const example = tags.find((t) => t.tag === '@example')
  const sees = tags.filter((t) => t.tag === '@see')
  const throwsT = tags.filter((t) => t.tag === '@throws')
  const params = (sig.parameters || []).filter((p) => parts(p.comment?.summary))

  let md = `### ${fn.name}\n\n`
  md += '```ts\n' + sigString(fn.name, sig) + '\n```\n\n'
  if (summary) md += esc(summary).trim() + '\n\n'
  if (params.length) {
    md += '| Parameter | Description |\n| --- | --- |\n'
    for (const p of params) md += `| \`${p.name}\` | ${esc(parts(p.comment.summary)).replace(/\n/g, ' ').trim()} |\n`
    md += '\n'
  }
  if (ret) { const r = esc(parts(ret.content)).trim(); if (r) md += `**Returns** — ${r}\n\n` }
  if (throwsT.length) md += throwsT.map((t) => `**Throws** — ${esc(parts(t.content)).trim()}`).join('\n\n') + '\n\n'
  if (example) {
    let ex = parts(example.content).trim()
    if (!ex.startsWith('```')) ex = '```ts\n' + ex + '\n```'
    md += ex + '\n\n'
  }
  if (sees.length) md += 'See: ' + sees.map((s) => esc(parts(s.content)).trim()).join(' · ') + '\n\n'
  return md
}

function renderInterface(item) {
  const summary = parts(item.comment?.summary).trim()
  const extended = (item.extendedTypes || []).map(typeStr)
  const properties = (item.children || []).filter((child) => child.kind === 1024 && !child.flags?.isInherited)
  let md = `### ${item.name}\n\n`
  md += '```ts\n' + `interface ${item.name}${extended.length ? ` extends ${extended.join(', ')}` : ''}` + '\n```\n\n'
  if (summary) md += esc(summary) + '\n\n'
  if (properties.length) {
    md += '| Property | Type | Description |\n| --- | --- | --- |\n'
    for (const property of properties) {
      const optional = property.flags?.isOptional ? '?' : ''
      md += `| \`${property.name}${optional}\` | \`${tableCell(typeStr(property.type))}\` | ${tableCell(parts(property.comment?.summary))} |\n`
    }
    md += '\n'
  }
  return md
}

function renderAlias(item) {
  const summary = parts(item.comment?.summary).trim()
  let md = `### ${item.name}\n\n`
  md += '```ts\n' + `type ${item.name} = ${typeStr(item.type)}` + '\n```\n\n'
  if (summary) md += esc(summary) + '\n\n'
  return md
}

function renderVariable(item) {
  const summary = parts(item.comment?.summary).trim()
  let md = `### ${item.name}\n\n`
  md += '```ts\n' + `const ${item.name}: ${typeStr(item.type)}` + '\n```\n\n'
  if (summary) md += esc(summary) + '\n\n'
  return md
}

function renderClass(item) {
  const summary = parts(item.comment?.summary).trim()
  const extended = (item.extendedTypes || []).map(typeStr)
  const ctor = (item.children || []).find((child) => child.kind === 512)?.signatures?.[0]
  let md = `### ${item.name}\n\n`
  md += '```ts\n' + `class ${item.name}${extended.length ? ` extends ${extended.join(', ')}` : ''}` + '\n```\n\n'
  if (summary) md += esc(summary) + '\n\n'
  if (ctor) {
    const params = (ctor.parameters || []).map((parameter) => {
      const optional = parameter.flags?.isOptional || parameter.defaultValue !== undefined ? '?' : ''
      return `${parameter.name}${optional}: ${typeStr(parameter.type)}`
    })
    md += `**Constructor**\n\n\`new ${item.name}(${params.join(', ')})\`\n\n`
  }
  return md
}

const functionOrder = [...CATS, OTHER].map((c) => c.slug).filter((s) => byCat.has(s))
for (const slug of functionOrder) {
  const { cat, items } = byCat.get(slug)
  items.sort((a, b) => a.name.localeCompare(b.name))
  let page = `---\ntitle: ${cat.title}\ndescription: ${cat.blurb}\n---\n\n`
  page += `<Callout title="${items.length} function${items.length === 1 ? '' : 's'}">Generated from the source TSDoc — every signature, parameter, and example is the real thing.</Callout>\n\n`
  page += items.map(renderFn).join('\n---\n\n')
  writePage(`${OUT}/${slug}.mdx`, page)
}


const referencePages = [
  {
    slug: 'types',
    title: 'Types & Interfaces',
    description: 'The public contracts that connect ingestion, analytics, rendering, and integrations.',
    items: [...interfaces.map((item) => ({ item, render: renderInterface })), ...aliases.map((item) => ({ item, render: renderAlias }))],
  },
  {
    slug: 'constants',
    title: 'Constants',
    description: 'Exported thresholds, goals, conversion factors, colors, and connector capabilities.',
    items: variables.map((item) => ({ item, render: renderVariable })),
  },
  {
    slug: 'errors',
    title: 'Error Classes',
    description: 'Typed failures with stable machine-readable error codes.',
    items: classes.map((item) => ({ item, render: renderClass })),
  },
]

for (const page of referencePages) {
  page.items.sort((a, b) => a.item.name.localeCompare(b.item.name))
  let md = `---\ntitle: ${page.title}\ndescription: ${page.description}\n---\n\n`
  md += `<Callout title="${page.items.length} export${page.items.length === 1 ? '' : 's'}">Generated from the public source TSDoc and TypeScript declarations.</Callout>\n\n`
  md += page.items.map(({ item, render }) => render(item)).join('\n---\n\n')
  writePage(`${OUT}/${page.slug}.mdx`, md)
}

// index + meta
const order = [...functionOrder, ...referencePages.map((page) => page.slug)]
const meta = { title: 'API Reference', pages: order }
writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 2) + '\n')
const totals = `${fns.length} functions, ${interfaces.length} interfaces, ${aliases.length} type aliases, ${variables.length} constants, and ${classes.length} classes`
const idx = `---\ntitle: API Reference\ndescription: The complete GlucoseIQ public API, generated from source TSDoc — ${totals}.\n---\n\nThe public functions and contracts exported by \`@glucoseiq/core\`, generated directly from source declarations and TSDoc.\n\n` +
  functionOrder.map((s) => { const { cat, items } = byCat.get(s); return `## [${cat.title}](/docs/api/${s})\n${cat.blurb} — ${items.length} function${items.length === 1 ? '' : 's'}.` }).join('\n\n') + '\n\n' +
  referencePages.map((page) => `## [${page.title}](/docs/api/${page.slug})\n${page.description} — ${page.items.length} export${page.items.length === 1 ? '' : 's'}.`).join('\n\n') + '\n'
writePage(`${OUT}/index.mdx`, idx)
console.log(`Wrote ${order.length} API reference pages (${totals}) → ${OUT}`)
