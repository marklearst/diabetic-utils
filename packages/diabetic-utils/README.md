# diabetic-utils

> Compatibility bridge for **[GlucoseIQ](https://glucoseiq.health)**.

`diabetic-utils@2.0.0` moves projects from `diabetic-utils` 1.5.x to
**[`@glucoseiq/core@1`](https://www.npmjs.com/package/@glucoseiq/core)** while
preserving the existing root import and public exports:

```ts
import { calculateEnhancedTIR, estimateGMI } from 'diabetic-utils'
```

```bash
npm install diabetic-utils@^2
```

Version 2 requires Node 24 or newer. Projects on an older Node release can
remain on the 1.5.x line through the `legacy` dist-tag.

New projects should depend on `@glucoseiq/core` directly and use the GlucoseIQ
package ecosystem, including `@glucoseiq/react`, `@glucoseiq/tokens`,
`@glucoseiq/testing`, and `@glucoseiq/cli`.

```bash
npm install @glucoseiq/core
```

See the full documentation at **[glucoseiq.health](https://glucoseiq.health)**.

## License

MIT © Mark Learst
