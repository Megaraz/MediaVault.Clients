# ResultPattern TypeScript

`result-pattern-typescript` is MediaVault's private, dependency-free Result
Pattern for browser and React Native code. Version 2 is conceptually compatible
with the .NET ResultPattern used by MediaVault.Api, but deliberately uses a
TypeScript discriminated union instead of copying server classes.

The package keeps expected failures explicit while ensuring UI code receives
only a stable public code, a bounded safe message, and optional field errors.
It never retains exceptions, stacks, response objects, ProblemDetails detail,
trace identifiers, database diagnostics, or service/method context.

See [COMPATIBILITY.md](./COMPATIBILITY.md) for the reviewed NuGet versions,
concept mapping, deliberate differences, and upgrade procedure.

## Public API

The package root is the only entry point for new code:

```ts
import {
  errorsByField,
  match,
  resultFromRequestError,
  resultFromResponse,
  type Result,
} from "result-pattern-typescript";

async function loadEntry(signal: AbortSignal): Promise<Result<MediaEntry>> {
  try {
    const response = await fetch("/api/media-entries/42", { signal });
    return resultFromResponse(response, { decode: decodeMediaEntry });
  } catch (error: unknown) {
    return resultFromRequestError(error);
  }
}

const text = match(result, {
  success: (entry) => entry.title,
  failure: (error) => error.message,
});

const fieldMessages = errorsByField(result);
```

The union is narrowed by `result.ok`. `success`, `failure`,
`validationFailure`, `map`, `mapAsync`, `flatMap`, `match`, `valueOr`, and
`errorsByField` support ordinary TypeScript and render logic without React or a
state-library dependency.

`resultFromResponse` understands MediaVault's current public contracts:

- ordinary expected failures: `{ message, code }`;
- validation failures: `{ message, validationErrors: [{ field, message }] }`;
- unexpected 500 responses: ProblemDetails is collapsed to a generic client
  failure and its `detail` and `traceId` are discarded.

Response bodies are bounded before parsing. Public codes and field paths must
match conservative character/length policies. Messages are bounded and reject
control characters. Authentication, authorization, 5xx, malformed, transport,
and cancellation paths use package-owned safe messages instead of remote or
exception text.

## Runtime boundaries

The package root uses only ECMAScript and the standard Fetch types. It contains
no Node, React, React Native, Expo, Vite, filesystem, logging, database, or
ASP.NET dependency and is suitable for both MediaVault clients.

`result-pattern-typescript/legacy` is a deprecated compatibility bridge for the
existing Android code while the frontends are rebuilt. It is not the API for
new work. It no longer exports the old Node file logger or server-shaped HTTP
mapper, and its error objects do not retain exceptions or technical
descriptions. Adopting the new root API in application/client-core code is
intentionally deferred to the dedicated follow-up work.

## Versioning and generated files

Version `2.0.0` establishes the new public contract. Breaking changes to the
root API require a major version; additive compatible changes require a minor
version; fixes that preserve behavior require a patch version.

`dist/` is checked in because the npm workspace consumes this private package
without a publish step. Source, declarations, JavaScript output, package
version, consuming workspace version, and the root lock file must change
together. The package must never depend on a sibling checkout or machine path.

## Verification

From the repository root:

```powershell
npm ci
npm run test:result-pattern
npm run lint --workspace=result-pattern-typescript
npm run lint --workspace=media-vault-android
npm run typecheck:mobile
npm run doctor:mobile
npm run lint --workspace=media-vault-app.client
npm run build:web
```

The package lint command uses the shared Oxlint configuration, checks maintained
`src/` and `test/` files, and excludes checked-in `dist/` output because it is
generated from the source during package builds.
The baseline intentionally retains one warning, `no-control-regex` at
`src/client.ts:164`, because that regex rejects control characters from public
messages; it remains warning-level while the package boundary is established.

An Android export remains the runtime-resolution proof for changes to package
entry points or workspace resolution.
