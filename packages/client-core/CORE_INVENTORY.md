# Client-core inventory

| Examined concern | Decision | Reason |
| --- | --- | --- |
| API route/method/query/body construction in both apps' `Clients/` and `clients/` | Share | Near-duplicate and platform-neutral; several user routes had already drifted from the API. |
| Bearer attachment and base URL resolution | Inject token and transport capabilities; build the safe request in core | Web token reads are synchronous and mobile SecureStore reads are asynchronous. Storage and `fetch` stay local. |
| Response/error/cancellation mapping | Share by composing ResultPattern v2 | Existing clients throw raw response text; the v2 API already owns safe error interpretation and cancellation. |
| User and media title validation | Share | Pure rules mirror current backend-required fields and produce field-safe ResultPattern failures. |
| TMDB/RAWG/Google Books detail mapping | Share normalized metadata | The same deterministic mapping is embedded in both rendered UI components. |
| Android DTO/entity mappers | Keep Android-local | Depend on Expo UUID generation, Android models, `Rating`, timestamps, relationships, and SQLite semantics; web has no equivalent target. |
| Web/Android form serialization | Keep app-local | String/number conversion and empty-field behavior are presentation policy and should adapt to shared DTOs explicitly. |
| Token persistence, request transport, base URL source | Keep app-local adapters | Browser `localStorage`, SecureStore, Vite proxying, and Expo environment configuration are platform capabilities. |
| Services, hooks, navigation, UI, SQLite repositories and synchronization | Keep app-local | Application orchestration and platform behavior, not deterministic cross-client policy. |
| Retry and timeout policy | Defer | No approved client policy exists; cancellation must be preserved and non-idempotent retries require a separate decision. |

## Adoption notes

- #28 should implement a browser adapter and replace route construction, raw
  response text errors, validation, and provider mapping only where this public
  API fits.
- #29 should implement an async SecureStore/fetch adapter and preserve the
  Android services and SQLite mappers around the core.
- Both migrations must use `@mediavault/contracts` names (`Ongoing`,
  `TvSeries`, `usernameOrEmail`) and remove superseded local code only after
  behavior is verified.
