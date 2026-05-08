# Headless CGM Framework Roadmap (Revised)

## North-Star Goal

Build `diabetic-utils` into the **premier headless CGM TypeScript library**: UI-agnostic, protocol-first, and strong enough to power everything from indie dashboards to enterprise-grade products.

The strategy is not to ship a full vertical platform; it is to ship a world-class **headless core** that any product team can compose into their own experience.

## Product Positioning

- **Core first**: `core` is the main course and must be exceptional.
- **Composable ecosystem**: optional packages make adoption easier across app stacks.
- **Enterprise-capable without enterprise bloat**: robust enough for large deployments, lean enough for modern frontend/backend teams.

## Codebase Scan: What Is Already Strong

The current codebase already includes essential building blocks for a headless CGM system:

- Canonical glucose models and utility conversions.
- Vendor normalization adapters (Dexcom, Libre, Nightscout).
- Broad analytics coverage (TIR, AGP, risk/variability metrics).
- Interop builders (FHIR/Open mHealth).
- Strong automated testing and modular functions.

## Strategic Gaps to Close

1. **Domain contract layering is incomplete**
   - Need strict contracts for each stage:
     - source payload,
     - normalized event,
     - aligned timeline,
     - computed analytics snapshot,
     - presentation-ready derivative series.

2. **Connector model lacks capability metadata**
   - Add explicit connector capability descriptors:
     - update frequency and freshness,
     - trend vocabulary coverage,
     - source clock behavior,
     - supported history depth,
     - quality/reliability flags.

3. **Feature orchestration is manual**
   - Add first-class pipelines for common workflows:
     - ingest -> normalize -> align -> aggregate -> export.

4. **Validation ergonomics need opt-in tiers**
   - Keep core lean and fast.
   - Provide optional runtime schema adapters (Zod/standard schema) as add-ons.

5. **Framework entrypoints are not yet productized**
   - Create headless app-integration helpers for Next.js and TanStack ecosystems without coupling to UI frameworks.

## Monorepo Strategy Options

### Option A (Recommended): Turborepo + pnpm workspaces

Why this fits a lightweight, library-first project:

- Minimal ceremony and fast local feedback loops.
- Great DX for multiple publishable packages.
- Strong cache/task orchestration without heavyweight abstractions.

Suggested package layout:

- `packages/core`
- `packages/connectors`
- `packages/pipelines`
- `packages/interop`
- `packages/schemas` (optional)
- `packages/query` (optional)
- `examples/*` (Next.js, TanStack Start, MUI X dashboards)

### Option B: Nx (not default)

Use only if you need deep enterprise governance features (complex dependency graph policy, large team guardrails, advanced generators).

For this project’s current size and speed goals, Nx likely adds unnecessary operational complexity.

## Connector Strategy by Device Class

Treat connectors as capability-driven modules with explicit profiles.

### Tier 1: Full-fidelity CGM connectors

- **Dexcom**
- **Libre**

Requirements:

- full trend mapping coverage,
- high-resolution timestamp handling,
- robust de-duplication and backfill support,
- deterministic normalization with strict error unions.

### Tier 2: Community/cloud relay connectors

- **Nightscout** and other relay sources.

Requirements:

- provenance metadata,
- source-quality scoring,
- replay/clock-skew guardrails.

### Tier 3: Limited-range or constrained devices

Some devices expose narrower operating/alert ranges or reduced telemetry semantics compared with full-fidelity CGM streams.

Plan:

- represent device constraints explicitly in connector capabilities,
- mark unsupported metrics as `notComputable` rather than silently guessing,
- provide policy helpers so consumers choose strict vs permissive behavior.

Note: regulatory and labeling differences vary by market and can change; treat these as external policy inputs, not hardcoded assumptions.

## API Design Rules (Non-Negotiable)

1. **Purity by default**: deterministic transforms, no hidden side effects.
2. **Typed error unions**: parse/transport/domain errors are explicit and discriminated.
3. **Time semantics are explicit**: timezone, ordering, and gap policy are configurable.
4. **Stable contracts**: additive evolution first; deprecate with migration guides.
5. **Performance budget**: avoid heavy runtime deps in core path.

## Feature Strategy Template (Apply to Every New Capability)

For each new feature (including each connector), require the same structured lifecycle:

1. **Problem definition**
   - clinical/analytics intent,
   - data prerequisites,
   - failure modes.

2. **Contract design**
   - input/output type contracts,
   - capability and error model,
   - invariants and edge-case semantics.

3. **Implementation**
   - pure normalization/computation,
   - no framework coupling,
   - benchmark against performance budget.

4. **Verification**
   - golden fixtures,
   - edge-case tests,
   - compatibility tests across package boundaries.

5. **Documentation + examples**
   - reference docs,
   - example integration (Next.js / TanStack Start / MUI X),
   - migration notes if behavior changed.

## Phased Execution Plan

### Phase 1 — Contract Hardening (core + connectors)

- Introduce capability descriptors and strict connector error unions.
- Add aligned timeline contract and gap/collision policies.
- Keep existing exports stable; add new APIs additively.

### Phase 2 — Pipeline Layer

- Ship reusable orchestration pipelines and snapshot envelopes.
- Add deterministic series builders for dashboards.

### Phase 3 — Optional Extensions

- Publish optional `schemas` and `query` packages.
- Add transport-agnostic fetch/retry helpers and cache key utilities.

### Phase 4 — Adoption Flywheel

- Ship polished examples + starter kits.
- Publish interoperability playbooks and migration guides.
- Track onboarding time and production success metrics.

## Success Metrics

- <30 minutes from install to first working dashboard.
- Tier-1 connectors pass exhaustive fixture suites.
- Core package remains dependency-light and framework-agnostic.
- Optional packages improve adoption without burdening minimal users.
- Clear semver and migration confidence for long-term trust.
