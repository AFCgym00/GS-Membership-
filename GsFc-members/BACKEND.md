# Backend API setup

The dashboard's backend is Vercel serverless functions under `/api` that talk
to **MongoDB Atlas**, plus a hand-rolled JWT/cookie session system for login
(there's no third-party auth provider — passwords are hashed with bcrypt and
stored in a `users` collection).

```
api/
  _lib/
    mongodb.ts          # cached MongoClient connection (serverless-safe)
    auth.ts             # signs/verifies the session JWT, requireUser/requireAdmin
    serialize.ts        # converts MongoDB docs to the JSON shape the frontend expects
  auth/
    login.ts             # POST /api/auth/login    verify password, set session cookie
    logout.ts             # POST /api/auth/logout   clear session cookie
    me.ts                  # GET  /api/auth/me       current session user (for page load)
  members/
    index.ts             # GET  /api/members            list members
                          # POST /api/members            create member
    [id].ts               # PUT    /api/members/:id     update member
                          # DELETE /api/members/:id      delete member
  plans/
    index.ts               # GET /api/plans              plans + live member counts/revenue
  revenue/
    summary.ts              # GET /api/revenue/summary   monthly trend, totals, breakdown
```

## How auth works

1. `POST /api/auth/login` checks the email/password against the `users`
   collection (bcrypt-compared password hash) and, if valid, signs a JWT
   containing `{ userId, email, role }` and sets it as an **httpOnly** cookie
   (`afc_session`). httpOnly means client-side JS can never read the token —
   only the browser sends it automatically on same-origin requests.
2. Every `/api/members`, `/api/plans`, `/api/revenue/*` request goes through
   `requireAdmin()` (`api/_lib/auth.ts`), which verifies the cookie's JWT
   signature/expiry and checks `role === 'admin'`. Missing/invalid session ->
   401. Valid session but not an admin -> 403.
3. The frontend (`src/lib/AuthProvider.tsx`) doesn't store a token anywhere —
   it just calls `/api/auth/me` on load to ask "am I logged in?" and relies on
   the browser to attach the cookie on every request (`credentials: 'include'`
   in `src/lib/api.ts`).

**This is the real security boundary** — same principle as before: verification
happens server-side, and nothing sensitive is ever exposed to the browser.

## 1. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   if you don't have one.
2. Database Access -> add a database user (username + password).
3. Network Access -> allow access from `0.0.0.0/0` (Vercel's serverless IPs
   aren't static) or Vercel's specific egress IPs if you've set those up.
4. Get your connection string from **Connect -> Drivers** — it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0`

## 2. Environment variables

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=afc_gym
JWT_SECRET=<a long random string>
```

Generate a strong `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- **In Vercel:** Project Settings -> Environment Variables -> add all three
  for Production (and Preview/Development if used). Redeploy after adding.
- **Locally:** put the same three lines in `.env` (see `.env.example`).

None of these are prefixed `VITE_`, so none of them are bundled into the
browser JS — that prefix is reserved for values that are safe to expose
publicly (this app doesn't currently need any).

## 3. Seed the database

```bash
MONGODB_URI="mongodb+srv://..." node scripts/reset-plans.mjs
```

Loads the same 12 starter members and 2 starter plans (Strength / Strength +
Cardio) that used to live in `seed.sql`/`seed-plans.sql`. Safe to re-run —
it skips members if the collection isn't empty, and upserts plans by name.

## 4. Create an admin login

There's no signup page — create admin accounts from the command line:

```bash
MONGODB_URI="mongodb+srv://..." node scripts/create-admin.mjs you@afcgym.com 'yourPassword123'
```

Re-running with the same email updates that user's password/role, so you can
also use this to reset a forgotten password.

## 5. Local development

`npm run dev` (plain Vite) does **not** serve the `/api` functions. To run the
full app (frontend + API) locally, use the Vercel CLI instead:

```bash
npm i -g vercel
vercel dev
```

This serves both the Vite app and the `/api/*` serverless functions on one
local port, matching production behavior. Make sure `.env` has all three
variables above set before running it.

## Notes

- The `plans` collection is read-only from the frontend — edit pricing by
  updating documents directly in Atlas (or add an admin API route for it
  later, following the same `requireAdmin` pattern).
- The "Weekly Attendance" chart on the Overview page is still sample data —
  there's no check-in collection yet. Add one (`attendance` documents with
  `member_id` + `checked_in_at`) plus an `/api/attendance/summary` endpoint
  to make it real.
- This migrated off Supabase entirely — there's no Postgres schema/RLS to
  maintain anymore; MongoDB has no equivalent of row-level security, so all
  access control lives in the `requireAdmin` check in the API layer.
