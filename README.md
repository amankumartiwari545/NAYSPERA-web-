# NAYSPERA AI — AI Powered Creator System

A desktop-first creator-community prototype built with Next.js 16 (App Router), React 19 and plain JavaScript.
All features work end to end against a **local demo data store**, so the product can be reviewed before a
real backend exists. The backend contract and the exact swap points are documented in
[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

Optional: copy `.env.local.example` to `.env.local` to enable AI generation (needs `OPENAI_API_KEY`).
`.env.local` is git-ignored — never commit API keys.

## Status

Prototype complete and backend-ready. See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for what is
finished, and [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for the contract a backend must
implement.

## Demo access

The prototype ships with a lightweight local auth layer so screens can be exercised without a server:

- **Sign in** with any valid email and any password of 6+ characters.
- **Sign up** creates an account that updates the demo profile `@nayspera` (Alex Rivera).
- **Visitors** can browse Explore, Discover, post detail and creator profiles; Following, Saved,
  Notifications, Profile and Settings require a session.
- The session lives in `localStorage`, so a full page reload returns you to the signed-out state.
  This is the documented demo limitation — a real backend replaces it with a token/session cookie.

## Routes

| Route | Purpose | Access |
|---|---|---|
| `/explore` | Main feed: search, sort, filters, category chips | Public |
| `/following` | Work from creators you follow | Session |
| `/discover` | Categories, creator cards, hashtags, popular work | Public |
| `/studio` | AI Studio (honest 503 until `OPENAI_API_KEY` is set) | Public |
| `/saved` | Bookmarked work | Session |
| `/notifications` | Likes, comments, follows, mentions, reposts | Session |
| `/profile` | Your profile: creations, liked, stats | Session |
| `/profile/@username` | Public creator profile | Public |
| `/post/[id]` | Post detail + more from creator | Public |
| `/settings` | Profile editing, account, workspace data, AI connection | Session |
| `/login`, `/signup`, `/reset-password` | Auth flows | Public |
| `/` | Redirects to `/explore` | Public |
| `POST /api/generate` | AI brief proxy (server-only key) | Public |

## Structure

```
app/
  (auth)/            branded auth layout + login, signup, reset-password
  (platform)/        shell layout + 14 routes
  api/generate/      OpenAI-compatible proxy, 503 when unconfigured
  globals.css        design system: tokens, layout, components, breakpoints
  layout.js          metadata, fonts, AppProvider
  providers.js       auth context + all mutations + toasts
components/          layout, feed, discover, profile, auth, ui
lib/
  seed.js            demo dataset (profiles, posts, likes, comments, …)
  storage.js         persistence boundary — the ONLY module that touches storage
  selectors.js       derived reads (feeds, counts, trending, search)
  utils.js           constants and formatting helpers
  image.js           client-side image downscale for uploads
```

## Data flow (important for backend work)

1. `lib/storage.js` loads one relational snapshot: `profiles, posts, likes, comments, reposts,
   follows, bookmarks, notifications`.
2. `app/providers.js` applies mutations to that snapshot synchronously, persists it and republishes
   it to React. Counts are **derived**, never stored, so they can never drift.
3. `lib/selectors.js` answers every read query from the snapshot.

A backend only has to replace steps 1 and 2: fetch the snapshot (or switch selectors to API queries)
and send mutations to the server. See BACKEND_INTEGRATION.md for the endpoint contract.

## What is real vs. mocked

| Area | Status |
|---|---|
| Navigation, layout, responsive behaviour | Real |
| Feed, search, sort, filters, profiles, discovery | Real (local data) |
| Like, comment, repost, bookmark, follow, notifications | Real mutations (local data) |
| Post creation, image upload | Real (image resized client-side, stored as a data URL) |
| Auth screens and route protection | Real UI, demo credentials |
| Password reset | UI only — no email is sent (documented on the screen) |
| AI generation | Real proxy, but disabled (503 `not_configured`) until a key is configured |
| Persistence | Browser `localStorage`; cleared per browser |
| Realtime | Not implemented |
