"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { useApp } from "@/app/providers";
import { buildFeed, profileById } from "@/lib/selectors";
import AuthGate from "@/components/auth/AuthGate";
import PostCard from "@/components/feed/PostCard";
import SortDropdown from "@/components/feed/SortDropdown";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import ImageViewer from "@/components/ui/ImageViewer";
import Avatar from "@/components/ui/Avatar";

function FollowingContent() {
  const { database, viewerId } = useApp();
  const [sort, setSort] = useState("latest");
  const [viewerPost, setViewerPost] = useState(null);

  const feed = useMemo(
    () => buildFeed(database, viewerId, { scope: "following", sort }),
    [database, sort, viewerId]
  );

  const followed = useMemo(() => {
    if (!database) return [];
    return database.follows
      .filter((follow) => follow.follower_id === viewerId)
      .map((follow) => profileById(database, follow.following_id))
      .filter((profile) => profile && profile.id !== viewerId);
  }, [database, viewerId]);

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Following</h1>
          <p className="page-sub">
            New work from the {followed.length} creator{followed.length === 1 ? "" : "s"} you
            follow.
          </p>
        </div>
        <div className="page-head__actions">
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </header>

      {followed.length > 0 ? (
        <div
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 8 }}
        >
          {followed.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              title={profile.full_name}
            >
              <Avatar src={profile.avatar_url} name={profile.full_name} size="md" ring />
            </Link>
          ))}
        </div>
      ) : null}

      <div className="feed-meta">
        <span>{feed.total} creations</span>
        <span>From creators you follow</span>
      </div>

      {feed.posts.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Users size={19} />
          </span>
          <h3>Your following feed is quiet</h3>
          <p>
            Follow a few creators and their newest work will appear here. Start with the
            people shaping the community right now.
          </p>
          <Link href="/discover" className="btn btn--primary btn--sm">
            <UserPlus size={14} /> Find creators
          </Link>
        </div>
      ) : (
        feed.posts.map((post) => (
          <PostCard key={post.id} post={post} onOpenImage={setViewerPost} />
        ))
      )}

      <ImageViewer post={viewerPost} onClose={() => setViewerPost(null)} />
    </>
  );
}

export default function FollowingPage() {
  return (
    <AuthGate>
      <FollowingContent />
    </AuthGate>
  );
}
