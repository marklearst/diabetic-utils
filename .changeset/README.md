# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

To record a change for the next release:

```bash
pnpm changeset
```

Pick the affected packages and a semver bump, and describe the change. The
committed changeset drives the automated "Version Packages" PR and the npm
publish (with provenance) in `.github/workflows/release.yml`.

Publishing requires the `NPM_TOKEN` repository secret; without it nothing is
published.
