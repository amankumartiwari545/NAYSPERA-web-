"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { useApp } from "@/app/providers";
import {
  buildFeed,
  categoryCounts,
  creatorSummary,
  trendingTags,
} from "@/lib/selectors";
import { formatCount } from "@/lib/utils";
import PostCard from "@/components/feed/PostCard";
import CreatorCard from "@/components/discover/CreatorCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import ImageViewer from "@/components/ui/ImageViewer";

export default function DiscoverPage() {
  const { database, viewerId, ready } = useApp();
  const [viewerPost, setViewerPost] = useState(null);

  const categories = useMemo(() => {
    if (!database) return [];
    return categoryCounts(database)
      .filter((item) => database.posts.some((post) => post.category === item.name))
      .slice(0, 8)
      .map((item) => ({
        ...item,
        image: database.posts.find((post) => post.category === item.name)?.image_url,
      }));
  }, [database]);

  const creators = useMemo(() => {
    if (!database) return [];
    return database.profiles
      .map((profile) => creatorSummary(database, profile, viewerId))
      .sort((a, b) => b.followers + b.likes - (a.followers + a.likes))
      .slice(0, 8);
  }, [database, viewerId]);

  const popular = useMemo(() => {
    if (!database) return { posts: [] };
    return buildFeed(database, viewerId, { scope: "explore", sort: "liked", filter: "all" });
  }, [database, viewerId]);

  const tags = useMemo(
    () => (database ? trendingTags(database, 10) : []),
    [database]
  );

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Discover</h1>
          <p className="page-sub">
            Trending creators, popular categories and the work the community is talking
            about.
          </p>
        </div>
      </header>

      <div className="toolbar" style={{ marginTop: 0 }}>
        {tags.slice(0, 7).map((item) => (
          <Link
            key={item.tag}
            href={`/explore?q=${encodeURIComponent(item.tag)}`}
            className="chip"
          >
            #{item.tag.replace(/\s+/g, "")}
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>Popular categories</h2>
        <Link href="/explore">Browse all creations</Link>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/explore?category=${encodeURIComponent(category.name)}`}
            className="category-card"
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${category.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.32,
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(5,11,25,0.15) 10%, rgba(5,11,25,0.92) 100%)",
              }}
            />
            <span className="category-card__name" style={{ position: "relative", zIndex: 1 }}>
              {category.name}
            </span>
            <span className="category-card__count" style={{ position: "relative", zIndex: 1 }}>
              {category.count} creations
            </span>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>
          <Sparkles
            size={15}
            style={{ display: "inline", marginRight: 6, color: "var(--cyan)" }}
          />
          Creators to know
        </h2>
        <span className="muted">Ranked by reach and engagement</span>
      </div>

      {!ready ? (
        <div className="creator-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton" key={index} style={{ height: 150 }} />
          ))}
        </div>
      ) : (
        <div className="creator-grid">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}

      <div className="section-head">
        <h2>
          <Flame
            size={15}
            style={{ display: "inline", marginRight: 6, color: "var(--cyan)" }}
          />
          Popular right now
        </h2>
        <span className="muted">Most liked in the community</span>
      </div>

      {!ready ? <FeedSkeleton count={2} /> : null}
      {ready
        ? popular.posts
            .slice(0, 4)
            .map((post) => (
              <PostCard key={post.id} post={post} onOpenImage={setViewerPost} />
            ))
        : null}

      {ready && popular.posts.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Sparkles size={19} />
          </span>
          <h3>No creations yet</h3>
          <p>Once the community publishes work, the most liked pieces surface here.</p>
        </div>
      ) : null}

      <p className="panel__note" style={{ marginTop: 18 }}>
        {formatCount(database?.profiles.length || 0)} creators ·{" "}
        {formatCount(database?.posts.length || 0)} published creations ·{" "}
        {formatCount(database?.likes.length || 0)} likes exchanged
      </p>

      <ImageViewer post={viewerPost} onClose={() => setViewerPost(null)} />
    </>
  );
}
