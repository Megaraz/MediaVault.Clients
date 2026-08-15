# `@mediavault/contracts`

This private npm workspace package is the platform-neutral TypeScript view of
MediaVault.Api's public JSON contracts. It contains DTO types and the numeric
`MediaType` and `Status` values used by both web and Android. It has no runtime
dependency on Node, browser APIs, React, Expo, either application, or the
ResultPattern package.

The ASP.NET Core API is authoritative. The baseline reviewed for version 1.0.0
is `Megaraz/MediaVault.Api` main commit
`63f3599282c764c2019e33d9a20ae6f46e6dce90` on 2026-08-15. System.Text.Json's
web defaults produce camel-case JSON property names and numeric enum values.
That baseline also makes `POST /auth/register` a `204 No Content` operation;
registration therefore has no response DTO in this package. Login continues to
return `LoginResponseDto`.

## Ownership boundary

Shared here:

- API request and response DTOs used by either client;
- stable error-response bodies;
- backend-owned numeric enum values.

Kept application-local:

- labels, ordering, and the `All = -1` filter sentinel;
- forms, view models, SQLite rows/entities, and presentation state;
- validators, mappers, clients, services, token storage, and request execution;
- external providers' upstream JSON, which is not sent directly to the apps.

Import only from the package root:

```ts
import { MediaType, Status, type MovieEntryDetailedDto } from '@mediavault/contracts';
```

## Coordinated contract changes

1. Change and verify MediaVault.Api first, including OpenAPI and response tests.
2. Update this package's types, enum assertions, API baseline commit, and
   `CONTRACT_INVENTORY.md` in the same client PR.
3. Update web and Android consumers together when the change is breaking, or
   record the explicit compatibility window when coordinated release is not
   possible.
4. Run the package checks plus both client build/export checks before declaring
   an integrated migration complete.

The package is repository-private and versioned independently. Use a major
version for a breaking export or wire-contract change, a minor version for an
additive contract, and a patch version for documentation or a non-observable
typing correction.

## Verification

From the repository root:

```powershell
npm ci
npm run lint --workspace=@mediavault/contracts
npm run test:contracts
```

The lint command uses the shared package Oxlint configuration, checks maintained
`src/` and `test/` files, and excludes checked-in `dist/` output because it is
generated from the source during package builds.
