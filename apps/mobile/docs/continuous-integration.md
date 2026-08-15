# Continuous integration and default-branch gates

The `CI` GitHub Actions workflow validates both client applications on every
pull request and on pushes to `main`.

## Checks

- **Expo quality gates** uses Node.js 20.19.x and the root workspace lock file
  to run `npm ci`, mobile lint, TypeScript checking, and Expo Doctor for Expo
  SDK 57.
- **Web (Node 24)** uses the same root workspace lock file to run `npm ci`, web
  lint, and the production build.
- **Dependency review** runs on pull requests and rejects newly introduced
  runtime vulnerabilities of moderate severity or higher. It keeps the
  official action's license inspection enabled without defining a separate
  repository allowlist or denylist.
- **CodeQL** uses GitHub's default setup and default query suite to analyze
  JavaScript/TypeScript and GitHub Actions code on pull requests,
  default-branch updates, and GitHub's scheduled cadence.

The workflows do not create an Android build, upload artifacts, start the API,
or access an emulator. Each job has a bounded timeout, and a newer run for the
same pull request or branch cancels an older run.

## Expo SDK 57 dependency baseline

The mobile workspace targets Expo `57.0.13` with React Native `0.86.2` and
React `19.2.3`. Expo SDK 55 and later always use the New Architecture, so the
obsolete `newArchEnabled` app-config field is not present. Android
edge-to-edge is mandatory for the supported SDK/runtime, so the removed
`android.edgeToEdgeEnabled` field is not replaced with a legacy system-bar
setting. The existing `predictiveBackGestureEnabled` setting remains explicit.

The web workspace uses React and React DOM `19.2.3` to share one React runtime
with the mobile workspace. The platform-neutral `packages/*` workspaces have no
React runtime or peer dependency and remain unchanged. The root `postcss`
development dependency and override pin all workspace consumers to `8.5.26`,
covering Expo Metro, Vite, Tailwind, and NativeWind without adding a nested
older runtime.

The root development dependencies also anchor the optional peers installed by
the hoisted Expo CLI (`expo-router`, React Native, Reanimated, Worklets, and
Metro config) to the SDK 57 versions. This keeps npm's workspace peer
resolution on the same native runtime as `apps/mobile`; these are install-time
deduplication anchors, not a second application dependency boundary.

When changing the Expo SDK, run the supported alignment flow from the mobile
workspace and then commit the resulting root lockfile:

```powershell
Push-Location apps\mobile
npx expo install expo@^57.0.0 --fix
Pop-Location
npx expo-doctor@latest
```

Run the Android export from `apps/mobile/` so Expo resolves that workspace's
`app.json`:

```powershell
Push-Location apps\mobile
npx expo export --platform android --output-dir $exportPath
Pop-Location
```

The migration also requires `npm ci`, the repository mobile and web quality
gates, shared-package tests, and an Android Expo export. Do not commit
generated native projects, Expo state, build output, local databases, or
environment files.

## Mobile Oxlint configuration

The Android workspace uses Oxlint `1.78.0` through its `lint` script. The script
targets the full mobile source tree; TypeScript checking remains a separate
repository gate for type correctness.

The native `import`, `react`, and TypeScript plugins replace the equivalent
ESLint plugins. Expo-specific rules continue through `eslint-plugin-expo` as an
Oxlint JavaScript plugin. `no-undef` is enabled explicitly because it is still
an Oxlint nursery rule. The configuration keeps browser, built-in, ES2022, and
React Native globals, the Metro Node override, and the existing
`android/app/build` and `dist` exclusions. Oxlint's correctness category stays
disabled so this migration does not silently introduce a broader policy.

The migration intentionally omits `import/no-unresolved`: the Oxlint
JavaScript-plugin bridge reports false positives for valid TypeScript path
aliases and extensionless imports in this Expo workspace, while TypeScript
checking remains the reliable module-resolution gate. Native Oxlint also reports
duplicate imports once per file rather than ESLint's two diagnostics; this is a
diagnostic-count difference only and does not change the warning-level policy.
The remaining unsupported mappings are intentional: `import/named` and
`import/export` and `react/require-render-return` are unavailable nursery
rules; `no-dupe-args` is superseded by strict mode; the React JSX-use rules are
unnecessary with the React 17+ transform and native unused-variable analysis;
and `react/no-deprecated` is covered by the native `typescript/no-deprecated`
rule.

The compatibility research was recorded on 2026-08-15. Oxlint `1.78.0` is
compatible with the mobile CI Node.js 20.19.x runtime and is also the version
used by the web workspace. The research used the [Oxlint release
history](https://github.com/oxc-project/oxc/releases), [ESLint migration
guide](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint),
[compatibility matrix](https://oxc.rs/compatibility), [built-in plugin
documentation](https://oxc.rs/docs/guide/usage/linter/plugins), [JavaScript
plugin documentation](https://oxc.rs/docs/guide/usage/linter/js-plugins.html),
and [versioning policy](https://oxc.rs/docs/guide/usage/linter/versioning).

## Permissions and configuration

The checked-in workflows grant the GitHub token read-only repository-content
access and disable credential persistence after checkout. Pull-request code
receives no write permission, Expo token, signing credential, deployment
credential, environment secret, or repository secret. Official GitHub actions
are pinned to reviewed commit SHAs so a mutable tag cannot silently change the
code executed by CI.

No secret or provider credential is required. CI does not start the app or API,
connect to metadata providers, initialize Expo SQLite, or create a local
database.

## Protected `main` policy

The active repository ruleset named **Protect main quality and security gates**
targets only the default branch. It:

- requires changes to reach `main` through a pull request;
- requires the `Expo quality gates`, `Web (Node 24)`, and `Dependency review`
  status checks against the latest `main` state;
- requires CodeQL code-scanning results and blocks error-level quality alerts or
  high-or-higher security alerts;
- blocks force pushes and deletion of `main`; and
- defines no routine bypass actor.

The required independent approval count is intentionally zero while MediaVault
has one maintainer. Requiring the only maintainer to obtain an independent
approval would make routine maintenance impossible. Raise the count to one as
soon as a trusted reviewer can reliably review changes; this is an explicit
solo-maintainer compromise, not independent review.

### Renaming a required check

Workflow and job names are repository policy because GitHub uses their exact
check contexts. Before intentionally renaming a required job:

1. keep the existing required context active;
2. introduce the new name on a pull request and wait for its successful check;
3. update the ruleset to require the new exact context while retaining the old
   one;
4. verify a fresh pull-request commit reports every required check and remains
   blocked while any one is pending; then
5. remove the obsolete context from the ruleset and workflow.

For CodeQL default setup, keep the ruleset's required tool name `CodeQL` aligned
with the tool reported by GitHub code scanning. Re-verify the ruleset after any
switch between default and advanced setup.

### Emergency recovery

There is no standing administrator or maintainer bypass. If a GitHub outage or
misconfigured required check blocks an urgent security or repository-recovery
change, the repository owner may temporarily edit the ruleset in **Settings >
Rules > Rulesets**. Record the reason, affected commit or pull request, time,
and exact temporary change in the relevant private operational record; use the
narrowest change; restore the ruleset immediately; and re-run the checks below.
Do not use this path for routine merges or to ignore a failing check.

After any ruleset or workflow change, verify the live policy:

```powershell
gh api repos/Megaraz/MediaVault.Clients/code-scanning/default-setup
gh api repos/Megaraz/MediaVault.Clients/rulesets
gh api repos/Megaraz/MediaVault.Clients/rules/branches/main
```

## Run the same checks locally

From the repository root:

```powershell
npm ci
npm run lint
npm run typecheck:mobile
npm run doctor:mobile
npm run build:web
```

Generated native folders, Expo state, build output, environment files, signing
material, local databases, and `node_modules` are ignored and must not be
committed.
