# Google OAuth setup

Reklu uses NextAuth v5. Google sign-in is automatically enabled when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

## One-time Google Cloud setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   https://your-production-domain.com
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   http://localhost:3002/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
7. Copy the **Client ID** and **Client secret**.

## Add to your environment

```bash
# .env or Dokploy environment tab
GOOGLE_CLIENT_ID=1234567890-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

Restart the app. The "Continue with Google" button will appear on `/sign-in` and `/sign-up`.

## Behavior

- First-time Google sign-in **creates a new account** automatically (no password is set). The user can later set a password via the profile page (Phase 8 — not yet built).
- Returning Google sign-in matches the email and reuses the existing account.
- If a user tries to sign in with a Google account whose email already exists with a password, NextAuth v5 will ask them to sign in with the password first, then link the Google account on next sign-in.
- If `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not set, the Google button is hidden and only email/password sign-in is available.

## OAuth consent screen

The first time a user signs in with Google, they'll see Google's OAuth consent screen asking permission to share their email and profile. Configure the consent screen in Google Cloud under **APIs & Services → OAuth consent screen**:

- App name: **Reklu**
- User support email: your support address
- App logo: optional, your Reklu logo
- Authorized domains: `your-production-domain.com`
- Scopes: `email`, `profile`, `openid` (default for NextAuth)

In production, submit your app for Google verification if you want to remove the "unverified app" warning. For internal/team use, you can limit the OAuth client to specific users in the Google Cloud Console.
