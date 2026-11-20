"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/app/providers";
import { buildFeed, categoryCounts, creatorSummary } from "@/lib/selectors";
import { CATEGORIES } from "@/lib/utils";
import PostCard from "@/components/feed/PostCard";
import SortDropdown from "@/components/feed/SortDropdown";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import CreatorResultRow from "@/components/feed/CreatorResultRow";
import ImageViewer from "@/components/ui/ImageViewer";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
];

function ExploreContent() {
  const { database, viewerId, ready } = useApp();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("latest");
  const [filter, setFilter] = useState("all");
  const [viewerPost, setViewerPost] = useState(null);

  useEffect(() => {
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "All");
  }, [params]);

  const categories = useMemo(
    () => (database ? categoryCounts(database).map((item) => item.name) : []),
    [database]
  );

  const toolbarCategories = useMemo(() => {
    const ranked = categories.filter((name) => CATEGORIES.includes(name));
    return ["All", ...Array.from(new Set(ranked)).slice(0, 7)];
  }, [categories]);

  const feed = useMemo(() => {
    if (!database) return { posts: [], total: 0 };
    return buildFeed(database, viewerId, {
      scope: "explore",
      query,
      category,
      sort,
      filter,
    });
  }, [category, database, filter, query, sort, viewerId]);

  const creatorMatches = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^#/, "");
    if (!database || !needle) return [];
    return database.profiles
      .filter((profile) =>
        `${profile.full_name} ${profile.username}`.toLowerCase().includes(needle)
      )
      .slice(0, 3)
      .map((profile) => creatorSummary(database, profile, viewerId));
  }, [database, query, viewerId]);

  const hasActiveFilters = query || category !== "All" || filter !== "all";

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setFilter("all");
  };

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-sub">Discover and get inspired by amazing creations.</p>
        </div>
        <div className="page-head__actions">
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </header>

      <div className="searchbar">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search creations, creators, categories or #hashtags…"
          aria-label="Search creations and creators"
        />
        {query ? (
          <button
            type="button"
            className="searchbar__clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>

      <div className="toolbar">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${filter === item.value ? "is-active" : ""}`}
            onClick={() => setFilter(item.value)}
          >
            {item.value === "all" ? <SlidersHorizontal size={13} /> : null}
            {item.label}
          </button>
        ))}
        <span
          aria-hidden="true"
          style={{ width: 1, height: 20, background: "var(--border)", margin: "0 3px" }}
        />
        {toolbarCategories.map((name) => (
          <button
            key={name}
            type="button"
            className={`chip ${category === name ? "is-active" : ""}`}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {creatorMatches.length > 0 ? (
        <section className="panel" style={{ marginTop: 6, marginBottom: 4 }}>
          <div className="panel__head">
            <h2 className="panel__title">Creators</h2>
            <Link href="/discover" className="panel__link">
              Discover more
            </Link>
          </div>
          {creatorMatches.map((creator) => (
            <CreatorResultRow key={creator.id} creator={creator} />
          ))}
        </section>
      ) : null}

      <div className="feed-meta">
        <span>
          {feed.total} {feed.total === 1 ? "creation" : "creations"}
          {category !== "All" ? ` in ${category}` : ""}
          {query ? ` for “${query}”` : ""}
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            style={{ color: "var(--cyan)", fontSize: 11.5, fontWeight: 600 }}
          >
            Reset filters
          </button>
        ) : (
          <span>Updated live</span>
        )}
      </div>

      {!ready ? <FeedSkeleton /> : null}

      {ready && feed.posts.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Search size={19} />
          </span>
          <h3>No creations match that search</h3>
          <p>
            Try a different creator, a broader keyword, or clear the filters to see the
            full feed again.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      ) : null}

      {ready
        ? feed.posts.map((post) => (
            <PostCard key={post.id} post={post} onOpenImage={setViewerPost} />
          ))
        : null}

      <ImageViewer post={viewerPost} onClose={() => setViewerPost(null)} />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <>
          <div className="skeleton" style={{ width: 180, height: 30 }} />
          <div style={{ height: 60 }} />
          <FeedSkeleton />
        </>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
