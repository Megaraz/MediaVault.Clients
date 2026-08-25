# Shared contract inventory

Reviewed against `Megaraz/MediaVault.Api` main commit
`75c745720b2b769c3895f1f5b1cbf9cb6fa0a744` on 2026-08-25.

| Concern | API authority | Package decision |
| --- | --- | --- |
| Media entry base, concrete create/update/detail, minimal, search, and paged response DTOs | `media-vault-app.Application/DTOs/MediaEntry/` and `DTOs/PagedResponseDto.cs` | Shared; web and Android consume the same typed pagination envelope. |
| Season create/update/detail/minimal DTOs | `media-vault-app.Application/DTOs/Season/` | Shared; these are nested TV-series wire contracts, not SQLite models. |
| User auth and user DTOs | `media-vault-app.Application/DTOs/User/` | Shared; the package preserves `usernameOrEmail`, `createdAtUtc`, and the `204 No Content` registration response boundary. |
| TMDB, RAWG, and Google Books app-facing DTOs | `media-vault-app.Application/DTOs/Tmdb/`, `Rawg/`, and `GoogleBooks/` | Shared; these are MediaVault's normalized responses, not upstream provider JSON. |
| Ordinary and validation error bodies | `media-vault-app.API/Controllers/ResultResponseBodies.cs` | Shared; used by future ResultPattern-based client response mapping. |
| `MediaType` and `Status` numeric values | `media-vault-app.Domain/Enums/` | Shared with backend names: `TvSeries` and `Ongoing`. |
| Result, validation-error semantics, pagination, and HTTP mapping | `packages/result-pattern-typescript` | Excluded; owned by ResultPattern v2 and consumed by the future client core. |
| Status/media labels, ordering, and `All = -1` | each app's `mediaConstants.ts` | Local presentation policy; labels and ordering already differ. |
| Web form/component `SearchResult` types | `apps/web/src/Components/` | Local view models; replace API-client coupling with explicit mapping during migration. |
| Android `models/`, `database/`, and mapper entity types | Android application | Local domain/persistence contracts; never treat SQLite rows as API DTOs. |
| Clients, services, validators, mappers, and capability adapters | each app, then `@mediavault/client-core` where approved | Excluded from this package; #27 owns the pure-core inventory. |

## Migration outcomes

Issues #24 and #25 completed the web and Android migrations to this package.
Both clients now use the shared API names and wire fields, including
`Status.Ongoing`, `MediaType.TvSeries`, `createdAtUtc`, `mediaType`, and
`tvSeriesId`. Application-local display labels such as `OnGoing` and `Series`,
along with `All = -1`, remain presentation policy where applicable; they are
not shared wire-contract values.

The clients also retain explicit local boundaries for forms, view models,
SQLite rows/entities, provider presentation, and other application behavior.
Future API changes should update this package and its inventory first, then
coordinate the consumers using the process in the package README.

Issue #52 introduced the intentional v2 breaking wire contract for
`GET /mediaentries` and `POST /mediaentries/search`. Successful responses now
contain `items`, normalized page values, counts, total pages, and bounded
previous/next flags. Web, Android remote transport, and Android's optional
SQLite path expose that same model; no in-scope consumer expects a bare array.
