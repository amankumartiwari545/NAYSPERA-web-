"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  createLocalSession,
  getDatabase,
  getSession,
  newId,
  resetDatabase,
  saveDatabase,
  saveSession,
} from "@/lib/storage";

const AppContext = createContext(null);

const now = () => new Date().toISOString();

function buildNotification({ recipient, sender, type, postId = null }) {
  if (!recipient || !sender || recipient === sender) return null;
  return {
    id: newId("n"),
    recipient_id: recipient,
    sender_id: sender,
    type,
    post_id: postId,
    is_read: false,
    created_at: now(),
  };
}

export function AppProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [database, setDatabase] = useState(null);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const dbRef = useRef(null);

  useEffect(() => {
    const initial = getDatabase();
    dbRef.current = initial;
    setDatabase(initial);
    setSession(getSession());
    setReady(true);

    const sync = (event) => {
      if (event.key === "nayspera.session.v2") setSession(getSession());
      if (event.key === "nayspera.db.v2") {
        const next = getDatabase();
        dbRef.current = next;
        setDatabase(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message, tone = "info") => {
      const id = newId("t");
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      const timer = setTimeout(() => dismissToast(id), 3800);
      timers.current.set(id, timer);
      return id;
    },
    [dismissToast]
  );

  /**
   * Applies a mutation synchronously against the latest dataset, persists it and
   * publishes it to React. Keeping the newest database in a ref means action
   * results ("did this follow start?") are available immediately to callers.
   */
  const commit = useCallback((updater) => {
    const previous = dbRef.current;
    if (!previous) return null;
    const next = updater(previous) || previous;
    dbRef.current = next;
    saveDatabase(next);
    setDatabase(next);
    return next;
  }, []);

  const viewerId = session?.profileId || null;
  const profile = useMemo(
    () => database?.profiles.find((item) => item.id === viewerId) || null,
    [database, viewerId]
  );

  const ensureAuth = useCallback(
    (message = "Sign in to continue.") => {
      if (viewerId) return true;
      toast(message, "info");
      const next = pathname && pathname !== "/login" ? pathname : "/explore";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return false;
    },
    [pathname, router, toast, viewerId]
  );

  /* ---------------------------------------------------------------- auth */

  const signIn = useCallback(
    ({ email, password }) => {
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      if (String(password || "").length < 6) {
        return { ok: false, error: "Passwords must be at least 6 characters." };
      }
      const db = database || getDatabase();
      const account = db.profiles.find((item) => item.id === "u_me");
      if (!account) return { ok: false, error: "Local account is unavailable." };

      const nextSession = createLocalSession(account, cleanEmail);
      setSession(nextSession);
      saveSession(nextSession);
      toast(`Welcome back, ${account.full_name.split(" ")[0]}.`, "success");
      return { ok: true };
    },
    [database, toast]
  );

  const signUp = useCallback(
    ({ email, password, fullName, username }) => {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanName = String(fullName || "").trim();
      const cleanUsername = String(username || "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase()
        .replace(/[^a-z0-9._]/g, "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      if (cleanName.length < 2) {
        return { ok: false, error: "Enter your name." };
      }
      if (cleanUsername.length < 3) {
        return { ok: false, error: "Usernames need at least 3 characters." };
      }
      if (String(password || "").length < 6) {
        return { ok: false, error: "Passwords must be at least 6 characters." };
      }

      const db = database || getDatabase();
      const taken = db.profiles.some(
        (item) => item.id !== "u_me" && item.username === cleanUsername
      );
      if (taken) return { ok: false, error: "That username is already taken." };

      let account = null;
      commit((previous) => {
        const profiles = previous.profiles.map((item) => {
          if (item.id !== "u_me") return item;
          account = { ...item, full_name: cleanName, username: cleanUsername };
          return account;
        });
        return { ...previous, profiles };
      });

      const profileForSession =
        account || db.profiles.find((item) => item.id === "u_me");
      const nextSession = createLocalSession(profileForSession, cleanEmail);
      setSession(nextSession);
      saveSession(nextSession);
      toast("Account created. Your studio is ready.", "success");
      return { ok: true };
    },
    [commit, database, toast]
  );

  const signOut = useCallback(() => {
    setSession(null);
    saveSession(null);
    toast("Signed out.", "info");
    router.push("/explore");
  }, [router, toast]);

  const requestPasswordReset = useCallback(
    (email) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim())) {
        return { ok: false, error: "Enter a valid email address." };
      }
      toast("Reset requested. This local build keeps accounts on this device only.", "info");
      return { ok: true };
    },
    [toast]
  );

  /* --------------------------------------------------------- interactions */

  const toggleLike = useCallback(
    (postId) => {
      if (!ensureAuth("Sign in to like creations.")) return false;
      commit((previous) => {
        const existing = previous.likes.find(
          (like) => like.post_id === postId && like.user_id === viewerId
        );
        if (existing) {
          return {
            ...previous,
            likes: previous.likes.filter((like) => like.id !== existing.id),
          };
        }
        const post = previous.posts.find((item) => item.id === postId);
        const notification = buildNotification({
          recipient: post?.user_id,
          sender: viewerId,
          type: "like",
          postId,
        });
        return {
          ...previous,
          likes: [
            ...previous.likes,
            { id: newId("l"), user_id: viewerId, post_id: postId, created_at: now() },
          ],
          notifications: notification
            ? [...previous.notifications, notification]
            : previous.notifications,
        };
      });
      return true;
    },
    [commit, ensureAuth, viewerId]
  );

  const toggleBookmark = useCallback(
    (postId) => {
      if (!ensureAuth("Sign in to save creations.")) return false;
      let saved = false;
      commit((previous) => {
        const existing = previous.bookmarks.find(
          (bookmark) => bookmark.post_id === postId && bookmark.user_id === viewerId
        );
        if (existing) {
          return {
            ...previous,
            bookmarks: previous.bookmarks.filter((item) => item.id !== existing.id),
          };
        }
        saved = true;
        return {
          ...previous,
          bookmarks: [
            ...previous.bookmarks,
            { id: newId("b"), user_id: viewerId, post_id: postId, created_at: now() },
          ],
        };
      });
      toast(saved ? "Saved to your collection." : "Removed from saved.", "success");
      return true;
    },
    [commit, ensureAuth, toast, viewerId]
  );

  const toggleRepost = useCallback(
    (postId) => {
      if (!ensureAuth("Sign in to repost creations.")) return false;
      commit((previous) => {
        const existing = previous.reposts.find(
          (repost) => repost.post_id === postId && repost.user_id === viewerId
        );
        if (existing) {
          return {
            ...previous,
            reposts: previous.reposts.filter((item) => item.id !== existing.id),
          };
        }
        const post = previous.posts.find((item) => item.id === postId);
        const notification = buildNotification({
          recipient: post?.user_id,
          sender: viewerId,
          type: "repost",
          postId,
        });
        return {
          ...previous,
          reposts: [
            ...previous.reposts,
            { id: newId("r"), user_id: viewerId, post_id: postId, created_at: now() },
          ],
          notifications: notification
            ? [...previous.notifications, notification]
            : previous.notifications,
        };
      });
      return true;
    },
    [commit, ensureAuth, viewerId]
  );

  const toggleFollow = useCallback(
    (targetId) => {
      if (!ensureAuth("Sign in to follow creators.")) return false;
      if (!targetId || targetId === viewerId) return false;
      let nowFollowing = false;
      commit((previous) => {
        const existing = previous.follows.find(
          (follow) =>
            follow.follower_id === viewerId && follow.following_id === targetId
        );
        if (existing) {
          return {
            ...previous,
            follows: previous.follows.filter((follow) => follow.id !== existing.id),
          };
        }
        nowFollowing = true;
        const notification = buildNotification({
          recipient: targetId,
          sender: viewerId,
          type: "follow",
        });
        return {
          ...previous,
          follows: [
            ...previous.follows,
            {
              id: newId("f"),
              follower_id: viewerId,
              following_id: targetId,
              created_at: now(),
            },
          ],
          notifications: notification
            ? [...previous.notifications, notification]
            : previous.notifications,
        };
      });
      return nowFollowing;
    },
    [commit, ensureAuth, viewerId]
  );

  const addComment = useCallback(
    (postId, content) => {
      if (!ensureAuth("Sign in to join the conversation.")) return false;
      const text = String(content || "").trim();
      if (!text) return false;
      commit((previous) => {
        const post = previous.posts.find((item) => item.id === postId);
        const notification = buildNotification({
          recipient: post?.user_id,
          sender: viewerId,
          type: "comment",
          postId,
        });
        return {
          ...previous,
          comments: [
            ...previous.comments,
            {
              id: newId("c"),
              user_id: viewerId,
              post_id: postId,
              content: text.slice(0, 600),
              created_at: now(),
            },
          ],
          notifications: notification
            ? [...previous.notifications, notification]
            : previous.notifications,
        };
      });
      return true;
    },
    [commit, ensureAuth, viewerId]
  );

  const deleteComment = useCallback(
    (commentId) => {
      if (!ensureAuth()) return false;
      commit((previous) => ({
        ...previous,
        comments: previous.comments.filter(
          (comment) =>
            comment.id !== commentId ||
            (comment.user_id !== viewerId &&
              previous.posts.find((post) => post.id === comment.post_id)?.user_id !==
                viewerId)
        ),
      }));
      return true;
    },
    [commit, ensureAuth, viewerId]
  );

  const createPost = useCallback(
    ({ title, description, category, tags, imageUrl }) => {
      if (!ensureAuth("Sign in to publish a creation.")) return null;
      const cleanTitle = String(title || "").trim();
      if (cleanTitle.length < 3) {
        toast("Give your creation a title.", "error");
        return null;
      }
      if (!imageUrl) {
        toast("Add an image before publishing.", "error");
        return null;
      }
      const id = newId("p");
      commit((previous) => ({
        ...previous,
        posts: [
          {
            id,
            user_id: viewerId,
            title: cleanTitle.slice(0, 90),
            description: String(description || "").trim().slice(0, 400),
            image_url: imageUrl,
            category: category || "AI Generate",
            tags: (tags || []).slice(0, 6),
            created_at: now(),
          },
          ...previous.posts,
        ],
      }));
      toast("Creation published.", "success");
      return id;
    },
    [commit, ensureAuth, toast, viewerId]
  );

  const deletePost = useCallback(
    (postId) => {
      if (!ensureAuth()) return false;
      commit((previous) => {
        const post = previous.posts.find((item) => item.id === postId);
        if (!post || post.user_id !== viewerId) return previous;
        return {
          ...previous,
          posts: previous.posts.filter((item) => item.id !== postId),
          likes: previous.likes.filter((like) => like.post_id !== postId),
          comments: previous.comments.filter((comment) => comment.post_id !== postId),
          reposts: previous.reposts.filter((repost) => repost.post_id !== postId),
          bookmarks: previous.bookmarks.filter((bookmark) => bookmark.post_id !== postId),
          notifications: previous.notifications.filter(
            (notification) => notification.post_id !== postId
          ),
        };
      });
      toast("Creation removed.", "success");
      return true;
    },
    [commit, ensureAuth, toast, viewerId]
  );

  const updateProfile = useCallback(
    (patch) => {
      if (!ensureAuth()) return { ok: false };
      const cleanUsername = patch.username
        ? String(patch.username).replace(/^@/, "").toLowerCase()
        : null;
      if (cleanUsername && cleanUsername.length < 3) {
        return { ok: false, error: "Usernames need at least 3 characters." };
      }
      if (
        cleanUsername &&
        database?.profiles.some(
          (item) => item.id !== viewerId && item.username === cleanUsername
        )
      ) {
        return { ok: false, error: "That username is already taken." };
      }

      commit((previous) => ({
        ...previous,
        profiles: previous.profiles.map((item) =>
          item.id === viewerId
            ? {
                ...item,
                ...patch,
                username: cleanUsername || item.username,
                full_name: String(patch.full_name || item.full_name).slice(0, 60),
                bio: String(patch.bio ?? item.bio).slice(0, 200),
              }
            : item
        ),
      }));

      if (session) {
        const nextSession = {
          ...session,
          displayName: patch.full_name || session.displayName,
          avatarUrl: patch.avatar_url || session.avatarUrl,
        };
        setSession(nextSession);
        saveSession(nextSession);
      }
      toast("Profile updated.", "success");
      return { ok: true };
    },
    [commit, database, ensureAuth, session, toast, viewerId]
  );

  const markAllRead = useCallback(() => {
    if (!viewerId) return;
    commit((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notification) =>
        notification.recipient_id === viewerId
          ? { ...notification, is_read: true }
          : notification
      ),
    }));
  }, [commit, viewerId]);

  const markRead = useCallback(
    (notificationId) => {
      commit((previous) => ({
        ...previous,
        notifications: previous.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        ),
      }));
    },
    [commit]
  );

  const resetDemoData = useCallback(() => {
    const seed = resetDatabase();
    dbRef.current = seed;
    setDatabase(seed);
    toast("Community data restored to the sample set.", "success");
  }, [toast]);

  const value = useMemo(
    () => ({
      ready,
      database,
      session,
      profile,
      viewerId,
      toasts,
      toast,
      dismissToast,
      ensureAuth,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      toggleLike,
      toggleBookmark,
      toggleRepost,
      toggleFollow,
      addComment,
      deleteComment,
      createPost,
      deletePost,
      updateProfile,
      markAllRead,
      markRead,
      resetDemoData,
    }),
    [
      ready,
      database,
      session,
      profile,
      viewerId,
      toasts,
      toast,
      dismissToast,
      ensureAuth,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      toggleLike,
      toggleBookmark,
      toggleRepost,
      toggleFollow,
      addComment,
      deleteComment,
      createPost,
      deletePost,
      updateProfile,
      markAllRead,
      markRead,
      resetDemoData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
