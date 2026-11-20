# NAYSPERA — Backend Integration Contract

This prototype is **frontend-complete and backend-ready**. Every screen, mutation and permission rule
already exists; only the persistence layer is local. This document is the contract a backend developer
can implement against without reading the whole UI.

---

## 1. Where the backend plugs in

Only two modules touch data:

| Module | Role | What to change |
|---|---|---|
| `lib/storage.js` | Loads/saves the whole relational snapshot; owns the session | Replace `getDatabase()` / `saveDatabase()` / session helpers with API calls, or keep them as a cache |
| `app/providers.js` | Applies mutations to the snapshot and republishes to React | Point each mutation at its API endpoint; keep signatures so components do not change |
| `lib/selectors.js` | All read queries (feeds, counts, trending, search) | Optional: leave as-is over a fetched snapshot, or convert hot paths to paginated queries |

Components and pages **never** read storage directly, so no UI files need to change for a REST or
GraphQL backend.

### Configuration
`.env.local` (see `.env.local.example`):

```
NEXT_PUBLIC_API_BASE_URL=        # REST base, empty = local demo store
OPENAI_API_KEY=                  # server-only, enables AI Studio
OPENAI_BASE_URL=https://freebuff.com/api/v1/paid
OPENAI_MODEL=gpt-4o-mini
```

---

## 2. Data model

Raw snapshot shape (identical to the tables/collections the backend needs):

```js
{
  profiles:      [{ id, full_name, username, avatar_url, bio, created_at }],
  posts:         [{ id, user_id, title, description, image_url, category, tags: [], created_at }],
  likes:         [{ id, user_id, post_id, created_at }],            // unique (user_id, post_id)
  comments:      [{ id, user_id, post_id, content, created_at }],
  reposts:       [{ id, user_id, post_id, created_at }],            // unique (user_id, post_id)
  bookmarks:     [{ id, user_id, post_id, created_at }],            // unique (user_id, post_id)
  follows:       [{ id, follower_id, following_id, created_at }],   // unique (follower_id, following_id)
  notifications: [{ id, recipient_id, sender_id, type, post_id, is_read, created_at }]
}
```

`type` ∈ `like | comment | follow | mention | repost`.

**Counts are never stored.** `like_count`, `comment_count`, `repost_count`, `follower_count`,
`following_count` and `likes_received` are derived in `lib/selectors.js`. The backend may return them
pre-aggregated for performance; the UI only needs the fields it reads today, so returning raw rows is
always safe.

---

## 3. Response envelope

Recommended for every endpoint so the UI's error path is uniform:

```json
{ "data": <payload>, "error": null }
{ "data": null, "error": { "code": "not_found", "message": "Post not found" } }
```

HTTP status carries the class (200/201, 400 validation, 401 unauthenticated, 403 forbidden,
404 missing, 409 conflict, 429 rate limit, 5xx server). The AI route already follows this pattern and
returns `503 { "error": "not_configured", "message": "…" }` when no key is set — keep that contract.

---

## 4. Auth contract

The prototype's session object (create it server-side, return it on login/signup/refresh):

```js
{
  profileId: "u_…",
  email: "creator@example.com",
  displayName: "Alex Rivera",
  avatarUrl: "https://…",
  signedInAt: "2026-01-01T00:00:00.000Z"
}
```

| Method & path | Body | Returns | Notes |
|---|---|---|---|
| `POST /api/auth/signup` | `{ fullName, username, email, password }` | `{ session, profile }` | 409 if username/email taken |
| `POST /api/auth/login` | `{ email, password }` | `{ session, profile }` | 401 on bad credentials |
| `POST /api/auth/logout` | — | `204` | Clear cookie |
| `GET /api/auth/session` | — | `{ session, profile }` or 401 | Used on app boot |
| `POST /api/auth/reset-password` | `{ email }` | `202` | Always 202 (no account enumeration); sends the email |

Rules the UI already enforces and the server must re-enforce:

- Email must be valid; password ≥ 6 characters.
- Username ≥ 3 characters, ≤ 24, unique, slugged (`lib/utils.js:slugifyUsername`).
- **Every mutation derives the actor from the authenticated session, never from the request body.**

Recommended transport: `httpOnly`, `secure`, `sameSite=lax` session cookie. If you prefer bearer
tokens, return the token in `session` and the client stores it — do not put it in `localStorage` in
production.

---

## 5. Endpoint contract

All mutations are idempotent toggles where noted. `id` values are opaque strings.

### Profiles
| Method & path | Body | Returns |
|---|---|---|
| `GET /api/profiles/:id` | — | `profile` |
| `GET /api/profiles/by-username/:username` | — | `profile` |
| `PATCH /api/profiles/me` | `{ full_name?, username?, bio?, avatar_url? }` | `profile` |
| `GET /api/profiles/:id/stats` | — | `{ posts, followers, following, likesReceived }` |

### Posts
| Method & path | Body | Returns |
|---|---|---|
| `GET /api/posts?query=&category=&sort=&author=&limit=&cursor=` | — | `{ items: [post], nextCursor }` |
| `GET /api/posts/:id` | — | `post` |
| `POST /api/posts` | `{ title, description, image_url, category, tags }` | `post` (201) |
| `DELETE /api/posts/:id` | — | `204` (author only) |

`sort` ∈ `latest | trending | liked | discussed` — the formula is in `lib/selectors.js`
(`trending` = engagement / `age^0.35`).

### Engagement (toggle endpoints return the new state)
| Method & path | Body | Returns |
|---|---|---|
| `POST /api/posts/:id/like` | — | `{ liked, like_count }` |
| `DELETE /api/posts/:id/like` | — | `{ liked, like_count }` |
| `POST /api/posts/:id/bookmark` | — | `{ bookmarked }` |
| `DELETE /api/posts/:id/bookmark` | — | `{ bookmarked }` |
| `POST /api/posts/:id/repost` | — | `{ reposted, repost_count }` |
| `DELETE /api/posts/:id/repost` | — | `{ reposted, repost_count }` |
| `POST /api/profiles/:id/follow` | — | `{ following, follower_count }` |
| `DELETE /api/profiles/:id/follow` | — | `{ following, follower_count }` |

### Comments
| Method & path | Body | Returns |
|---|---|---|
| `GET /api/posts/:id/comments` | — | `[comment]` (oldest first) |
| `POST /api/posts/:id/comments` | `{ content }` | `comment` (201) |
| `DELETE /api/comments/:id` | — | `204` (comment author or post author) |

### Notifications
| Method & path | Body | Returns |
|---|---|---|
| `GET /api/notifications` | — | `{ items: [notification], unread }` |
| `POST /api/notifications/read` | `{ id? }` | `{ unread }` (`id` omitted = mark all) |

Notification creation is a **server responsibility**:
like → post author, comment → post author, follow → followee, repost → post author,
mention → mentioned user. Never notify yourself (the prototype's `buildNotification` skips
`recipient === sender`).

### Discovery
| Method & path | Returns |
|---|---|
| `GET /api/discover/categories` | `[{ name, count }]` |
| `GET /api/discover/tags?limit=12` | `[{ tag, count }]` |
| `GET /api/discover/creators?limit=6` | `[profile]` ranked by followers + engagement |
| `GET /api/search?q=` | `{ posts: [post], creators: [profile] }` |

Search covers `posts.title`, `posts.description`, `posts.category`, `posts.tags`,
`profiles.full_name`, `profiles.username` (case-insensitive substring — the UI does not need ranking).

### AI
| Method & path | Body | Returns |
|---|---|---|
| `POST /api/generate` | `{ prompt, category, style }` | `{ concept: { title, description, tags } }` |

Existing implementation: `app/api/generate/route.js`. It returns
`503 { error: "not_configured" }` when `OPENAI_API_KEY` is absent and the Studio renders an honest
"not connected" card. Keys stay server-side; never forward them to the browser.

---

## 6. Authorization rules (mirror in RLS / middleware)

| Action | Allowed |
|---|---|
| Read posts, profiles, comments, categories, tags | Anyone |
| Create post / comment, like, bookmark, repost, follow | Signed-in only |
| Update profile | Self only |
| Delete post | Post author only (cascade likes, comments, reposts, bookmarks, notifications) |
| Delete comment | Comment author or post author |
| Read notifications | Recipient only |
| Change is_read | Recipient only |

Known gaps the UI guards client-side that the server must enforce: self-follow, self-like,
duplicate like/bookmark/repost/follow rows, deleting another user's content.

---

## 7. Storage & uploads

- Current prototype: uploads are resized client-side (`lib/image.js`, max 12 MB input) and stored as
  data URLs, so they vanish with `localStorage`.
- Production: accept `multipart/form-data` on `POST /api/uploads` → return `{ url }`; use object
  storage (R2/S3) with signed URLs, public read for avatars, owner-scoped for post images.
- Limits to keep: images ≤ 12 MB upload, avatars square, post images 16:10-ish.

---

## 8. Migration steps (suggested order)

1. **Schema + seed** — create the eight collections/tables above with the unique constraints listed.
2. **Auth** — implement §4, swap `getSession`/`saveSession`/`createLocalSession` usage in
   `app/providers.js`, keep the `session` shape identical.
3. **Read path** — hydrate the snapshot from `GET /api/bootstrap` (or wire selectors to paginated
   endpoints). Hydrating one snapshot is the smallest change that preserves all current screens.
4. **Mutations** — replace each `commit(...)` block in `app/providers.js` with the matching endpoint
   from §5, keeping the same return shapes (`{ ok, ... }`) so no component changes.
5. **Notifications** — move creation server-side, keep the payload shape.
6. **Uploads** — swap `lib/image.js` output for an upload call.
7. **Realtime (optional)** — subscriptions for likes/comments/follows; the UI already re-reads on
   storage events, so a socket that invalidates the local cache is enough.

---

## 9. Backend-handover acceptance checklist

- [ ] Every route in §5 returns the documented envelope and status codes.
- [ ] Signup → login → refresh → logout round-trips and the session shape matches §4.
- [ ] A signed-out request to a mutation returns 401, and the UI shows its existing "sign in" toast.
- [ ] Two accounts cannot read each other's notifications or delete each other's content.
- [ ] Duplicate like/bookmark/repost/follow requests are idempotent.
- [ ] Counts derived from the server match what `lib/selectors.js` computes for the same rows.
- [ ] Post deletion cascades to likes, comments, reposts, bookmarks and notifications.
- [ ] `POST /api/generate` still returns 503 `not_configured` when the key is absent.
- [ ] Image URLs returned by uploads load in the feed without CORS issues.

---

## 10. Prototype limitations to carry over knowingly

- Session is `localStorage`-only and resets on full reload until §4 is implemented.
- Auth accepts any email + 6-character password — demo behaviour, not a security model.
- Password reset shows a demo notice; no email is sent.
- All data is per-browser; there is no cross-device or multi-user state yet.
- No realtime updates across tabs beyond the same-origin `storage` event.
- No pagination; the whole snapshot is loaded at once (fine at prototype scale).
