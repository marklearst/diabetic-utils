import assert from 'node:assert/strict'
import {
  assertLaunchVersionPolicy,
  assertValidPackageVersions,
  compareStableSemver,
  queryPublicLaunchVersions,
} from './lib/package-contracts.mjs'

const baselineVersions = new Map([
  ['@glucoseiq/core', '0.0.0'],
  ['@glucoseiq/react', '0.0.0'],
  ['@glucoseiq/tokens', '0.0.0'],
  ['@glucoseiq/testing', '0.0.0'],
  ['@glucoseiq/cli', '0.0.0'],
  ['diabetic-utils', '1.5.0'],
])
const launchVersions = new Map([
  ['@glucoseiq/core', '1.0.0'],
  ['@glucoseiq/react', '1.0.0'],
  ['@glucoseiq/tokens', '1.0.0'],
  ['@glucoseiq/testing', '1.0.0'],
  ['@glucoseiq/cli', '1.0.0'],
  ['diabetic-utils', '2.0.0'],
])
const registryMetadata = (url) => {
  const pathname = new URL(url).pathname.split('/').filter(Boolean)
  return {
    name: decodeURIComponent(pathname.at(-2)),
    version: decodeURIComponent(pathname.at(-1)),
  }
}

assert.doesNotThrow(() =>
  assertValidPackageVersions(
    new Map([
      ['@glucoseiq/core', { version: '1.3.0' }],
      ['@glucoseiq/react', { version: '2.1.0' }],
      ['@glucoseiq/tokens', { version: '1.0.4' }],
      ['@glucoseiq/testing', { version: '3.0.0-beta.2' }],
      ['@glucoseiq/cli', { version: '1.8.1+build.7' }],
      ['diabetic-utils', { version: '2.2.0' }],
    ]),
  ),
  'independently versioned packages should be valid',
)

assert.throws(
  () => assertValidPackageVersions(new Map([['@glucoseiq/core', { version: 'next' }]])),
  /valid semantic version/,
)

assert.equal(compareStableSemver('1.0.0', '1.0.0'), 0)
assert.equal(compareStableSemver('1.10.0', '1.2.9'), 1)
assert.equal(compareStableSemver('2.0.0+build.7', '1.99.99'), 1)
assert.equal(compareStableSemver('9007199254740993.0.0', '9007199254740992.0.0'), 1)
assert.throws(() => compareStableSemver('2.0.0-beta.1', '2.0.0'), /stable semantic version/)

assert.equal(
  assertLaunchVersionPolicy({
    currentVersions: baselineVersions,
    baselineVersions,
    launchVersions,
    hasLaunchChangeset: true,
    allLaunchVersionsPublic: false,
  }),
  'baseline',
)
assert.equal(
  assertLaunchVersionPolicy({
    currentVersions: launchVersions,
    baselineVersions,
    launchVersions,
    hasLaunchChangeset: false,
    allLaunchVersionsPublic: false,
  }),
  'release',
)

const independentVersions = new Map([
  ['@glucoseiq/core', '1.4.0'],
  ['@glucoseiq/react', '2.1.0'],
  ['@glucoseiq/tokens', '1.0.3'],
  ['@glucoseiq/testing', '3.0.0'],
  ['@glucoseiq/cli', '1.8.1+build.7'],
  ['diabetic-utils', '2.2.0'],
])
assert.equal(
  assertLaunchVersionPolicy({
    currentVersions: independentVersions,
    baselineVersions,
    launchVersions,
    hasLaunchChangeset: false,
    allLaunchVersionsPublic: true,
  }),
  'stable',
)
assert.throws(
  () =>
    assertLaunchVersionPolicy({
      currentVersions: independentVersions,
      baselineVersions,
      launchVersions,
      hasLaunchChangeset: false,
      allLaunchVersionsPublic: false,
    }),
  /not all public/,
)
assert.throws(
  () =>
    assertLaunchVersionPolicy({
      currentVersions: new Map(independentVersions).set('@glucoseiq/core', '0.9.9'),
      baselineVersions,
      launchVersions,
      hasLaunchChangeset: false,
      allLaunchVersionsPublic: true,
    }),
  /at least 1\.0\.0/,
)
assert.throws(
  () =>
    assertLaunchVersionPolicy({
      currentVersions: new Map(independentVersions).set('diabetic-utils', '2.3.0-rc.1'),
      baselineVersions,
      launchVersions,
      hasLaunchChangeset: false,
      allLaunchVersionsPublic: true,
    }),
  /stable semantic version/,
)

const publicResult = await queryPublicLaunchVersions(launchVersions, {
  fetchImpl: async (url) => ({
    status: 200,
    json: async () => registryMetadata(url),
  }),
})
assert.equal(publicResult.allPublic, true)
assert.deepEqual(publicResult.missing, [])

const partialResult = await queryPublicLaunchVersions(launchVersions, {
  fetchImpl: async (url) => ({
    status: url.includes(encodeURIComponent('@glucoseiq/testing')) ? 404 : 200,
    json: async () => registryMetadata(url),
  }),
})
assert.equal(partialResult.allPublic, false)
assert.deepEqual(partialResult.missing, ['@glucoseiq/testing@1.0.0'])

await assert.rejects(
  () =>
    queryPublicLaunchVersions(launchVersions, {
      fetchImpl: async () => ({ status: 503, statusText: 'Service Unavailable' }),
    }),
  /public npm registry returned 503/,
)
await assert.rejects(
  () =>
    queryPublicLaunchVersions(new Map([['@glucoseiq/core', '1.0.0']]), {
      fetchImpl: async () => ({
        status: 200,
        json: async () => ({ name: '@glucoseiq/react', version: '1.0.0' }),
      }),
    }),
  /unexpected metadata/,
)

console.log('Package contract helper tests passed.')
