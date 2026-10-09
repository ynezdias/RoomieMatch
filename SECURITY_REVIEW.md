# Security dependency review

Reviewed 2026-10-08. This supersedes the earlier 40-finding Expo audit notes.

## Result

Four upstream package updates reduced npm's mobile audit from **40 (23 high, 17 moderate)** to **26 (21 high, 5 moderate)**. The 26 entries include affected parent packages; they trace to three underlying advisories, rather than 26 independent vulnerabilities. Nothing is hidden from npm audit. The backend's latest audit has zero findings.

| Package | Installed update | Validation |
| --- | --- | --- |
| PostCSS | 8.5.29 | Regression test prevents external source-map content disclosure |
| UUID | 11.1.1 | Xcode 24-character project IDs still work; undersized buffers rejected |
| decode-uri-component | 0.5.0 | Valid navigation queries preserved; large malformed query completes within timeout |
| image-size | 2.0.4 | Metro reads both buffered and file-based project images |

`mobile/scripts/dependency-compat.cjs` adapts Expo SDK 54's older query-string and Metro consumers to the patched upstream APIs. It runs on `npm install`/`npm ci`, is idempotent, and fails explicitly if the expected consumer code changes. These are API compatibility changes, not changes to the upstream security fixes. Major Expo/React Native versions were preserved. Do not use `npm audit fix --force` to downgrade or arbitrarily replace the framework.

## Remaining unpatched tooling

| Root advisory | Current exposure | Review conclusion |
| --- | --- | --- |
| [braces recursion exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Metro/Jest file matching on the build/development machine | No published fix. No app-user input reaches these globs in the current production architecture. Keep builds restricted to trusted source and never expose Metro publicly. Re-review if accepting untrusted build patterns/repositories. |
| [node-forge RSA signature verification](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Expo CLI certificate/signing utilities | No published fix. App configuration has no OTA code-signing certificate workflow and the production API does not import Expo tooling. Do not treat this review as approval for a new signing/certificate-verification workflow; re-review before enabling one. |
| [sprintf-js precision exhaustion](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | argparse/js-yaml through Jest coverage/build tooling | No published fix. Format strings come from trusted tool code in the current usage. Never accept untrusted format strings in a new workflow. |

The official advisories list no patched version for these three packages as of this review. The remaining risks are reviewed and confined to tooling for this application's current architecture; they are not resolved upstream. This assessment must be revisited on dependency/configuration changes and when patches are released.

## Evidence

- Clean `npm ci` completed and reapplied the compatibility adapters.
- `npm run test:security` passed all four regressions after clean installation.
- TypeScript, uncached ESLint, production web export, and Android/iOS Hermes exports passed.
- Web/Android/iOS export source maps contained none of `braces`, `node-forge`, or `sprintf-js`; 1,408 / 1,518 / 1,521 source entries were inspected respectively. Maps are local ignored review artifacts, not part of the deployed web export.
- The Vercel API imports backend code only; the backend audit is clean. The static client does not execute Metro/Jest/Expo CLI on request.
- Full two-user browser tests passed authentication, profile save, routing, messaging/retry/read/delete, signed uploads, persistence and logout.
- Live Atlas regression proved a 1,000-character bio saves and survives reload; invalid inputs get readable errors and failed-save retry preserves edits. Test accounts/uploads were cleaned up.

Local evidence is under ignored `artifacts/`: `mobile-reviewed-audit.json`, `security-bundle-review.json`, `security-web-export/`, `security-native-export/`, and browser verification scripts. Repeat `npm audit` before a later release; this document is not a promise about future advisories.

## Credentials: still awaiting provider rotation

Atlas/Cloudinary secrets in older Git commits remain exposed. `.gitignore` and removing files from the current index do not invalidate those secrets. The app's existing database and media credentials are not provider-management credentials. The browser automation runtime failed to initialize, so no provider rotation could be submitted. **No Atlas password or Cloudinary secret was rotated in this pass.** Current ignored `.env` is unchanged and the app remains connected.

Complete these steps privately:

1. Atlas → Project 0 → Database Access / Database Users → edit database user `ynezdias` → set a generated password of at least 16 characters and save. See [Atlas user management](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/).
2. Cloudinary Console → Settings → API Keys → create a replacement API key/secret for the existing product environment. Keep the replacement in a password manager. See [Cloudinary credentials](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials).
3. In your own terminal, from `backend`, run `npm run configure:credentials`. Enter the replacement values in the hidden prompts. It verifies Atlas and Cloudinary before atomically updating the ignored `.env`, preserves the database/hostname/options, encodes special password characters, and rotates the local JWT signing secret. It does not revoke provider credentials. Never paste secrets into chat or put them in command arguments.
4. Disable/revoke the old Cloudinary key in its dashboard, confirm the old Atlas password fails, restart the local backend and preview, and privately update any hosting environment that used the old credentials. Hosted environments have not been configured here.
5. Re-test login, save, upload and chat after rotation. Existing sessions will need a fresh login following JWT rotation. No Git history was rewritten or pushed.

Until the provider credentials are changed and the old values revoked, credential rotation remains a deployment blocker. Native device/signing and hosted smoke tests remain separate release work.