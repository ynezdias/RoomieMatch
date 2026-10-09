# RoomieMatch deployment and data

## Current data

Your live database is MongoDB Atlas **Cluster0** (`cluster0.nozxubl.mongodb.net`), database **roomiematch**.

| Collection | Contents |
| --- | --- |
| `users` | Account name, email, bcrypt password hash, demo marker |
| `profiles` | Bio, city/state/country, budget, preferences, user reference, Cloudinary photo URL |
| `swipes` | Who liked or passed on whom |
| `matches` | Conversation participants and pinned-chat preferences |
| `messages` | Chat text, Cloudinary media URLs, read/deletion flags |

Photos and uploaded media live in **Cloudinary**, not as image files in MongoDB. Demo photos use Cloudinary public IDs under `roomiematch/demo/`. Their source files come from `mobile/Profiles/` and Random User sample portraits; downloaded copies and attribution are in ignored `artifacts/` files.

Thirty fictional US roommate seekers are labeled `isDemo: true` and `seedBatch: "us-roommates-v1"`. Email addresses are first initial + surname at Gmail or Hotmail, as requested; these are login labels, not verified email addresses or actual people to contact. All demo passwords are **123456789**. The exact accounts are listed in `artifacts/demo-accounts.csv` and `.json` on this computer. MongoDB stores password hashes, never that plaintext password.

## View records in Compass

1. In Atlas, open Cluster0 → Connect → Compass and copy its connection string.
2. In Compass, choose Add new connection / `+`, paste the URI, and provide database user `ynezdias` and its current database password. The database user password differs from the demo login password. Special characters in a URI must be percent encoded (`@` becomes `%40`). The saved complete URI is in ignored `backend/.env`; keep it private.
3. Connect, refresh the database list, and open **roomiematch → users** or **roomiematch → profiles**.
4. To see just this batch, enter `{ "seedBatch": "us-roommates-v1" }` in the Filter box and click Find. Expect 30 documents in each collection. In `profiles`, `userId` points to the matching `users._id`.
5. If connecting from a different network, allow that computer's current public IP in Atlas → Network Access. Some networks use multiple outbound IPs, so allow the specific addresses you use.

## Local commands

Use Node.js 22 or newer (Node 24 was used for verification).

```powershell
cd backend
npm ci
npm start
```

In another terminal:

```powershell
cd mobile
npm ci
npm run web
```

For a phone running Expo Go, set `EXPO_PUBLIC_API_URL` in `mobile/.env` to `http://YOUR_COMPUTER_LAN_IP:5000/api`, then restart Expo. `localhost` on a phone refers to the phone. API and Socket.IO use the same configured backend.

The optional `DNS_SERVERS` backend setting works around this computer's network DNS issue. It is not a machine-wide DNS change. Copy only `.env.example` templates to a fresh checkout and fill in actual values privately.

## Repeat the demo seed

```powershell
cd backend
npm run seed:demo
npm run verify:demo
node scripts/checkSecrets.js
```

The seed is repeatable, preserves unrelated users/profiles, and refuses to replace non-demo accounts with colliding emails. Re-running it resets this demo batch's passwords and profile fields; it does not delete existing swipes or chats. Do not run it against real accounts.

## Before publishing

Compatible dependency updates removed all reported backend vulnerabilities. The current Expo SDK 54 dependency tree still has 40 npm audit advisories (23 high, 17 moderate; zero critical) in its framework/build tooling after compatible fixes (including `braces`, `node-forge`, `postcss`, `sprintf-js`, and `uuid` dependency chains). All initially reported critical advisories were cleared. Do not expose Metro or development tooling publicly; deploy only the exported static client and the production backend. Before a public release, review the remaining advisories, migrate to a supported Expo SDK as appropriate, and test actual Android/iOS builds. A successful web export alone does not certify native release readiness.

The `.env` files and an extra file named `file` were previously committed. They are now ignored and removed from Git's index while preserved locally. **Old Git commits still contain their old contents.** Rotate the Atlas database password and Cloudinary API secret in their dashboards before a public deployment, update local/server environment variables, and consider removing leaked credentials from repository history. The local JWT signing secret has already been rotated; configure a fresh strong secret on your production server.

Before committing, run `npm run check:secrets` from `backend`. If previously tracked secret files have been re-added to the index, run this from the repository root to untrack them without deleting local copies, then rerun the check:

```powershell
git rm --cached -r --ignore-unmatch -- backend/.env mobile/.env file backend/node_modules
```

Keep demo accounts clearly identified in any public demo. Do not present stock portraits or these email labels as verified real roommate seekers. Use a separate database for real customers rather than granting access to shared-password demo accounts.

All `EXPO_PUBLIC_*` values are visible in the compiled client. Put only public URLs/settings there. MongoDB credentials, JWT signing secrets, and Cloudinary API secrets belong exclusively on the backend.

## Vercel website and API

The repository now has a root `vercel.json`, a Node API entry point at `api/index.js`, and an Expo single-page export. No deployment has been made. A production-style local preview is available at http://localhost:8082 while its process is running.

When you approve publishing:

1. Import the repository into Vercel with **the repository root** as Root Directory and **Other** as Framework Preset. The repository configuration installs backend/mobile dependencies, runs the web export, and serves `mobile/dist`. Do not select only the mobile folder: the API lives at the repository root.
2. Privately configure `MONGO_URI`, a fresh `JWT_SECRET` of at least 32 random characters, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Vercel's environment settings. Keep `/roomiematch` in the MongoDB URI for this demo; use a separate database for real users. Rotate the previously committed credentials first.
3. Leave `EXPO_PUBLIC_API_URL` **unset for this single-project website**. The production browser uses its own HTTPS origin plus `/api`. This also works for preview URLs. Do not copy the local backend URL into a production build.
4. Allow the deployment's outbound network access in Atlas. Your laptop's allowed IP does not grant Vercel access. Choose an appropriate Atlas/Vercel network-access setup before publishing; no Atlas network rules were widened here.
5. After deployment, check `https://YOUR_PROJECT.vercel.app/api/health`, then test registration, profile saving and photos, Explore, matching, chat and logout on the hosted URL.

Chat messages are saved through authenticated HTTP requests. Active conversations refresh every 2.5 seconds; the inbox refreshes every 5 seconds. Failed sends display a retry action, and retrying uses the same message ID to avoid duplicates. This does not depend on a persistent Socket.IO process or a shared connection room in Vercel. The existing Socket.IO server remains available when running `backend/server.js` on a persistent host.

Uploads request a short-lived Cloudinary signature from the backend, then send the file directly to Cloudinary. The API secret stays on the server. This avoids sending large media files through Vercel's [4.5 MB function request limit](https://vercel.com/docs/functions/limitations); the client allows files up to 25 MB, subject to your Cloudinary account's format/plan limits.

`CORS_ORIGINS` is optional for the single-project browser site; same-origin requests do not require CORS. For a separate browser host, provide its exact HTTPS origin(s). Native apps use the hosted API URL directly.

## Alternative persistent backend

The `backend/Dockerfile` is still available for a persistent Node host. Use `backend` as service root, `npm ci --omit=dev` to install, and `npm start` to run. Configure the same private credentials, `NODE_ENV=production`, and `CORS_ORIGINS`. Its health endpoint is `/health`. A separately hosted web client must be exported with `EXPO_PUBLIC_API_URL=https://YOUR_BACKEND/api`.


## Android and iOS deployment

`mobile/eas.json` includes development, preview APK, and production build profiles. Before building, connect the project to your Expo account (`eas init`), choose your final Android package and iOS bundle identifier in `app.json`, and configure the production `EXPO_PUBLIC_API_URL` using your Expo environment. These identifiers and signing accounts are user-owned decisions and have not been invented here.

Build with `eas build --platform android --profile preview` for device testing, then `eas build --platform all --profile production` for store builds. Store publication requires your Apple/Google developer accounts, signing setup, app listing, and privacy/data policies. Device builds and store submissions have not been performed.

Official references: [Compass connections](https://www.mongodb.com/docs/compass/connect/), [Expo environment variables](https://docs.expo.dev/guides/environment-variables/), [Expo web deployment](https://docs.expo.dev/deploy/web/), [Random User photos](https://randomuser.me/photos).

## Latest release decision

The final transparent authentication fields and password visibility toggles passed laptop/phone browser checks. TypeScript, uncached lint, production web export, Android/iOS Hermes exports, full API/browser flows, secret scans, and Vercel schema validation passed. Backend audit: zero vulnerabilities. Mobile/Expo audit: 40 advisories (23 high, 17 moderate, zero critical).

The application is ready for a reviewed Vercel preview after credential rotation, private hosting environment configuration, and Atlas hosting access. Public release remains pending credential rotation and dependency remediation/review, followed by hosted smoke tests. Native bundle export is not a signed APK/IPA or real-device release test. No deployment has been performed. See ignored `artifacts/VERIFICATION.md` for local evidence and screenshots.
## Security review update and profile-save fix

The Expo audit is now 26 findings (21 high, 5 moderate), down from 40. Four patched dependencies and reproducible Expo API adapters are installed; clean installation, security regressions, web/native exports and app flows passed. The three remaining unpatched tooling advisories have an exposure review in `SECURITY_REVIEW.md`; they are absent from the shipped web/Android/iOS source maps. This supersedes the earlier unreviewed 40-finding release note.

Credential rotation is still blocked by provider management access. Current credentials were not changed. Follow the private dashboard rotation and `npm run configure:credentials` steps in `SECURITY_REVIEW.md`; the updater validates replacements before writing the ignored `.env`. Do not paste secrets in chat. Old-key revocation, server restart and post-rotation verification remain required.

Profile saving now supports the editor's 1,000-character bio limit, trims text fields, validates required city/university/workplace, and displays validation/session/network errors while preserving unsaved edits. Live Atlas/browser save-reload and failure-retry tests passed.
