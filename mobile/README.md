# RoomieMatch client

This Expo SDK 54 application serves the RoomieMatch website and Android/iOS clients. It uses Expo Router, React Native, TypeScript, and a responsive red-and-black dark theme. For complete project setup, features, demo accounts, and MongoDB instructions, see the [root README](../README.md).

## Development

Use Node.js 24 LTS. Start the Express backend separately and configure its private environment file as described in the root README.

From this directory:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm ci
npm run web
```

For native development, use `npm start`, `npm run android`, or `npm run ios` with the appropriate device/emulator tooling. An iOS simulator requires macOS; Windows can export an iOS bundle and use EAS for remote builds.

## API configuration

| Environment | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Local browser | Leave unset to use `http://localhost:5000/api` |
| Android emulator | Leave unset to use `http://10.0.2.2:5000/api` |
| Physical phone | Set `http://YOUR_COMPUTER_LAN_IP:5000/api` |
| Root Vercel website | Leave unset for same-origin HTTPS `/api` |
| Native production | Set `https://YOUR_PROJECT.vercel.app/api` |

Restart Expo after changing environment variables. Public client variables must never contain MongoDB passwords, JWT secrets, or Cloudinary API secrets. Uploads request a signature from the backend, then upload directly to Cloudinary. The current chat client uses persistent HTTP messages with polling.

## Validation and builds

```powershell
npm run typecheck
npm run lint
npm run test:security
npm run build:web
```

Web output is generated in `dist/`. `npm ci` runs `scripts/dependency-compat.cjs` to adapt older Expo consumers to patched URI-decoder and image-parser APIs. Keep this postinstall step enabled. See the [security review](../SECURITY_REVIEW.md) for the dependency overrides, regression tests, and remaining tooling advisories.

`eas.json` contains development, preview, and production profiles. Native bundle exports have passed; signed device builds and store publication have not been performed. See the [deployment guide](../DEPLOYMENT.md) for identifiers, private hosting settings, signing, and device testing. No website/app deployment has been made.

Avoid `npm run reset-project` during normal development: it is the original Expo starter reset script, not a data/profile reset command.