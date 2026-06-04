const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const STABLE_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

export function assertValidPackageVersions(manifests) {
  for (const [name, manifest] of manifests) {
    if (!SEMVER.test(manifest.version)) {
      throw new Error(`${name} must have a valid semantic version; received ${manifest.version}`)
    }
  }
}

function exactVersionMismatch(currentVersions, expectedVersions) {
  for (const [name, expected] of expectedVersions) {
    const current = currentVersions.get(name)
    if (current !== expected) return { name, current, expected }
  }
  return undefined
}

export function compareStableSemver(left, right) {
  const leftMatch = STABLE_SEMVER.exec(left)
  const rightMatch = STABLE_SEMVER.exec(right)
  if (!leftMatch) throw new Error(`${left} must be a stable semantic version`)
  if (!rightMatch) throw new Error(`${right} must be a stable semantic version`)

  for (let index = 1; index <= 3; index++) {
    const leftPart = BigInt(leftMatch[index])
    const rightPart = BigInt(rightMatch[index])
    if (leftPart > rightPart) return 1
    if (leftPart < rightPart) return -1
  }
  return 0
}

export function assertLaunchVersionPolicy({
  currentVersions,
  baselineVersions,
  launchVersions,
  hasLaunchChangeset,
  allLaunchVersionsPublic,
}) {
  const baselineMismatch = exactVersionMismatch(currentVersions, baselineVersions)
  if (hasLaunchChangeset) {
    if (baselineMismatch) {
      throw new Error(
        `${baselineMismatch.name} launch baseline must be ${baselineMismatch.expected}; received ${baselineMismatch.current}`,
      )
    }
    return 'baseline'
  }

  const launchMismatch = exactVersionMismatch(currentVersions, launchVersions)
  if (!launchMismatch) return 'release'

  if (!allLaunchVersionsPublic) {
    throw new Error(
      `Launch versions are not all public; ${launchMismatch.name} must remain ${launchMismatch.expected} but is ${launchMismatch.current}`,
    )
  }

  for (const [name, minimum] of launchVersions) {
    const current = currentVersions.get(name)
    if (compareStableSemver(current, minimum) < 0) {
      throw new Error(`${name} must be at least ${minimum}; received ${current}`)
    }
  }
  return 'stable'
}

export async function queryPublicLaunchVersions(
  launchVersions,
  {
    fetchImpl = globalThis.fetch,
    registry = 'https://registry.npmjs.org',
    timeoutMs = 10_000,
  } = {},
) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required for public npm registry verification')
  }

  const registryRoot = registry.replace(/\/$/, '')
  const results = await Promise.all(
    [...launchVersions].map(async ([name, version]) => {
      const url = `${registryRoot}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`
      let response
      try {
        response = await fetchImpl(url, {
          method: 'GET',
          headers: { accept: 'application/json' },
          credentials: 'omit',
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Unable to verify ${name}@${version} from the public npm registry: ${message}`)
      }

      if (response.status === 404) return `${name}@${version}`
      if (response.status !== 200) {
        const suffix = response.statusText ? ` ${response.statusText}` : ''
        throw new Error(
          `The public npm registry returned ${response.status}${suffix} for ${name}@${version}`,
        )
      }

      let metadata
      try {
        metadata = await response.json()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`The public npm registry returned invalid JSON for ${name}@${version}: ${message}`)
      }
      if (metadata.name !== name || metadata.version !== version) {
        throw new Error(
          `The public npm registry returned unexpected metadata ${metadata.name ?? 'unknown'}@${metadata.version ?? 'unknown'} for ${name}@${version}`,
        )
      }
      return undefined
    }),
  )
  const missing = results.filter(Boolean)
  return { allPublic: missing.length === 0, missing }
}
