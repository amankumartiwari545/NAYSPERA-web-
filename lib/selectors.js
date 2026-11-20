import { getDatabase } from "./storage";

const safe = (value) => value || "";

export function profileById(database, id) {
  return database.profiles.find((profile) => profile.id === id) || null;
}

export function profileByUsername(database, username) {
  const needle = safe(username).toLowerCase();
  return (
    database.profiles.find((profile) => profile.username.toLowerCase() === needle) ||
    null
  );
}

export function likeCount(database, postId) {
  return database.likes.filter((like) => like.post_id === postId).length;
}

export function commentCount(database, postId) {
  return database.comments.filter((comment) => comment.post_id === postId).length;
}

export function repostCount(database, postId) {
  return database.reposts.filter((repost) => repost.post_id === postId).length;
}

export function postComments(database, postId) {
  return database.comments
    .filter((comment) => comment.post_id === postId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((comment) => ({ ...comment, author: profileById(database, comment.user_id) }));
}

export function decoratePost(database, post, viewerId) {
  const liked = database.likes.some(
    (like) => like.post_id === post.id && like.user_id === viewerId
  );
  return {
    ...post,
    author: profileById(database, post.user_id),
    likeCount: likeCount(database, post.id),
    commentCount: commentCount(database, post.id),
    repostCount: repostCount(database, post.id),
    liked,
    bookmarked: database.bookmarks.some(
      (bookmark) => bookmark.post_id === post.id && bookmark.user_id === viewerId
    ),
    reposted: database.reposts.some(
      (repost) => repost.post_id === post.id && repost.user_id === viewerId
    ),
    isFollowingAuthor: isFollowing(database, viewerId, post.user_id),
  };
}

export function isFollowing(database, followerId, followingId) {
  if (!followerId) return false;
  return database.follows.some(
    (follow) => follow.follower_id === followerId && follow.following_id === followingId
  );
}

export function followerCount(database, userId) {
  return database.follows.filter((follow) => follow.following_id === userId).length;
}

export function followingCount(database, userId) {
  return database.follows.filter((follow) => follow.follower_id === userId).length;
}

export function postCount(database, userId) {
  return database.posts.filter((post) => post.user_id === userId).length;
}

export function likesReceived(database, userId) {
  const postIds = new Set(
    database.posts.filter((post) => post.user_id === userId).map((post) => post.id)
  );
  return database.likes.filter((like) => postIds.has(like.post_id)).length;
}

export function searchPosts(database, posts, query) {
  const needle = safe(query).trim().toLowerCase().replace(/^#/, "");
  if (!needle) return posts;
  return posts.filter((post) => {
    const author = profileById(database, post.user_id);
    const haystack = [
      post.title,
      post.description,
      post.category,
      ...(post.tags || []),
      author?.full_name,
      author?.username,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function sortPosts(posts, sortBy) {
  const list = [...posts];
  switch (sortBy) {
    case "liked":
      return list.sort((a, b) => b.likeCount - a.likeCount);
    case "discussed":
      return list.sort((a, b) => b.commentCount - a.commentCount);
    case "trending":
      return list.sort((a, b) => trendingScore(b) - trendingScore(a));
    case "latest":
    default:
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export function trendingScore(post) {
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
  const engagement = post.likeCount + post.commentCount * 3 + post.repostCount * 2;
  return engagement / Math.pow(Math.max(ageHours, 1) + 2, 0.35);
}

/**
 * The feed builder every page shares, so search, filters and scopes behave
 * identically wherever they are used.
 */
export function buildFeed(
  database,
  viewerId,
  { scope = "explore", query = "", category = "All", sort = "latest", filter = "all" } = {}
) {
  let base = database.posts;

  if (scope === "following") {
    const followed = new Set(
      database.follows
        .filter((follow) => follow.follower_id === viewerId)
        .map((follow) => follow.following_id)
    );
    base = base.filter((post) => followed.has(post.user_id));
  }

  if (scope === "saved") {
    const saved = new Set(
      database.bookmarks
        .filter((bookmark) => bookmark.user_id === viewerId)
        .map((bookmark) => bookmark.post_id)
    );
    base = base.filter((post) => saved.has(post.id));
  }

  if (scope === "profile" && viewerId) {
    base = base.filter((post) => post.user_id === viewerId);
  }

  let decorated = base.map((post) => decoratePost(database, post, viewerId));
  decorated = searchPosts(database, decorated, query);

  if (category && category !== "All") {
    decorated = decorated.filter(
      (post) =>
        post.category === category || (post.tags || []).includes(category)
    );
  }

  if (filter === "popular") {
    decorated = decorated.filter((post) => post.likeCount >= 100);
  }

  if (filter === "trending") {
    decorated = sortPosts(decorated, "trending").slice(0, 8);
    return { posts: decorated, total: decorated.length };
  }

  const sorted = sortPosts(decorated, sort);
  return { posts: sorted, total: sorted.length };
}

export function creatorSummary(database, profile, viewerId) {
  return {
    ...profile,
    followers: followerCount(database, profile.id),
    following: followingCount(database, profile.id),
    posts: postCount(database, profile.id),
    likes: likesReceived(database, profile.id),
    isFollowing: isFollowing(database, viewerId, profile.id),
    isSelf: profile.id === viewerId,
  };
}

export function topCreators(database, viewerId, limit = 4) {
  return database.profiles
    .map((profile) => creatorSummary(database, profile, viewerId))
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit);
}

export function suggestedCreators(database, viewerId, limit = 3) {
  return database.profiles
    .filter((profile) => profile.id !== viewerId)
    .filter((profile) => !isFollowing(database, viewerId, profile.id))
    .map((profile) => creatorSummary(database, profile, viewerId))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}

export function trendingTags(database, limit = 8) {
  const counts = new Map();
  database.posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function categoryCounts(database) {
  const counts = new Map();
  database.posts.forEach((post) => {
    counts.set(post.category, (counts.get(post.category) || 0) + 1);
    (post.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function notificationsFor(database, userId) {
  return database.notifications
    .filter((notification) => notification.recipient_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((notification) => ({
      ...notification,
      sender: profileById(database, notification.sender_id),
      post: database.posts.find((post) => post.id === notification.post_id) || null,
    }));
}

export function unreadCount(database, userId) {
  return database.notifications.filter(
    (notification) => notification.recipient_id === userId && !notification.is_read
  ).length;
}

export function platformActivity(database) {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  const recent = (rows) =>
    rows.filter((row) => new Date(row.created_at).getTime() >= cutoff).length;
  return [
    { label: "New creations today", value: recent(database.posts) + 128 },
    { label: "Likes in the last 24h", value: recent(database.likes) + 2410 },
    {
      label: "Creators online",
      value: Math.min(database.profiles.length * 9 + 64, 999),
    },
  ];
}

export function findPost(database, postId) {
  return database.posts.find((post) => post.id === postId) || null;
}

export { getDatabase };
