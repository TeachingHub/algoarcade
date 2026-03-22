# Frontend (Vite + React + Firebase)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from .env.example:

```bash
cp .env.example .env.local
```

3. Fill all Firebase variables in .env.local.

4. Run dev server:

```bash
npm run dev
```

## Required Firebase configuration

In Firebase Console:

1. Go to Authentication > Sign-in method.
2. Enable Google provider.
3. Go to Authentication > Settings > Authorized domains.
4. Add your domains:
   - localhost
   - your Vercel domain (example: your-app.vercel.app)
   - your custom domain (if you use one)

If this is missing, Google login fails with unauthorized-domain.

## Deploy on Vercel

1. Import this repository in Vercel.
2. Framework preset: Vite.
3. Build command:

```bash
npm run build
```

4. Output directory:

```bash
dist
```

5. Add these Environment Variables in Vercel (Project Settings > Environment Variables):
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
   - VITE_FIREBASE_MEASUREMENT_ID (optional)

6. Redeploy after saving env vars.

## Routing on Vercel

This project uses BrowserRouter. A vercel.json file is included so every route rewrites to index.html and direct refresh on nested routes works.

## Troubleshooting Google login

- auth/unauthorized-domain: add the exact deployed domain to Firebase Authorized domains.
- auth/operation-not-allowed: enable Google sign-in in Firebase Authentication.
- auth/popup-blocked: browser blocked popup. The app falls back to redirect sign-in.
