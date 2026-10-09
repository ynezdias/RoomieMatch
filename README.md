# RoomieMatch

RoomieMatch helps people find roommates through profiles, Explore search, swipe matching, and conversations. One Expo/React Native client supports a browser website and Android/iOS apps, backed by Express, MongoDB Atlas, and Cloudinary.

The current app has a responsive red-and-black dark theme, modern sans-serif typography, and layouts for phones and laptops. The `Model/` notebooks are offline analysis; they are not connected to a deployed AI recommendation service. Maps, market charts, identity verification, and room tours are not currently implemented.

<img width="1197" height="746" alt="image" src="https://github.com/user-attachments/assets/940c6c71-38b9-4e4d-8b05-2fc4cc6161f3" />
<img width="1712" height="922" alt="image" src="https://github.com/user-attachments/assets/bc197908-a99d-4b1a-8e7a-e11ec11b7442" />
<img width="1711" height="917" alt="image" src="https://github.com/user-attachments/assets/edb2cf9f-39db-437e-885f-ba59b1b2a048" />
<img width="1703" height="922" alt="image" src="https://github.com/user-attachments/assets/53bc97f6-4230-44f7-9530-2974db2cd044" />

## Features

- Email/password registration and login, inline wrong-password feedback, and show/hide password controls.
- Transparent authentication fields with dark autofill styling.
- Explore search, profile details, Like/Pass actions, and mutual matches.
- Profile photos, city, university/workplace, budget, and lifestyle preferences. Bios support up to 1,000 characters; city and university/workplace are required.
- Save feedback, useful validation/network/session errors, and logout below Save Profile.
- Persistent conversations, pinned chats, read receipts, image/video/file attachments, sender-only message deletion, and conversation deletion.
- Request spinners and duplicate-click protection. Failed message sends can be retried without creating duplicate messages.

The current chat client saves through authenticated HTTP requests and refreshes active conversations every 2.5 seconds and the inbox every 5 seconds. A Socket.IO server is also available on the persistent local backend. The browser client works with the Vercel HTTP API without relying on a persistent socket server.

## Project structure

| Path | Purpose |
| --- | --- |
| `mobile/` | Expo SDK 54, React Native, Expo Router, TypeScript, and browser/native UI |
| `backend/` | Express API, JWT authentication, Mongoose models, Cloudinary signing, and verification scripts |
| `api/index.js` | Vercel API entry point with a cached database connection |
| `vercel.json` | Root website/API build and routing configuration |
| `Model/` | Optional offline notebooks and analysis |
| `artifacts/` | Ignored local seed records, test evidence, screenshots, and backups |

## Run locally

Use **Node.js 24 LTS** and npm, an active Atlas cluster/database user, and a Cloudinary product environment. Run the following from the repository root in PowerShell.

Create environment files only if they do not already exist:

```powershell
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
if (!(Test-Path mobile/.env)) { Copy-Item mobile/.env.example mobile/.env }
npm --prefix backend ci
npm --prefix mobile ci
```

Fill in `backend/.env` privately:

- `MONGO_URI`: your Atlas connection string, including `/roomiematch` before its query options. Percent-encode special characters in the database password.
- `JWT_SECRET`: a strong random signing secret, at least 32 characters for production.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- `PORT`: defaults to `5000`. `DNS_SERVERS` is optional for networks with Atlas SRV lookup problems.

Allow your development machine's public IP in Atlas Network Access. Keep real credentials in ignored environment files; all `EXPO_PUBLIC_*` values are visible in the client build.

Start the backend:

```powershell
npm --prefix backend start
```

In a second terminal, start the website:

```powershell
npm --prefix mobile run web
```

Expo prints the browser URL, normally `http://localhost:8081`. Backend health is available at `http://localhost:5000/health`. The backend must report a connected database for account/profile/chat requests to succeed.

For mobile development, run `npm --prefix mobile start`. On a physical phone, set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:5000/api` in `mobile/.env`, put the phone and computer on the same network, and restart Expo. Android emulators default to `10.0.2.2:5000/api`; local browser development defaults to `localhost:5000/api`. Native production builds require the hosted HTTPS API URL. See [mobile/README.md](mobile/README.md).

## Demo profiles and MongoDB Compass

Thirty fictional US roommate profiles are marked `isDemo: true` and `seedBatch: "us-roommates-v1"`. Their shared demo password is `123456789`. Emails follow first initial + surname at Gmail/Hotmail; for example, Ava Bennett uses `abennett@gmail.com`. These are demo login labels, not verified email addresses or real people to contact.

To create or restore the full demo batch:

```powershell
npm --prefix backend run seed:demo
npm --prefix backend run verify:demo
```

Seeding resets the batch's profile details and passwords, preserves unrelated accounts, and refuses non-demo email collisions. It also writes ignored `artifacts/demo-accounts.json` and `.csv`; these files are local seed output and are not included in a fresh checkout. Do not run this against real customer accounts or share their database with shared-password demos.

Account/profile/chat data lives in the database selected by `MONGO_URI`, currently `roomiematch`. Photos and attachments live in Cloudinary; MongoDB stores their URLs.

| Collection | Contents |
| --- | --- |
| `users` | Names, email login labels, bcrypt password hashes, and demo markers |
| `profiles` | Bios, locations, budgets, preferences, photo URLs, and `userId` references |
| `swipes` | Like/Pass actions |
| `matches` | Conversation participants and pin preferences |
| `messages` | Chat text/media URLs, read receipts, and deletion flags |

In Atlas, choose your cluster → Connect → Compass. Connect using the database user's credentials, then open `roomiematch` and the desired collection. To view demo data in `users` or `profiles`, filter with `{ "seedBatch": "us-roommates-v1" }`. Full instructions are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Checks

```powershell
npm --prefix backend test
npm --prefix backend run check:secrets
npm --prefix backend run verify:app
npm --prefix mobile run typecheck
npm --prefix mobile run lint
npm --prefix mobile run test:security
npm --prefix mobile run build:web
```

`verify:app` requires running local services and network access to Atlas/Cloudinary. It verifies demo logins and application flows using temporary test records/uploads, then cleans those up. Security regression tests cover URI decoding, image parsing, UUID compatibility, and PostCSS source-map disclosure.

`npm ci` automatically applies the documented Expo API adapters needed by patched dependencies. Keep the `postinstall` script enabled. Recent checks passed profile save/reload with a 1,000-character bio, two-user messaging, retry/persistence, uploads, logout, responsive browser layouts, and web/Android/iOS bundle exports. Native exports are not signed APK/IPA builds or real-device tests.

## Security and deployment status

The latest reviewed backend audit has **zero findings**. Mobile dependency updates reduced the audit from **40 to 26 findings (21 high, 5 moderate)**. The remaining entries trace to three unpatched build-tool advisories, reviewed in [SECURITY_REVIEW.md](SECURITY_REVIEW.md); those packages were absent from the inspected web/Android/iOS app source maps. This is an exposure review, not an assertion that the audit is clean. Re-audit before a later release and do not force incompatible framework changes with `npm audit fix --force`.

Environment files, dependency directories, build output, local artifacts, and the legacy credential-bearing `file` are ignored. Earlier Git commits still contain exposed credentials. **Atlas/Cloudinary provider credentials have not yet been rotated.** Provider rotation and old-key revocation remain a deployment blocker.

After changing credentials privately in the provider dashboards, run this from your own interactive terminal:

```powershell
npm --prefix backend run configure:credentials
```

The hidden prompts verify replacement Atlas/Cloudinary credentials before updating the ignored backend environment file and rotating the local JWT secret. The command does not change provider passwords or revoke old keys. Follow the complete rotation/restart/re-test instructions in [SECURITY_REVIEW.md](SECURITY_REVIEW.md). Never paste secrets into chat or commit them.

The root Vercel configuration is prepared and schema-validated, but **no deployment has been performed**. Use the repository root, configure private backend environment variables, and leave `EXPO_PUBLIC_API_URL` unset for the single-project website so production browser requests use same-origin `/api`. Atlas must permit the hosting environment's outbound access. Cloudinary uploads go directly from the client using server-issued signatures.

[DEPLOYMENT.md](DEPLOYMENT.md) covers Vercel setup, hosted smoke tests, alternative backend hosting, and EAS Android/iOS builds. Native publication still requires app identifiers, signing/developer accounts, and device testing.

## Future improvements

Password reset, email verification, report/block controls, and a separate real-user database are priorities before serving real customers. AI recommendations and maps remain future work.

Maintained by Ynez Dias.
