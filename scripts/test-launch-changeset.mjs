import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertLaunchVersionPolicy,
  queryPublicLaunchVersions,
} from './lib/package-contracts.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const launchChangeset = join(root, '.changeset/launch-glucoseiq-one.md')
const hasLaunchChangeset = existsSync(launchChangeset)
const packageDirectories = new Map([
  ['@glucoseiq/core', 'packages/core'],
  ['@glucoseiq/react', 'packages/react'],
  ['@glucoseiq/tokens', 'packages/tokens'],
  ['@glucoseiq/testing', 'packages/testing'],
  ['@glucoseiq/cli', 'packages/cli'],
  ['diabetic-utils', 'packages/diabetic-utils'],
])
const baselineVersions = new Map(
  [...packageDirectories].map(([name]) => [name, name === 'diabetic-utils' ? '1.5.0' : '0.0.0']),
)
const launchVersions = new Map(
  [...packageDirectories].map(([name]) => [name, name === 'diabetic-utils' ? '2.0.0' : '1.0.0']),
)
const currentVersions = new Map(
  [...packageDirectories].map(([name, directory]) => {
    const manifest = JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8'))
    assert.equal(manifest.name, name)
    return [name, manifest.version]
  }),
)
const expectedReleases = [
  ['@glucoseiq/cli', '0.0.0', '1.0.0', 'major'],
  ['@glucoseiq/core', '0.0.0', '1.0.0', 'major'],
  ['@glucoseiq/react', '0.0.0', '1.0.0', 'major'],
  ['@glucoseiq/testing', '0.0.0', '1.0.0', 'major'],
  ['@glucoseiq/tokens', '0.0.0', '1.0.0', 'major'],
  ['diabetic-utils', '1.5.0', '2.0.0', 'major'],
]

if (!hasLaunchChangeset) {
  const hasExactLaunchVersions = [...launchVersions].every(
    ([name, version]) => currentVersions.get(name) === version,
  )
  let publicLaunchStatus = { allPublic: false, missing: [] }
  if (!hasExactLaunchVersions) {
    try {
      publicLaunchStatus = await queryPublicLaunchVersions(launchVersions)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Independent package versions cannot be validated because public npm registry verification failed: ${message}`,
      )
    }
  }

  try {
    const policy = assertLaunchVersionPolicy({
      currentVersions,
      baselineVersions,
      launchVersions,
      hasLaunchChangeset,
      allLaunchVersionsPublic: publicLaunchStatus.allPublic,
    })
    if (policy === 'release') {
      console.log('Launch changeset has been consumed and all six release versions are correct.')
    } else {
      console.log('All six launch versions are public and current package versions satisfy stable release floors.')
    }
  } catch (error) {
    const missing = publicLaunchStatus.missing.length
      ? ` Missing from the public npm registry: ${publicLaunchStatus.missing.join(', ')}.`
      : ''
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}.${missing}`)
  }
  process.exit(0)
}

assertLaunchVersionPolicy({
  currentVersions,
  baselineVersions,
  launchVersions,
  hasLaunchChangeset,
  allLaunchVersionsPublic: false,
})

const temporaryRoot = mkdtempSync(join(tmpdir(), 'glucoseiq-changeset-'))
const outputPath = join(temporaryRoot, 'status.json')

try {
  const result = spawnSync('pnpm', ['changeset', 'status', '--output', outputPath], {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  })
  if (result.status !== 0) {
    throw new Error([result.stdout, result.stderr].filter(Boolean).join('\n'))
  }

  const status = JSON.parse(readFileSync(outputPath, 'utf8'))
  const releases = status.releases
    .filter((release) => release.type !== 'none')
    .map((release) => [release.name, release.oldVersion, release.newVersion, release.type])
    .sort(([left], [right]) => left.localeCompare(right))

  assert.deepEqual(releases, expectedReleases)
  assert.equal(status.changesets.length, 1, 'the launch must use one coordinated bootstrap changeset')
  assert.equal(status.changesets[0].id, 'launch-glucoseiq-one')
  console.log('Launch changeset predicts five scoped 1.0.0 packages and diabetic-utils 2.0.0.')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
