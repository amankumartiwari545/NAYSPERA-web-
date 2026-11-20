import { createSeedDatabase, DEMO_USER } from "./seed";

const DB_KEY = "nayspera.db.v2";
const SESSION_KEY = "nayspera.session.v2";

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

export function newId(prefix) {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function getDatabase() {
  if (!hasStorage()) return createSeedDatabase();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const seed = createSeedDatabase();
      window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.posts) || !Array.isArray(parsed.profiles)) {
      throw new Error("Malformed local data");
    }
    return {
      profiles: parsed.profiles || [],
      posts: parsed.posts || [],
      likes: parsed.likes || [],
      comments: parsed.comments || [],
      reposts: parsed.reposts || [],
      follows: parsed.follows || [],
      bookmarks: parsed.bookmarks || [],
      notifications: parsed.notifications || [],
    };
  } catch {
    const seed = createSeedDatabase();
    saveDatabase(seed);
    return seed;
  }
}

export function saveDatabase(database) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(database));
  } catch (error) {
    console.warn("NAYSPERA: could not persist local data", error);
  }
}

export function resetDatabase() {
  if (!hasStorage()) return createSeedDatabase();
  const seed = createSeedDatabase();
  window.localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

export function getSession() {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (!hasStorage()) return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Local accounts are intentionally lightweight: the demo stores a profile
 * snapshot alongside the session instead of authenticating against a server.
 */
export function createLocalSession(profile, email) {
  return {
    profileId: profile.id,
    email,
    displayName: profile.full_name,
    avatarUrl: profile.avatar_url,
    signedInAt: new Date().toISOString(),
  };
}

export { DEMO_USER };
