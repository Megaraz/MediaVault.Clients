# `@mediavault/client-core`

This private workspace package owns deterministic client behavior that web and
Android can share without importing either runtime. It depends only on
`@mediavault/contracts` and the public ResultPattern v2 entry point.

## Public boundary

- typed API-operation factories preserve MediaVault.Api routes, methods,
  paging, request bodies, authentication requirements, and response kinds;
- `executeOperation` builds a platform-neutral request and maps responses,
  network errors, and cancellation through ResultPattern v2;
- injected capabilities resolve a token synchronously or asynchronously and
  execute the request without exposing storage or `fetch` to the core;
- pure user/media validation returns field-safe ResultPattern failures;
- provider DTO mappers normalize metadata into immutable primitives that an
  app can adapt to its own form or model.

The package does not own `localStorage`, SecureStore, `fetch`, base URL
configuration, React, hooks, navigation, Expo, SQLite, UI state, rendered error
messages, retries, or logging. Each app supplies a small transport adapter and
retains its platform-specific orchestration.

## Mapper decision

The audit did not move Android's `MediaEntryDtoMapper`, `MediaEntryEntityMapper`,
or user entity mappers. They target Android-owned models, `Rating`, UUID
generation, timestamps, and SQLite semantics; web has no equivalent domain
model. Sharing them would turn the core into an Android persistence package.

The duplicated provider-to-form logic in both clients is genuinely pure. The
core therefore exposes provider-to-metadata mappers, while #28 and #29 remain
responsible for adapting normalized numbers/dates/strings into local form state.

## Adapter shape

```ts
const capabilities = {
  baseUrl,
  accessToken: { getAccessToken },
  transport: { send: (request) => fetch(request.url, request) },
};

const result = await executeOperation(currentUserOperation(), capabilities, signal);
```

Adapters must not log tokens or request authorization headers. An absent token
is allowed so the API can return its authoritative 401 response. Invalid token
header values are rejected locally as unexpected failures.

## Verification

```powershell
npm ci
npm run test:result-pattern
npm run test:client-core
```
