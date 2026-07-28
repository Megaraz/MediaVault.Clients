# AGENTS.md - MediaVault Android

## Scope and precedence

This is the root instruction file for AI-assisted work in the MediaVault Expo
Android repository. It applies to application code, local persistence, tests,
configuration, and documentation.

- Treat checked-out code, `package.json`, `package-lock.json`, app
  configuration, tests, and the active issue as the source of truth.
- Read the nearest nested `AGENTS.md` if one is added later; more specific
  instructions override this file for that subtree.
- Distinguish current behavior from approved work in progress and future
  direction. Never describe roadmap work as implemented.
- Revalidate version-sensitive claims from the manifests and the exact
  versioned Expo documentation.
- For Expo SDK 54 work, read
  <https://docs.expo.dev/versions/v54.0.0/> before changing application code or
  configuration. SDK 54 requires Node.js 20.19.x or newer.

## Product mission

MediaVault is a personal media library for movies, TV series, games, books, and
manga. Users can build a library, track status and ratings, write reviews, and
enrich entries through metadata providers.

This repository has three equal goals:

1. A credible public portfolio project with readable code and honest
   documentation.
2. A useful Android client for the live MediaVault product.
3. A deliberate learning environment for improving professional engineering
   judgment.

Optimize for correctness, security, data integrity, maintainability, and user
value. Prefer production-minded simplicity over prototype shortcuts or
enterprise ceremony.

## Repository and ecosystem boundaries

This repository owns the Expo/React Native client. The ASP.NET Core API and
React web client live in `Megaraz/media-vault-app`. ResultPattern .NET packages
are separate published packages. The TypeScript ResultPattern port used by this
app is vendored in `packages/result-pattern-typescript`.

- Do not modify sibling repositories or external packages unless the user
  explicitly puts them in scope.
- Treat API routes, JWT authentication, HTTP statuses, JSON and error shapes,
  pagination, identifiers, and synchronization metadata as contracts shared by
  Android, web, and the backend.
- Before intentionally changing a shared contract, inspect its API/web
  producers and consumers. Update every in-scope consumer together or document
  the exact compatibility gap.
- Do not reintroduce sibling-checkout, absolute-path, unpublished external, or
  machine-specific dependencies.
- Keep the vendored ResultPattern package versioned and self-contained. Change
  its behavior only through a separately scoped issue with focused package and
  Android verification.

## Current system map

Revalidate this map before architectural work:

- `app/`: Expo Router screens and layouts.
- `components/`: reusable presentation and interaction components.
- `clients/`: MediaVault API and metadata-provider transport clients.
- `services/`: application workflows coordinating clients, validation, and
  persistence.
- `shared/`: authentication context, token storage, authorized fetch, feature
  flags, and shared runtime helpers.
- `database/`: opt-in Expo SQLite initialization, migrations, and repositories.
- `models/`, `types/`, and `mappers/`: client models, API DTOs, and mapping.
- `validators/`: application input validation.
- `packages/result-pattern-typescript/`: repository-owned ResultPattern package.
- `docs/`: durable operational and architecture documentation.

The app currently uses Expo SDK 54, React Native 0.81, React 19, Expo Router,
strict TypeScript, JWT bearer authentication, `expo-secure-store`, and optional
Expo SQLite persistence. Exact versions and behavior must still be verified
from code.

Offline synchronization, production distribution, visible CI, observability,
and AI recommendations are directions or separate issues unless the checked-out
code and active issue prove otherwise.

## Architecture rules

- Keep screens and components focused on presentation, navigation, form state,
  loading, and user feedback.
- Keep HTTP behavior in `clients/` and shared transport/authentication helpers.
  Do not scatter raw `fetch` calls through screens.
- Keep workflow and mapping decisions in services and mappers rather than UI
  components.
- Keep Expo SQLite details behind `database/` repositories and the database
  provider.
- Put a business rule in the narrowest boundary that can enforce it
  consistently.
- Prefer explicit TypeScript over `any`, unsafe casts, reflection-like
  indirection, or hidden side effects.
- Reuse an existing abstraction only when it genuinely fits. Do not add a state
  library, data layer, navigation framework, or major pattern without comparing
  it to a smaller change.

## API, authentication, and security

- Authentication is JWT bearer authentication. Do not describe or implement it
  as cookie authentication without an approved cross-client contract change.
- Keep JWT storage centralized through `shared/tokenStore.ts` and
  `expo-secure-store`. Never move tokens to AsyncStorage, source code, logs, or
  public Expo variables.
- Keep authorization-header attachment centralized through
  `shared/apiFetch.ts`.
- Never trust a client-supplied owner identifier as authorization. The backend
  remains authoritative for user ownership.
- Never commit or log passwords, password hashes, JWTs, signing keys, API keys,
  connection secrets, private URLs, or sensitive personal data.
- `EXPO_PUBLIC_*` values are embedded in the client bundle. Use them only for
  public runtime configuration such as the API base URL and feature flags.
- Validate and bound user input, remote URLs, pagination, and metadata-provider
  payloads. Do not display raw backend, upstream, or exception text directly to
  users.
- Preserve protected routes, logout/token-removal semantics, and the minimum
  user-data contract when changing authentication flows.

## Data, SQLite, and synchronization

- The backend is authoritative for shared account and library data unless an
  approved design explicitly changes that policy.
- The optional client database is controlled by
  `EXPO_PUBLIC_USE_CLIENT_DATABASE`; do not silently enable it for every user.
- Treat local `.db`, `.db-wal`, `.db-shm`, `.sqlite`, and `.sqlite3` files as
  stateful runtime data. Never stage, overwrite, or delete them unless the task
  explicitly requires it and their role is verified.
- Preserve migration ordering and idempotence. Test representative upgrade
  behavior when changing local schema or migrations.
- Never implement synchronization by copying the backend SQLite file.
- Before general offline sync, document server authority, stable identifiers,
  change/version tracking, tombstones, idempotency, conflict policy, clock
  assumptions, migrations, retries, and recovery.

## Cancellation, failures, and external calls

- Expected failures should be explicit results or safe UI states; exceptions
  are for unexpected failures.
- Preserve caller cancellation and abort semantics where supported. Do not turn
  cancellation into a generic unexpected error.
- Define timeout and retry policy per external boundary. Retry only bounded,
  transient, idempotent operations and respect provider throttling.
- Keep technical diagnostics separate from stable, safe user messages.
- Avoid logging the same error at the client, service, component, and monitoring
  boundary.

## Expo, dependencies, and configuration

- Use the exact versions and lock file checked into the repository.
- Use `npm ci` for clean verification. Do not switch package managers casually.
- Install Expo-managed libraries with `npx expo install` and verify compatibility
  with `npx expo-doctor`.
- Do not add or upgrade a production dependency without checking official,
  version-appropriate documentation and explaining why existing platform or
  repository code is insufficient.
- Keep `metro.config.js` based on `expo/metro-config`. Add custom resolution only
  when a checked-in dependency cannot use normal Metro resolution and the need
  is verified.
- Keep local values in ignored `.env.local`; keep `.env.example` limited to safe
  placeholders. Do not commit generated native folders, Expo state, build
  output, IDE state, signing material, or local databases.

## Frontend and accessibility

- Use functional React and strict TypeScript.
- Separate server state, form state, authentication state, persistence state,
  and presentation state.
- Preserve accessible labels, touch targets, keyboard/focus behavior, loading
  states, empty states, and actionable errors.
- Keep effect dependencies accurate and Hook order stable.
- Avoid effect-driven state resets when component lifecycle or explicit event
  handling can express the behavior more clearly.
- Test on an Android device or emulator when a change affects navigation,
  platform APIs, layout, gestures, secure storage, or SQLite.

## Working method

1. Read relevant code, tests, manifests, and active design documents.
2. Read the exact Expo SDK 54 documentation before code/configuration changes.
3. Check `git status` and preserve unrelated owner work.
4. Establish the narrowest useful baseline and record pre-existing failures.
5. For substantial work, state behavior, boundaries, contract impact, risks,
   and verification before implementation.
6. Make the smallest coherent change and avoid formatting churn.
7. Add focused tests when an appropriate test seam exists.
8. Update documentation when setup, configuration, contracts, architecture,
   migrations, public behavior, or operational expectations change.
9. Run narrow checks first, then broaden them in proportion to risk.
10. Report exact results and remaining manual steps without overstating
    completion.

Do not commit, push, open a pull request, publish, deploy, rewrite history,
change visibility, mutate external services, or modify sibling repositories
unless the user requested that action.

## Validation commands

From the repository root:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npx expo-doctor
git diff --check
```

For dependency or Metro-resolution changes, also create an Android bundle with
`npx expo export --platform android` in a disposable output directory. For
public-readiness work, repeat the supported flow from a clean clone with no
sibling repository available.

There is no established application test suite merely because lint and
type-check commands exist. Do not claim automated UI or behavioral coverage
that the repository does not contain.

## Code review priorities

Prioritize findings that can cause:

- token, password, secret, signing-material, or personal-data exposure;
- missing authentication or cross-user access;
- breaking API/authentication/JSON/sync contracts;
- local database loss or unsafe migrations;
- untrusted upstream content reaching users or storage;
- swallowed cancellation or unsafe retries;
- machine-local or unpublished dependencies;
- generated, IDE, environment, database, or signing files entering Git;
- tests or checks that pass while asserting the wrong contract.

Do not spend review attention on formatting already enforced by tooling unless
it obscures correctness.

## Definition of done

A task is done only when:

- the requested behavior is implemented at the correct boundary;
- security, ownership, data integrity, cancellation, and compatibility were
  considered;
- relevant checks pass, or exact pre-existing/blocking failures are reported;
- API and every in-scope consumer agree on shared contracts;
- configuration contains no secrets and has a documented setup path;
- local data and migration behavior were reviewed when relevant;
- documentation describes current reality;
- the diff contains no unrelated work or accidental generated/runtime files.

## Collaboration and learning

Be direct, constructive, and specific. Explain important Expo conventions,
tradeoffs, security policy, data ownership, and failure modes without turning
routine edits into lectures. Finish requested implementation unless the user
asks for guided-only work. Prefer evidence—checks, documented decisions,
reproducible setup, and observable behavior—over inflated quality claims.
