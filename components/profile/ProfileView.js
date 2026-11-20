"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Pencil, Share2, UserPlus } from "lucide-react";
import { useApp } from "@/app/providers";
import { creatorSummary, decoratePost } from "@/lib/selectors";
import { formatCount } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/components/feed/PostCard";
import ImageViewer from "@/components/ui/ImageViewer";

export default function ProfileView({ profile }) {
  const { database, viewerId, toggleFollow, toast } = useApp();
  const [tab, setTab] = useState("creations");
  const [viewerPost, setViewerPost] = useState(null);

  const summary = creatorSummary(database, profile, viewerId);

  const creations = useMemo(
    () =>
      database.posts
        .filter((post) => post.user_id === profile.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [database.posts, profile.id]
  );

  const likedPosts = useMemo(() => {
    const likedIds = new Set(
      database.likes
        .filter((like) => like.user_id === profile.id)
        .map((like) => like.post_id)
    );
    return database.posts
      .filter((post) => likedIds.has(post.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [database.likes, database.posts, profile.id]);

  const list = tab === "creations" ? creations : likedPosts;
  const cover = creations[0]?.image_url;

  // Build decorated posts through the same selectors used by the feed.
  const decorated = useMemo(
    () => list.map((post) => decoratePost(database, post, viewerId)),
    [database, list, viewerId]
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/profile/${profile.username}`
      );
      toast("Profile link copied.", "success");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{summary.isSelf ? "Your profile" : "Creator profile"}</h1>
          <p className="page-sub">
            {summary.isSelf
              ? "How the community sees you and the work you have shared."
              : `Everything ${profile.full_name.split(" ")[0]} has published on NAYSPERA.`}
          </p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={share}>
            <Share2 size={14} /> Share
          </button>
          {summary.isSelf ? (
            <Link href="/settings" className="btn btn--primary btn--sm">
              <Pencil size={14} /> Edit profile
            </Link>
          ) : (
            <button
              type="button"
              className={`btn btn--sm ${summary.isFollowing ? "btn--ghost" : "btn--primary"}`}
              onClick={() => {
                const following = toggleFollow(profile.id);
                if (following) toast(`Following ${profile.full_name}.`, "success");
              }}
            >
              <UserPlus size={14} />
              {summary.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="profile-cover">
        {cover ? <img src={cover} alt="" aria-hidden="true" /> : null}
      </div>

      <div className="profile-head">
        <div className="profile-avatar-wrap">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
        </div>
      </div>

      <div className="profile-body">
        <h2 className="profile-name">
          {profile.full_name}
          <span className="profile-badge">
            <BadgeCheck size={11} /> Creator
          </span>
        </h2>
        <p className="profile-handle">
          @{profile.username} · Joined{" "}
          {new Date(profile.created_at).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="profile-bio">{profile.bio || "This creator has not written a bio yet."}</p>

        <div className="stats-row">
          <div className="stat">
            <strong>{formatCount(summary.posts)}</strong>
            <span>Posts</span>
          </div>
          <div className="stat">
            <strong>{formatCount(summary.followers)}</strong>
            <span>Followers</span>
          </div>
          <div className="stat">
            <strong>{formatCount(summary.following)}</strong>
            <span>Following</span>
          </div>
          <div className="stat">
            <strong>{formatCount(summary.likes)}</strong>
            <span>Likes earned</span>
          </div>
        </div>

        <div className="profile-tabs" role="tablist" aria-label="Profile content">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "creations"}
            className={`profile-tab ${tab === "creations" ? "is-active" : ""}`}
            onClick={() => setTab("creations")}
          >
            Creations ({creations.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "liked"}
            className={`profile-tab ${tab === "liked" ? "is-active" : ""}`}
            onClick={() => setTab("liked")}
          >
            Liked ({likedPosts.length})
          </button>
        </div>

        {decorated.length === 0 ? (
          <div className="empty" style={{ padding: "40px 20px" }}>
            <span className="empty__icon">
              <Pencil size={18} />
            </span>
            <h3>
              {tab === "creations" ? "No creations published yet" : "No liked creations yet"}
            </h3>
            <p>
              {summary.isSelf && tab === "creations"
                ? "Publish your first piece from the New creation button in the sidebar."
                : "When this creator shares or likes work, it will show up here."}
            </p>
          </div>
        ) : (
          decorated.map((post) => (
            <PostCard key={post.id} post={post} onOpenImage={setViewerPost} />
          ))
        )}
      </div>

      <ImageViewer post={viewerPost} onClose={() => setViewerPost(null)} />
    </>
  );
}
