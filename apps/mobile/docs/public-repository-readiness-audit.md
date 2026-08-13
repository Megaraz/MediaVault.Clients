# Public repository readiness audit

Status: implementation evidence for
[`Megaraz/MediaVault.Clients#1`](https://github.com/Megaraz/MediaVault.Clients/issues/1)

Audit date: 2026-07-28

## Scope

The audit covered the current tree and every local/remote Git ref available in
the checkout, high-risk filenames and content patterns, package resolution,
environment and Expo/EAS configuration, tracked IDE/generated state, and GitHub
Actions workflows and artifacts. Secret values were never printed into the
issue, documentation, or command output.

## Findings and remediation

- Gitleaks v8.30.1 scanned the complete pre-PR history (more than 1.2 MB) with
  full redaction and reported zero findings.
- No signing files, private keys, local databases, `google-services.json`, or
  tracked environment-value files were found.
- A historical `.env.example` contained only a local placeholder and was later
  deleted. The restored `.env.example` contains public placeholders only.
- `package.json` and `package-lock.json` contained a sibling `file:` dependency
  and an accidental `undefined` dependency with an owner-machine path.
- IntelliJ/Android Studio `.idea` state was tracked. It is removed from the
  current tree and `.idea/` is now ignored.
- No GitHub Actions workflows, runs, or artifacts exist for this repository.
  Visible CI belongs to Android issue #3.
- No `eas.json`, `.easignore`, or EAS project identifier exists in app
  configuration. There is therefore no repository-linked EAS build/update
  configuration or artifact set to expose. This must be audited again if EAS is
  configured later.

`npm audit --omit=dev` reports 31 production-tree advisories (11 moderate and
20 high, with no critical findings) across the current Expo 54/React Native
dependency graph. Several direct packages are affected, including Expo and
React Native. Resolving those advisories requires separately scoped framework
and dependency upgrades rather than an automatic audit fix; issue #1 does not
silently change the supported SDK or application behavior. The warning must
remain visible during dependency-upgrade planning.

## Dependency decision

`result-pattern-typescript` was not available from npm or a public Git
repository. The approved solution is a repository-owned package at
`packages/result-pattern-typescript`, linked through the repository's npm
workspace configuration.

This is intentionally an in-repository `file:` dependency: it is available in
the same clean clone, has no owner-specific path, and does not require an
unpublished external package. Its source, distribution, tests, version, and
versioning policy are checked in together. Normal Metro package resolution
replaces the former sibling-directory resolver.

## History decision

History rewriting is not required for this issue.

The only historical exposure found was low-risk machine/IDE state and dependency
paths. No credential, signing material, private value, or runtime user data was
found that requires revocation or removal from Git objects. Rewriting every
commit would create clone/branch coordination risk disproportionate to that
historical metadata. The public default branch removes the files and paths, and
this audit records the decision for the final visibility review.

If a later audit discovers a live or private value, revoke or rotate it first,
then create a coordinated history-rewrite plan covering branches, clones,
pull-request refs, and reintroduction prevention.

## Local configuration

Copy the safe example file and edit only the ignored local copy:

```powershell
Copy-Item .env.example .env.local
```

`EXPO_PUBLIC_MEDIA_VAULT_API_URL` is the public backend base URL.
`EXPO_PUBLIC_USE_CLIENT_DATABASE` controls the optional client-side database.
Every `EXPO_PUBLIC_*` value is embedded in the client bundle and must never
contain a secret.

Local `.env*` variants, signing material, Expo/build output, IDE state, generated
native folders, TypeScript build state, and local SQLite files are ignored.

## Audit and verification commands

The redacted full-history secret scan used:

```powershell
gitleaks git <repository> --redact=100 --report-format json `
  --report-path <temporary-report> --log-opts="--all"
```

Repository verification:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npx expo-doctor
git ls-files |
  Select-String -Pattern '(^|/)(\.env($|\.)|.*\.(jks|p8|p12|key|pem|mobileprovision)$)|[A-Za-z]:\\Users\\'
git log --all --format= --name-only -- '.env*' '*.jks' '*.p8' '*.p12' `
  '*.key' '*.pem' '*.mobileprovision' 'google-services.json' |
  Sort-Object -Unique
git diff --check
```

## Clean-clone evidence

A fresh clone of commit `5d42c5c` was verified outside the development
checkout, with no sibling ResultPattern repository available through package or
Metro configuration:

- `npm ci`: passed and left the lock file unchanged.
- Vendored package build: passed and left checked-in `dist/` unchanged.
- Vendored package tests: 6 passed, 0 failed.
- `npm run lint`: passed with 11 existing warnings and no errors.
- `npx tsc --noEmit`: passed.
- `npx expo-doctor`: all 18 checks passed.
- Android Expo export: passed and produced the application bundle. Metro
  reported the existing `@noble/hashes/crypto.js` package-exports fallback
  warning.
- Gitleaks full-history scan: zero findings.
- Current-tree machine-path scan: zero matching files.
- `git diff --check`: passed.
- Final clean-clone `git status --short`: empty.

The high-risk tracked-path command reports only `.env.example`; its two values
are the documented public placeholder and boolean feature flag.
