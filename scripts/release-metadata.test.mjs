import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workflow = readFileSync(join(root, '.github/workflows/release.yml'), 'utf8')
const pullRequestBody = readFileSync(join(root, '.github/release-pr-body.md'), 'utf8')

assert.match(workflow, /id: release-mode/)
assert.match(
  workflow,
  /- name: Version packages[\s\S]*if: steps\.release-mode\.outputs\.has_changesets == 'true'[\s\S]*run: pnpm changeset version/,
)
assert.match(
  workflow,
  /uses: peter-evans\/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1/,
)
assert.match(workflow, /branch: release\/glucoseiq-packages/)
assert.match(workflow, /base: main/)
assert.match(workflow, /commit-message: 'chore\(release\): version packages'/)
assert.match(workflow, /title: 'chore\(release\): version packages'/)
assert.match(workflow, /body-path: \.github\/release-pr-body\.md/)
assert.match(workflow, /delete-branch: true/)
assert.match(
  workflow,
  /- name: Publish packages[\s\S]*if: steps\.release-mode\.outputs\.has_changesets == 'false'[\s\S]*uses: changesets\/action@a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d/,
)
assert.doesNotMatch(workflow, /branch:\s*(?:changeset-release|create-pull-request)\//i)
assert.doesNotMatch(pullRequestBody, /\b(?:opened|generated) by\b/i)
assert.doesNotMatch(pullRequestBody, /\d+\.\d+\.\d+/)
assert.match(pullRequestBody, /GlucoseIQ package release/)

console.log('Release metadata contract passed.')
