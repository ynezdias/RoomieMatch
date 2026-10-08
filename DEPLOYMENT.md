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

The `.env` files and an extra file named `file` were previously committed. They are now ignored and removed from Git's index while preserved locally. **Old Git commits still contain their old contents.** Rotate the Atlas database password and Cloudinary API secret in their dashboards before a public deployment, update local/server environment variables, and consider removing leaked credentials from repository history. The local JWT signing secret has already been rotated; configure a fresh strong secret on your production server.

Keep demo accounts clearly identified in any public demo. Do not present stock portraits or these email labels as verified real roommate seekers. Use a separate database for real customers rather than granting access to shared-password demo accounts.

All `EXPO_PUBLIC_*` values are visible in the compiled client. Put only public URLs/settings there. MongoDB credentials, JWT signing secrets, and Cloudinary API secrets belong exclusively on the backend.

## Backend deployment

Use a persistent Node service or container host that supports WebSocket connections. This Express/Socket.IO backend is not a static website and should not be uploaded into the Expo frontend's files.

- Service root: `backend`; install: `npm ci --omit=dev`; start: `npm start`.
- A `backend/Dockerfile` is also provided. Build with the `backend` folder as its context.
- Configure `MONGO_URI` (use a separate production database for real users), `JWT_SECRET` (at least 32 random characters), all three `CLOUDINARY_*` variables, and `NODE_ENV=production` in the hosting dashboard.
- Set `CORS_ORIGINS` to the exact HTTPS frontend origin, or comma-separated origins for multiple frontends. Native clients can connect without a browser Origin header.
- Allow the backend host's outbound IP(s) in Atlas. Choose a host with known/stable egress IPs or private networking.
- The host may provide `PORT` automatically. Health endpoint: `/health`, which returns 200 only when MongoDB is connected.
- Use HTTPS/WSS and keep TLS certificate verification enabled.

## Browser deployment

1. Set `EXPO_PUBLIC_API_URL=https://YOUR_BACKEND_HOST/api` in the frontend build environment. Socket.IO derives its URL from that setting; `EXPO_PUBLIC_SOCKET_URL` is an optional override.
2. From `mobile`, run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build:web`.
3. Deploy **mobile/dist** to a static host or EAS Hosting. Support Expo's generated HTML paths/deep links.
4. Put the resulting HTTPS frontend origin in the backend's `CORS_ORIGINS` and restart the backend.
5. Verify registration, profile saving/photo upload, Explore, swipe matching, and chat on the actual hosted URLs. Changing client environment variables requires a new export/build.

## Android and iOS deployment

`mobile/eas.json` includes development, preview APK, and production build profiles. Before building, connect the project to your Expo account (`eas init`), choose your final Android package and iOS bundle identifier in `app.json`, and configure the production `EXPO_PUBLIC_API_URL` using your Expo environment. These identifiers and signing accounts are user-owned decisions and have not been invented here.

Build with `eas build --platform android --profile preview` for device testing, then `eas build --platform all --profile production` for store builds. Store publication requires your Apple/Google developer accounts, signing setup, app listing, and privacy/data policies. Device builds and store submissions have not been performed.

Official references: [Compass connections](https://www.mongodb.com/docs/compass/connect/), [Expo environment variables](https://docs.expo.dev/guides/environment-variables/), [Expo web deployment](https://docs.expo.dev/deploy/web/), [Random User photos](https://randomuser.me/photos).
