# generate_fastlane_env.sh

This document explains how to use `./generate_fastlane_env.sh` in `apps/mobile`.

## What It Does

`generate_fastlane_env.sh` prepares Fastlane and Firebase project configuration by:

1. Validating required tools and environment variables.
2. Ensuring Firebase Android and iOS apps exist (creates if missing).
3. Running Android signing report and registering `devDebug` signing hashes in Firebase:
   - `SHA1`
   - `SHA-256`
4. Downloading Firebase app config files:
   - Android: `android/app/src/dev/google-services.json` (for `development`)
   - Android: `android/app/src/production/google-services.json` (for `production`)
   - iOS: `ios/Firebase/Dev/GoogleService-Info.plist` (for `development`)
   - iOS: `ios/Firebase/Prod/GoogleService-Info.plist` (for `production`)
5. Best-effort service account setup for Firebase App Distribution.
6. Rendering `fastlane/.env.<ENVIRONMENT>` from `fastlane/.env.template`.

## Prerequisites

Install and authenticate:

- `firebase` CLI
- `gcloud` CLI
- `jq`
- `base64`

Auth requirements:

- Active `gcloud` account (`gcloud auth login`)
- Active Firebase login (`firebase login`)
- Access to `GCP_PROJECT_ID`

## Required Environment Variables

These are required input variables (directly in shell env or via `--env-file`):

- `ENVIRONMENT` (`development`, `staging`, or `production`)
- `GCP_PROJECT_ID`
- `FASTLANE_APP_IDENTIFIER`
- `MATCH_PASSWORD`
- `MATCH_GIT_URL`
- `FASTLANE_APPSTORE_KEY_ID`
- `FASTLANE_APPSTORE_ISSUER_ID`
- `FASTLANE_APPSTORE_KEY_CONTENT`

Notes:

- `ENVIRONMENT` controls output env filename: `fastlane/.env.<ENVIRONMENT>`.
- Script input uses `MATCH_GIT_URL`, but generated Fastlane env still writes `GIT_URL=`.

## Optional Variables

Common optional variables:

- `ANDROID_APPLICATION_ID` (defaults to `FASTLANE_APP_IDENTIFIER`)
- `FIREBASE_APP_NAME_ANDROID`
- `FIREBASE_APP_NAME_IOS`
- `FASTLANE_APP_IDENTIFIERS` (defaults to `FASTLANE_APP_IDENTIFIER`)
- `IS_CI` (defaults to `true`)
- `GIT_BRANCH` (defaults to `main`)
- `KEY_ALIAS` (defaults to `production`)

## Usage

Recommended approach:

1. Create `fastlane.env` in `apps/mobile` with all required variables.
2. Run the script with `ENVFILE=fastlane.env`.

```bash
ENVFILE=fastlane.env ./generate_fastlane_env.sh
```

Run from `apps/mobile`:

```bash
./generate_fastlane_env.sh --env-file fastlane.env
```

Or load from shell env:

```bash
ENVIRONMENT=development \
GCP_PROJECT_ID=your-project-id \
FASTLANE_APP_IDENTIFIER=com.example.app.dev \
MATCH_PASSWORD=*** \
MATCH_GIT_URL=git@github.com:org/certs.git \
FASTLANE_APPSTORE_KEY_ID=*** \
FASTLANE_APPSTORE_ISSUER_ID=*** \
FASTLANE_APPSTORE_KEY_CONTENT="..." \
./generate_fastlane_env.sh
```

Non-interactive account confirmation:

```bash
./generate_fastlane_env.sh --env-file fastlane.env --yes
```

## Output Files

Generated/updated by the script:

- `fastlane/.env.<ENVIRONMENT>`
- `android/app/src/dev/google-services.json` (when `ENVIRONMENT=development`)
- `android/app/src/production/google-services.json` (when `ENVIRONMENT=production`)
- `ios/Firebase/Dev/GoogleService-Info.plist` (when `ENVIRONMENT=development`)
- `ios/Firebase/Prod/GoogleService-Info.plist` (when `ENVIRONMENT=production`)
- `fastlane/firebase-service-account.json` (best effort)

## Behavior Notes

- Service account creation/binding/key generation is best effort and will not fail the whole script.
- For `ENVIRONMENT=staging`, Firebase config file download is currently skipped for Android/iOS path placement.
