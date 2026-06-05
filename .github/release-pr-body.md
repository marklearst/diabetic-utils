## Summary

- publish the five new `@glucoseiq/*` packages at 1.0.0
- publish `diabetic-utils` 2.0.0 as the compatibility bridge from 1.5.x
- update package manifests, changelogs, and internal dependency ranges

## Packages

- `@glucoseiq/core@1.0.0`
- `@glucoseiq/react@1.0.0`
- `@glucoseiq/tokens@1.0.0`
- `@glucoseiq/testing@1.0.0`
- `@glucoseiq/cli@1.0.0`
- `diabetic-utils@2.0.0`

## Release gate

- review versions, changelogs, dependency ranges, and packed manifests before merging
- merge only after `glucoseiq.health` is live and the npm bootstrap credential is ready
- merging publishes the public packages with provenance
