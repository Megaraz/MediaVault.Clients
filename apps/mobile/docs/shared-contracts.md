# Android shared API contracts

The Android client imports MediaVault API request/response DTOs and backend-owned
numeric enum values from the workspace package `@mediavault/contracts`:

```ts
import {
  MediaType,
  Status,
  type MovieEntryDetailedDto,
} from '@mediavault/contracts';
```

The package is the authoritative client representation of the backend wire
contract. Its exports preserve API JSON property names, nullability, numeric
enum values, identifiers, and ownership assumptions. Import shared contracts
from the package root; do not recreate them under `apps/mobile/`.

## Android-owned boundaries

The following remain local to Android because they describe the native app or
its presentation rather than the backend wire contract:

- labels, section ordering, and the `ALL_MEDIA_TYPE = -1` filter sentinel;
- Expo Router screens, React Native components, form state, and UI behavior;
- SQLite entities, rows, migrations, repositories, and local domain models;
- mappers between API DTOs and local models;
- validators, services, API transport, SecureStore, and authentication helpers;
- provider search results after mapping API DTOs to the local search view model.

Use the shared enum names `MediaType.TvSeries` and `Status.Ongoing`. Android
presentation code may use local labels and ordering, but must not add aliases or
change the numeric values sent to the API.

## Resolution and verification

`apps/mobile/metro.config.js` uses Expo's default Metro configuration. The
workspace package must resolve from a clean root installation without an
absolute path, sibling checkout, unpublished dependency, or custom resolver.

From the repository root:

```powershell
npm ci
npm run lint --workspace=media-vault-android
npm run typecheck:mobile
npm run doctor:mobile
$exportPath = Join-Path ([System.IO.Path]::GetTempPath()) "mediavault-shared-contracts-$PID"
npx expo export --platform android --output-dir $exportPath
Remove-Item -LiteralPath $exportPath -Recurse -Force
```
