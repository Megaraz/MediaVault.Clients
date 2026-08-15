# Shared client-core adoption

The Android client consumes `@mediavault/client-core` for the API-operation
factories, ResultPattern response/error and cancellation mapping, user/media
validation, and provider-to-metadata mapping.

`shared/apiFetch.ts` is the Android capability adapter. It supplies the Expo
public API base URL, resolves the bearer token asynchronously through
`tokenStore.ts`, and performs `fetch`. It does not log tokens or authorization
headers. SecureStore, Expo Router, React Native components, form state, SQLite
repositories, entity mappers, and synchronization stay Android-owned.

The existing validator classes remain small compatibility adapters so services
and components can retain their local presentation-facing validation shape;
their rules now come from the core. Android DTO/entity mappers remain local
because they create UUIDs and timestamps and target local `Rating`, relation,
and SQLite models.

The core has no public factory for the Android service's generic media-detail
endpoint or its authenticated user administration endpoints. Those narrow
adapters retain their established routes locally, but delegate request execution
and safe response/error mapping to the core. Adding a core factory requires a
separate contract review rather than broadening this migration.

Verify Metro resolution with:

```powershell
npx expo export --platform android --output-dir <disposable-output-directory>
```
