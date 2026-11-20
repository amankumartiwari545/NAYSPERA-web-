"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Compass } from "lucide-react";
import { useApp } from "@/app/providers";
import { buildFeed } from "@/lib/selectors";
import AuthGate from "@/components/auth/AuthGate";
import PostCard from "@/components/feed/PostCard";
import SortDropdown from "@/components/feed/SortDropdown";
import ImageViewer from "@/components/ui/ImageViewer";

function SavedContent() {
  const { database, viewerId } = useApp();
  const [sort, setSort] = useState("latest");
  const [viewerPost, setViewerPost] = useState(null);

  const feed = useMemo(
    () => buildFeed(database, viewerId, { scope: "saved", sort }),
    [database, sort, viewerId]
  );

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Saved</h1>
          <p className="page-sub">Your private collection of ideas worth returning to.</p>
        </div>
        <div className="page-head__actions">
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </header>

      <div className="feed-meta">
        <span>{feed.total} saved</span>
        <span>Only visible to you</span>
      </div>

      {feed.posts.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Bookmark size={19} />
          </span>
          <h3>Nothing saved yet</h3>
          <p>
            Tap the bookmark icon on any creation to keep it here for later. Saved work is
            private to your account.
          </p>
          <Link href="/explore" className="btn btn--primary btn--sm">
            <Compass size={14} /> Explore creations
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

export default function SavedPage() {
  return (
    <AuthGate>
      <SavedContent />
    </AuthGate>
  );
}
