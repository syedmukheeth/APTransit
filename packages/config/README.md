# packages/config (`@aptransit/config`)

Shared tool presets. Change with care: every package uses them.

| Export | Used by | Notes |
| --- | --- | --- |
| `@aptransit/config/tsconfig.base.json` | every tsconfig | strict, `noUncheckedIndexedAccess`, ES2023. Each package sets its own module settings (api and shared: `nodenext`; web and ui: `bundler`) |
| `@aptransit/config/eslint` | every `eslint.config.mjs` | `base` (JS + typescript-eslint for Node and libraries), `sharedIgnores`, `sharedRules` (no-console warn, eqeqeq, unused vars, consistent type imports), `nestParserOptions` (keeps value imports Nest needs for dependency injection) |
| `@aptransit/config/prettier` | root `prettier.config.mjs` | print width 100, double quotes, trailing commas |

The web app does not use `base`: it uses Next's own ESLint configs plus `sharedIgnores` and `sharedRules`, because Next already registers the TypeScript and jsx-a11y plugins.
