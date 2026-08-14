# .NET compatibility contract

## Reviewed baseline

This contract was reviewed on 2026-08-14 against the package source available
locally and the exact references in MediaVault.Api:

| Package | Version used by MediaVault.Api | Client relevance |
| --- | --- | --- |
| `Megaraz.ResultPattern` | `0.2.2` | Authoritative result, error, validation, code/context, and mapping invariants. |
| `Megaraz.ResultPattern.AspNetCore` | `0.1.2` in the API project; `0.1.1` in Infrastructure | `0.1.2` owns the API result-to-HTTP boundary. The older Infrastructure reference supports backend outbound HTTP and is not a client contract. |
| `Megaraz.ResultPattern.Infrastructure` | `0.1.0` | Database error implementation is server-only and excluded. |

MediaVault.Api's own `ResultResponseMapper` remains authoritative where it
customizes the package. Ordinary failures expose `{ message, code }`,
validation failures expose `{ message, validationErrors }` without validation
codes, and unexpected exceptions expose safe ProblemDetails with a trace
identifier intended for support correlation, not UI presentation.

## Compatibility matrix

| .NET concept | TypeScript decision | Observable compatibility or deliberate difference |
| --- | --- | --- |
| `Result` / `Result<T>` | `Result<T>` discriminated union | Success has a non-null value; failure has one primary public error; validation failures have at least one field error. Factories freeze created containers. TypeScript narrows on `ok` instead of throwing from `Value`. |
| `IsSuccess` / `IsFailure` | `result.ok` | One boolean discriminant represents the same mutually exclusive states and works naturally in components and hooks. |
| `Message` | `error.message` | Failure messages are presentation-safe and bounded. Success carries no unused message. |
| `PrimaryError` | `error` | Keeps only `kind`, stable public `code`, and safe `message`; technical description and exception are deliberately absent. |
| `ValidationErrors` / `ValidationError` | `validationErrors` / `FieldError` | Keeps field plus safe message for form binding. Backend validation codes are not invented because MediaVault's 422 JSON does not expose them. |
| `ErrorType` | `ErrorKind` string union | Semantic equivalents for expected client decisions; server `External` is split into client-meaningful `network` and `rate-limited`. |
| `ErrorCode` | validated `code` string | Accepts MediaVault's stable public codes but rejects blank, long, control-bearing, or unusual values. Server operation/entity code construction is not needed by response consumers. |
| `ErrorContext` | excluded from root | Layer, service, method, entity, and field context is useful for server diagnostics but risks leaking implementation detail in UI state. Client adapters create explicit public errors instead. |
| `ErrorReasonCode` / `ErrorCodeReasons` | excluded from root | Backend reason construction is not duplicated. Public API codes are treated as versioned strings. |
| `ResultExtensions.Map` / `MapAsync` | `map`, `mapAsync`, `flatMap` | Failures pass through unchanged; transforms run only for success. `flatMap`, `match`, and `valueOr` are client-focused additions. |
| ASP.NET `ErrorResponseBody` | defensive response adapter | Reads only validated `message` and `code`; unknown properties are discarded. |
| ASP.NET `ValidationErrorResponseBody` | defensive response adapter | Reads a bounded list of safe field/message pairs. Invalid shapes become a safe generic failure. |
| ASP.NET `MappedHttpResponse`, MVC/minimal API extensions, status policy | excluded | These create server responses and have no browser/React Native equivalent. |
| `HttpResponseToResultExtensions` / `HttpError` | adapted as `resultFromResponse` and `resultFromRequestError` | The client consumes Fetch `Response`; it never retains raw bodies, response objects, status text, exceptions, or provider diagnostics. Abort remains distinct cancellation. |
| `PaginationParameters.Normalize` | `normalizePagination` | Matches 1-based page-number and bounded page-size clamping; additionally rejects non-safe JavaScript integers. |
| Infrastructure `DatabaseError` | excluded from root | Provider/database classifications, exceptions, and diagnostic descriptions belong to backend or platform persistence adapters. |
| `ILogger`, file logging, exception/stack handling | excluded | Diagnostics belong at an application monitoring boundary. The Result value is safe to render/serialize and cannot carry those details. |

## Security and privacy rules

- Never place passwords, tokens, personal data, connection information,
  private URLs, exception messages, stack traces, response dumps, or trace IDs
  into `ResultError.message` or `code`.
- Treat the backend as authoritative for public expected-failure wording and
  codes only where the response has the documented MediaVault shape.
- Ignore remote messages for 401, 403, all 5xx responses, malformed bodies,
  transport exceptions, and cancellation.
- Do not use a Result as a diagnostic log envelope. Monitoring adapters may
  observe a category and public code but must capture technical diagnostics
  separately and redact them under their own policy.
- Do not infer authorization from an error kind or code; the server remains the
  authorization authority.

## Deliberate adoption boundary

Issue #22 establishes the package contract but does not redesign either
frontend. Existing Android imports use the deprecated `/legacy` bridge without
workflow changes. The platform-neutral client-core work may adopt the root API;
the later web and Android migrations own application integration and manual UI
flow verification.

## Reviewing a future NuGet upgrade

1. Record every exact package version referenced by each MediaVault.Api
   project; do not collapse mixed versions to `0.x`.
2. Compare the published/source public surface and tests for Result invariants,
   error categories/codes, validation, mapping, pagination, and cancellation.
3. Compare MediaVault.Api's own response mapper and exception boundary because
   application policy can override package defaults.
4. Update this matrix with each equivalent, adaptation, exclusion, or contract
   gap before changing TypeScript.
5. Add focused tests for every changed client-relevant behavior and explicitly
   test that new backend diagnostics cannot reach Result values.
6. Bump the TypeScript package according to semantic versioning, regenerate
   `dist/` and the root lock file, then run the repository verification suite
   from a clean install with no sibling checkout dependency.
