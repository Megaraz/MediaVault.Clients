# Shared contract inventory

Reviewed against `Megaraz/MediaVault.Api` main commit
`a75bbb105edf99a01baa3ebb32a9b2fc4507c10f` on 2026-08-14.

| Concern | API authority | Package decision |
| --- | --- | --- |
| Media entry base, concrete create/update/detail, minimal, and search DTOs | `media-vault-app.Application/DTOs/MediaEntry/` | Shared; web and Android call the same endpoints. |
| Season create/update/detail/minimal DTOs | `media-vault-app.Application/DTOs/Season/` | Shared; these are nested TV-series wire contracts, not SQLite models. |
| User auth and user DTOs | `media-vault-app.Application/DTOs/User/` | Shared; inline client copies currently disagree on `usernameOrEmail` and `createdAtUtc`. |
| TMDB, RAWG, and Google Books app-facing DTOs | `media-vault-app.Application/DTOs/Tmdb/`, `Rawg/`, and `GoogleBooks/` | Shared; these are MediaVault's normalized responses, not upstream provider JSON. |
| Ordinary and validation error bodies | `media-vault-app.API/Controllers/ResultResponseBodies.cs` | Shared; used by future ResultPattern-based client response mapping. |
| `MediaType` and `Status` numeric values | `media-vault-app.Domain/Enums/` | Shared with backend names: `TvSeries` and `Ongoing`. |
| Result, validation-error semantics, pagination, and HTTP mapping | `packages/result-pattern-typescript` | Excluded; owned by ResultPattern v2 and consumed by the future client core. |
| Status/media labels, ordering, and `All = -1` | each app's `mediaConstants.ts` | Local presentation policy; labels and ordering already differ. |
| Web form/component `SearchResult` types | `apps/web/src/Components/` | Local view models; replace API-client coupling with explicit mapping during migration. |
| Android `models/`, `database/`, and mapper entity types | Android application | Local domain/persistence contracts; never treat SQLite rows as API DTOs. |
| Clients, services, validators, mappers, and capability adapters | each app, then `@mediavault/client-core` where approved | Excluded from this package; #27 owns the pure-core inventory. |

## Known drift to resolve in migration issues

- Both apps use `StatusType.OnGoing`; the API contract is `Status.Ongoing`.
- Both apps use `MediaType.Series` and add `MediaType.All`; the API contract is
  `MediaType.TvSeries`, while `All` remains a local filter sentinel.
- Web uses `createdAt` for `UserDetailedDto`; the API returns `createdAtUtc`.
- Client search results omit the backend-owned `mediaType` discriminator.
- Web season DTOs use `ownerId`; the API uses `tvSeriesId`.
- Client DTOs make several non-null API collections nullable and represent
  request/TV-series season shapes inconsistently.
- Provider detail DTOs use optional properties where the API returns required
  properties whose values may be null.

Issues #24 and #25 must migrate imports and fix only the mechanical consumer
assumptions exposed by these authoritative types. User-visible labels, forms,
storage models, and platform behavior remain local.
