# Contributing to MediaVault

MediaVault is an active pre-release product, public portfolio, and learning
project maintained by one developer. Focused contributions are welcome after
prior discussion, but opening an issue or pull request does not guarantee that
the proposed work will be accepted.

## Before starting

1. Search the issue tracker and the
   [MediaVault product project](https://github.com/users/Megaraz/projects/2).
2. Open or comment on an issue before implementing a change. Agree on the
   observable outcome, scope, non-goals, acceptance criteria, and verification.
3. Wait for the issue to be accepted for implementation and confirm its base
   branch. Do not absorb work owned by a parent, sibling, or roadmap issue.
4. Read `AGENTS.md` and the exact versioned Expo documentation it references
   before changing application code or configuration.

Security vulnerabilities must follow [SECURITY.md](SECURITY.md), not the normal
issue workflow. Participation is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Make a focused change

- Create a short-lived branch for one issue and keep commits intentional.
- Keep API access, local persistence, authentication, and UI responsibilities at
  their existing boundaries unless an accepted issue explicitly changes them.
- Treat API routes, authentication, status codes, JSON and error shapes,
  persistence identifiers, pagination, and synchronization metadata as
  contracts shared by the Android app, web client, and backend.
- Coordinate an intentional shared-contract change with the API/web repository.
  Otherwise, preserve the contract and document any out-of-scope compatibility
  gap.
- Keep credentials, personal data, local databases, environment files, signing
  material, build output, logs, and editor state out of commits.
- Add focused tests when the repository has an appropriate test seam and update
  documentation when setup, configuration, contracts, architecture, or
  user-visible behavior changes.

## Verify the work

Run the narrowest checks while iterating, then the relevant repository checks
before requesting review:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npx expo-doctor
git diff --check
```

If an unrelated, pre-existing failure blocks a check, record the exact command
and failure in the pull request and link its tracking issue. Do not introduce a
machine-local dependency or weaken verification to make the change appear green.

## Open the pull request

Keep the pull request reviewable and include:

- the issue outcome and why it matters;
- important implementation or policy decisions;
- API, authentication, security, data, and client-contract impact;
- exact verification commands and results;
- remaining risks or follow-up issues; and
- a closing reference when the pull request should close an issue on merge.

Do not include unrelated cleanup, generated/runtime files, or sibling-issue
work. Maintainers may request changes or decline work that does not fit the
product direction, even when the implementation is technically sound.
