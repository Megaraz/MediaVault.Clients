# ResultPattern TypeScript

This directory contains the repository-owned TypeScript ResultPattern package
used by the MediaVault Android client. It preserves the app's existing result,
error, validation, pagination, and HTTP-mapping behavior while making a clean
clone independent of sibling checkouts.

## Runtime entry points

- `result-pattern-typescript` exposes the React Native-safe package root.
- `result-pattern-typescript/node` additionally exposes the Node-only
  `ErrorLogger`.

The package contains checked-in `dist/` output because npm installs it as a
local file dependency and the Android clean-clone flow must not require a
separate package build.

## Versioning policy

The Android repository is the canonical source for this vendored copy.

- The package version starts at `1.0.0`, matching the imported implementation.
- Behavior changes require a separately scoped issue, package tests, Android
  lint/type checking, and an Android Metro bundle.
- Increment the package version using semantic versioning when its public API or
  behavior changes, then regenerate the root `package-lock.json`.
- Do not replace this package with a sibling path or unpublished external
  dependency. Extraction to a separately published package requires its own
  migration plan and clean-clone proof.

## Package verification

From this directory:

```powershell
npm install
npm test
```

The repository-level verification remains authoritative for Android
compatibility.
