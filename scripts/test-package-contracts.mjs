import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertValidPackageVersions } from './lib/package-contracts.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixturePath = join(root, 'scripts/fixtures/diabetic-utils-1.5-exports.json')
const legacyExports = JSON.parse(readFileSync(fixturePath, 'utf8'))

const packageSpecs = [
  { directory: 'packages/core', name: '@glucoseiq/core', scoped: true },
  { directory: 'packages/react', name: '@glucoseiq/react', scoped: true, coreDependency: true },
  { directory: 'packages/tokens', name: '@glucoseiq/tokens', scoped: true },
  { directory: 'packages/testing', name: '@glucoseiq/testing', scoped: true, coreDependency: true },
  { directory: 'packages/cli', name: '@glucoseiq/cli', scoped: true, coreDependency: true },
  { directory: 'packages/diabetic-utils', name: 'diabetic-utils', coreDependency: true },
]
const publicEntrypoints = [
  '@glucoseiq/core',
  '@glucoseiq/core/metrics',
  '@glucoseiq/core/connectors',
  '@glucoseiq/core/interop',
  '@glucoseiq/core/render',
  '@glucoseiq/react',
  '@glucoseiq/tokens',
  '@glucoseiq/testing',
  '@glucoseiq/cli',
  'diabetic-utils',
]
const reactConsumers = [
  { label: 'React 18', react: '18.3.1', reactTypes: '18.3.31' },
  { label: 'React 19', react: '19.2.7', reactTypes: '19.2.17' },
]

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
  })

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n')
    throw new Error(`${command} ${args.join(' ')} failed (${result.status})\n${output}`)
  }

  return result.stdout.trim()
}

function assertTypeRoute(exportTarget, label) {
  assert.equal(exportTarget.import.types, './dist/index.d.mts', `${label} import types`)
  assert.equal(exportTarget.require.types, './dist/index.d.ts', `${label} require types`)
  assert.match(exportTarget.import.default, /\.mjs$/, `${label} ESM runtime`)
  assert.match(exportTarget.require.default, /\.js$/, `${label} CommonJS runtime`)
}

assert.equal(legacyExports.length, 107, 'the diabetic-utils 1.5 fixture must contain 107 exports')
assert.equal(new Set(legacyExports).size, 107, 'the diabetic-utils 1.5 fixture must not contain duplicates')

const sourceManifests = new Map(
  packageSpecs.map((spec) => {
    const manifest = JSON.parse(readFileSync(join(root, spec.directory, 'package.json'), 'utf8'))
    assert.equal(manifest.name, spec.name)
    assert.equal(manifest.engines?.node, '>=24', `${spec.name} Node support`)
    assertTypeRoute(manifest.exports['.'], spec.name)

    if (spec.scoped) {
      assert.equal(manifest.publishConfig?.access, 'public', `${spec.name} must publish publicly`)
    }

    if (spec.coreDependency) {
      assert.equal(manifest.dependencies?.['@glucoseiq/core'], 'workspace:^', `${spec.name} workspace dependency`)
    }

    return [spec.name, manifest]
  }),
)

assertValidPackageVersions(sourceManifests)
const coreVersion = sourceManifests.get('@glucoseiq/core').version

const reactManifest = sourceManifests.get('@glucoseiq/react')
assert.equal(reactManifest.peerDependencies?.react, '>=18', 'React 18 and 19 must satisfy the peer range')
assert.equal(reactManifest.dependencies?.react, undefined, 'React must not be a runtime dependency')

const temporaryRoot = mkdtempSync(join(tmpdir(), 'glucoseiq-packages-'))

try {
  const packedManifests = new Map()
  const tarballs = new Map()

  for (const spec of packageSpecs) {
    const packRoot = join(temporaryRoot, spec.name.replaceAll('/', '-').replace('@', ''))
    mkdirSync(packRoot, { recursive: true })
    run('pnpm', ['--dir', join(root, spec.directory), 'pack', '--pack-destination', packRoot])

    const archives = readdirSync(packRoot).filter((entry) => entry.endsWith('.tgz'))
    assert.equal(archives.length, 1, `${spec.name} must produce one tarball`)
    const archivePath = join(packRoot, archives[0])
    run('tar', ['-xzf', archivePath, '-C', packRoot])

    const packedRoot = join(packRoot, 'package')
    const manifestText = readFileSync(join(packedRoot, 'package.json'), 'utf8')
    const packedManifest = JSON.parse(manifestText)
    assert.equal(manifestText.includes('workspace:'), false, `${spec.name} tarball must not contain workspace dependencies`)
    assertTypeRoute(packedManifest.exports['.'], `${spec.name} tarball`)

    if (spec.coreDependency) {
      assert.equal(
        packedManifest.dependencies?.['@glucoseiq/core'],
        `^${coreVersion}`,
        `${spec.name} tarball core dependency`,
      )
    }

    packedManifests.set(spec.name, packedManifest)
    tarballs.set(spec.name, archivePath)
  }

  assert.equal(packedManifests.get('@glucoseiq/cli').bin?.glucoseiq, './dist/bin.js')
  const inspectModules = (loader) => `
    const names = ${JSON.stringify(publicEntrypoints)};
    const modules = await Promise.all(names.map((name) => ${loader}));
    console.log(JSON.stringify(modules.map((module, index) => [names[index], Object.keys(module).sort()])));
  `
  const cjsCode = `
    const names = ${JSON.stringify(publicEntrypoints)};
    const modules = names.map((name) => require(name));
    console.log(JSON.stringify(modules.map((module, index) => [names[index], Object.keys(module).sort()])));
  `
  const compatibilityCode = `
    const module = require('diabetic-utils');
    console.log(JSON.stringify({
      exports: Object.keys(module).sort(),
      conversion: module.mgDlToMmolL(180),
      timeInRange: module.calculateTimeInRange([54, 70, 120, 180, 250], 70, 180),
      gmi: module.estimateGMI(154, module.MG_DL),
    }));
  `
  const esmSource = `
    import * as core from '@glucoseiq/core'
    import * as metrics from '@glucoseiq/core/metrics'
    import * as connectors from '@glucoseiq/core/connectors'
    import * as interop from '@glucoseiq/core/interop'
    import * as render from '@glucoseiq/core/render'
    import * as reactAdapter from '@glucoseiq/react'
    import * as tokens from '@glucoseiq/tokens'
    import * as testing from '@glucoseiq/testing'
    import * as cli from '@glucoseiq/cli'
    import * as compatibility from 'diabetic-utils'
    import type { GlucoseUnit } from '@glucoseiq/core'
    const unit: GlucoseUnit = 'mg/dL'
    void [core, metrics, connectors, interop, render, reactAdapter, tokens, testing, cli, compatibility, unit]
  `
  const cjsSource = `
    import core = require('@glucoseiq/core')
    import metrics = require('@glucoseiq/core/metrics')
    import connectors = require('@glucoseiq/core/connectors')
    import interop = require('@glucoseiq/core/interop')
    import render = require('@glucoseiq/core/render')
    import reactAdapter = require('@glucoseiq/react')
    import tokens = require('@glucoseiq/tokens')
    import testing = require('@glucoseiq/testing')
    import cli = require('@glucoseiq/cli')
    import compatibility = require('diabetic-utils')
    void [core, metrics, connectors, interop, render, reactAdapter, tokens, testing, cli, compatibility]
  `
  const tsc = join(root, 'packages/core/node_modules/typescript/bin/tsc')
  const sharedTypeArgs = ['--noEmit', '--strict', '--skipLibCheck', 'false', '--target', 'ES2022']

  for (const consumer of reactConsumers) {
    const consumerRoot = join(temporaryRoot, `consumer-react-${consumer.react.split('.')[0]}`)
    mkdirSync(consumerRoot, { recursive: true })
    const dependencies = Object.fromEntries(
      packageSpecs.map((spec) => [spec.name, `file:${tarballs.get(spec.name)}`]),
    )
    Object.assign(dependencies, {
      react: consumer.react,
      'react-dom': consumer.react,
      '@types/react': consumer.reactTypes,
    })
    writeFileSync(
      join(consumerRoot, 'package.json'),
      `${JSON.stringify({ private: true, type: 'module', dependencies }, null, 2)}\n`,
    )
    run(
      'npm',
      ['install', '--ignore-scripts', '--no-package-lock', '--no-audit', '--no-fund', '--loglevel=error'],
      { cwd: consumerRoot },
    )

    const esmKeys = JSON.parse(
      run('node', ['--input-type=module', '--eval', inspectModules('import(name)')], { cwd: consumerRoot }),
    )
    const cjsKeys = JSON.parse(run('node', ['--input-type=commonjs', '--eval', cjsCode], { cwd: consumerRoot }))
    assert.deepEqual(
      cjsKeys,
      esmKeys,
      `${consumer.label} ESM and CommonJS entrypoints must expose the same runtime names`,
    )
    for (const [entrypoint, keys] of esmKeys) {
      assert.ok(keys.length > 0, `${consumer.label} ${entrypoint} must expose runtime exports`)
    }

    const compatibility = JSON.parse(
      run('node', ['--input-type=commonjs', '--eval', compatibilityCode], { cwd: consumerRoot }),
    )
    const missingLegacyExports = legacyExports.filter((name) => !compatibility.exports.includes(name))
    assert.deepEqual(
      missingLegacyExports,
      [],
      `${consumer.label} compatibility package must preserve every diabetic-utils 1.5 export`,
    )
    assert.equal(compatibility.conversion, 10, `${consumer.label} compatibility conversion`)
    assert.equal(compatibility.timeInRange, 60, `${consumer.label} compatibility time in range`)
    assert.equal(compatibility.gmi, 7, `${consumer.label} compatibility GMI`)

    const cliOutput = run(
      'node',
      [join(consumerRoot, 'node_modules/@glucoseiq/cli/dist/bin.js'), '--help'],
      { cwd: consumerRoot },
    )
    assert.match(cliOutput, /Usage:\s+glucoseiq report/, `${consumer.label} CLI help`)

    writeFileSync(join(consumerRoot, 'consumer.mts'), esmSource)
    writeFileSync(join(consumerRoot, 'consumer.cts'), cjsSource)
    writeFileSync(join(consumerRoot, 'consumer.ts'), esmSource)
    run(
      'node',
      [
        tsc,
        ...sharedTypeArgs,
        '--module',
        'NodeNext',
        '--moduleResolution',
        'NodeNext',
        'consumer.mts',
        'consumer.cts',
      ],
      { cwd: consumerRoot },
    )
    run(
      'node',
      [tsc, ...sharedTypeArgs, '--module', 'ESNext', '--moduleResolution', 'Bundler', 'consumer.ts'],
      { cwd: consumerRoot },
    )
    console.log(`${consumer.label} clean packed consumer passed.`)
  }

  console.log(
    `Package contract smoke test passed for ${packageSpecs.length} tarballs, ${publicEntrypoints.length} entrypoints, and ${legacyExports.length} legacy exports.`,
  )
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
