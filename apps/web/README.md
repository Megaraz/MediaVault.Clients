# React + TypeScript + Vite

This Vite web client uses React and TypeScript with Fast Refresh.

## Linting

The web workspace uses Oxlint 1.78.0:

```powershell
npm run lint --workspace=media-vault-app.client
```

The configuration in `.oxlintrc.json` lints `**/*.{ts,tsx}`, preserves the
browser and ES2020 globals from the previous web configuration, and ignores
`dist`. It keeps the web lint scope separate from the repository root and the
Expo client.

### ESLint migration record

The migration was researched on 2026-08-15 against the
[Oxlint v1.78.0 release](https://github.com/oxc-project/oxc/releases/tag/apps_v1.78.0),
the [ESLint migration guide](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html),
[compatibility matrix](https://oxc.rs/compatibility), [built-in plugin
documentation](https://oxc.rs/docs/guide/usage/linter/plugins.html),
[JavaScript-plugin documentation](https://oxc.rs/docs/guide/usage/linter/js-plugins.html),
and [versioning policy](https://oxc.rs/docs/guide/usage/linter/versioning.html).
Version 1.78.0 is the latest release at migration time and supports the web
job's Node.js 24 runtime and the repository's Node.js 20.19 baseline
(`^20.19.0 || >=22.12.0`).

The current diagnostic intent is mapped as follows:

| Existing coverage | Oxlint coverage |
| --- | --- |
| `@eslint/js` recommended rules | Native Oxlint core rules, including the nursery `no-undef` rule |
| `typescript-eslint` recommended rules | Native `typescript` plugin rules |
| `eslint-plugin-react-hooks` 7.0.1 | Oxlint JavaScript plugin alias `react-hooks-js`, preserving the complete current preset |
| `eslint-plugin-react-refresh` 0.4.26 | Oxlint JavaScript plugin, preserving `allowConstantExport: true` |
| Import syntax and core import checks | Oxlint's TypeScript parser and native core import rules; the old config did not enable `eslint-plugin-import` |

The two core rules reported by the migration tool as superseded by strict
modules (`no-dupe-args` and `no-octal`) do not need separate Oxlint rules.
The React Compiler-era rules in the Hooks preset (`static-components`,
`use-memo`, `component-hook-factories`, `preserve-manual-memoization`,
`incompatible-library`, `immutability`, `globals`, `refs`,
`set-state-in-effect`, `error-boundaries`, `purity`, `set-state-in-render`,
`unsupported-syntax`, `config`, and `gating`) have no stable one-to-one
Oxlint rule in v1.78.0. Oxlint's experimental `react/react-compiler`
aggregate reports findings that were absent from the clean ESLint baseline, so
it is intentionally not enabled until the parent migration can review that
policy difference.

## MediaVault client boundaries

The web API clients import approved platform-neutral behavior from
`@mediavault/client-core`. Operation factories, response/error mapping,
cancellation handling, user/media validation, and provider metadata
normalization belong to that package.

`src/Clients/apiFetch.ts` is the browser adapter. It owns the `localStorage`
token store and the browser `fetch` transport; the core receives those
capabilities through dependency injection and never accesses browser globals.
The web clients keep their class methods and DTO return shapes as adapters for
the existing UI and router flows. Web-only form conversion, search-result view
models, routing, hooks, components, and UI state remain under `apps/web`.
