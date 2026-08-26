# Android runtime configuration and distribution

MediaVault uses Expo SDK 57 and EAS Build for repeatable Android preview and
production artifacts. The checked-in Expo configuration owns the stable
application identity `com.megaraz.mediavault`, user-facing version `1.0.0`,
initial Android version code `1`, and custom deep-link scheme
`mediavaultandroid`. EAS project `b5ec51ec-d5ba-4e01-afdb-6b00745a0182`
under the `megaraz-team` account owns the checked-in `mediavault` project slug.

EAS is the release builder. The `preview` profile produces an internally
distributed APK that can be installed directly; the `production` profile
produces an Android App Bundle for Google Play. Both profiles use EAS remote
version management and increment `versionCode` for every build. The checked-in
value initializes the remote counter; EAS becomes authoritative after the
project is linked.

## API configuration by environment

`EXPO_PUBLIC_MEDIA_VAULT_API_URL` is embedded in the application bundle and is
therefore public. It may contain only the API base URL. Never put credentials,
JWTs, signing material, provider keys, or private service configuration in an
`EXPO_PUBLIC_*` value.

- **Development:** copy `.env.example` to the ignored `.env.local`. Android
  Emulator reaches the host API at `http://10.0.2.2:5210`; a physical device
  needs a reachable LAN URL. An absent value falls back to localhost only while
  React Native's explicit development mode is active.
- **Preview:** create a plaintext EAS environment variable named
  `EXPO_PUBLIC_MEDIA_VAULT_API_URL` in the `preview` environment. It must be an
  absolute, non-localhost HTTPS URL.
- **Production:** create the same plaintext variable in the `production` EAS
  environment, pointing to the production HTTPS API.

The dynamic Expo config rejects preview or production builds when that value is
missing, malformed, credential-bearing, non-HTTPS, or localhost. The runtime
adapter applies the same release guard, so an installed release cannot silently
fall back to the device's localhost.

Configure and inspect the public EAS values from `apps/mobile` after signing in:

```powershell
npx eas-cli@latest login
npx eas-cli@latest env:set --name EXPO_PUBLIC_MEDIA_VAULT_API_URL `
  --value https://preview-api.example.com --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_MEDIA_VAULT_API_URL `
  --value https://api.example.com --environment production --visibility plaintext
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest env:list --environment production
```

These commands mutate the selected Expo project. Review the account and project
shown by EAS CLI before setting values. The checked-in public project identifier
already links clean checkouts to the intended project. Do not commit downloaded
environment files.

## Build, install, and upgrade

From a clean checkout, install the locked workspace dependencies, verify Expo,
then run EAS Build from the mobile project directory:

```powershell
npm ci
npm run lint --workspace=media-vault-android
npm run typecheck:mobile
npm run doctor:mobile
npm run test:release-config --workspace=media-vault-android

Push-Location apps/mobile
$env:EXPO_PUBLIC_MEDIA_VAULT_API_URL = 'https://preview-api.example.com'
npx eas-cli@latest build --platform android --profile preview
Remove-Item Env:EXPO_PUBLIC_MEDIA_VAULT_API_URL
Pop-Location
```

Use the same public URL locally that is stored in the selected EAS environment.
EAS CLI evaluates the dynamic app config once on the local machine before it
loads the remote environment for the cloud job, so this bootstrap value lets
the release guard validate that initial config evaluation as well.

On first build, let EAS generate and securely manage the Android keystore, or
select the existing EAS-managed credential for `com.megaraz.mediavault`. Never
download signing material into the repository. The resulting preview APK can be
installed from the EAS build page or with `adb install -r <artifact.apk>`.
Build and install a second preview artifact with `adb install -r` to verify the
version-code increment preserves the existing installation and SecureStore
session behavior.

Create the Play-distribution artifact only after the preview checklist passes:

```powershell
Push-Location apps/mobile
$env:EXPO_PUBLIC_MEDIA_VAULT_API_URL = 'https://api.example.com'
npx eas-cli@latest build --platform android --profile production
Remove-Item Env:EXPO_PUBLIC_MEDIA_VAULT_API_URL
Pop-Location
```

The production artifact is an AAB and must be installed through a Google Play
test or release track; it is not directly installable with `adb`.

## Installed-artifact checklist

Use a test account and a reachable HTTPS API. Do not paste tokens or credentials
into build configuration or logs.

1. Install the preview APK on an Android emulator or device and cold-start it.
2. Register or log in, load the dashboard, perform one API-backed search, and
   confirm no request targets localhost.
3. Log out and confirm protected routes return to the authentication flow.
4. With the app closed and then while it is already open, run
   `npx uri-scheme open "mediavaultandroid://profile" --android`. Confirm Expo
   Router opens the app and applies the normal authentication route guard.
5. Install the next preview version over the first with `adb install -r` and
   repeat startup, login restoration, API call, logout, and deep-link checks.

The custom scheme is intentionally preserved to avoid breaking existing links.
Verified HTTPS Android App Links require a controlled production web domain and
Digital Asset Links file, so they remain outside this issue.

## Local release-bundle verification

Static export does not create a signed installable artifact, but it verifies
Metro bundling with release API configuration before spending an EAS build:

```powershell
$env:MEDIAVAULT_BUILD_PROFILE = 'production'
$env:EXPO_PUBLIC_MEDIA_VAULT_API_URL = 'https://api.example.invalid'
Push-Location apps/mobile
npx expo export --platform android --output-dir $env:TEMP/mediavault-android-export
Pop-Location
Remove-Item Env:MEDIAVAULT_BUILD_PROFILE
Remove-Item Env:EXPO_PUBLIC_MEDIA_VAULT_API_URL
```

Keep export directories outside the repository. Scan the artifact for
`localhost:5210` and secret-like values before distribution.
