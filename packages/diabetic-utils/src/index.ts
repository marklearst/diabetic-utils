/**
 * diabetic-utils — compatibility shim.
 *
 * This package now re-exports {@link https://www.npmjs.com/package/@glucoseiq/core | @glucoseiq/core}.
 * Every existing `diabetic-utils` import keeps working unchanged; new projects
 * should depend on `@glucoseiq/core` directly.
 *
 * @see https://glucoseiq.health
 */
export * from '@glucoseiq/core'
