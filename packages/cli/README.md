# @glucoseiq/cli

Zero-code CGM analysis from the terminal.

```bash
npx @glucoseiq/cli report data.csv
npx @glucoseiq/cli report clarity.csv --value-col "Glucose Value (mg/dL)" --agp-svg agp.svg
```

Prints a clinician-grade report (Glucose IQ score, GMI, TIR/TITR, variability, episodes) and can emit the AGP chart as a self-contained SVG. Powered by `@glucoseiq/core`.

Informational only — not medical advice.

MIT © Mark Learst
