"use client";

import Link from "next/link";
import { useApp } from "@/app/providers";
import {
  categoryCounts,
  platformActivity,
  suggestedCreators,
  topCreators,
  trendingTags,
} from "@/lib/selectors";
import { formatCount } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

export default function RightSidebar() {
  const { database, viewerId, toast } = useApp();
  if (!database) return <aside className="right-rail" aria-hidden="true" />;

  const creators = topCreators(database, viewerId, 4);
  const categories = categoryCounts(database).slice(0, 6);
  const tags = trendingTags(database, 6);
  const suggestions = suggestedCreators(database, viewerId, 3);
  const activity = platformActivity(database);

  return (
    <aside className="right-rail" aria-label="Discovery">
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Trending creators</h2>
          <Link href="/discover" className="panel__link">
            View all
          </Link>
        </div>
        {creators.map((creator) => (
          <Link
            key={creator.id}
            href={`/profile/${creator.username}`}
            className="creator-row"
          >
            <Avatar src={creator.avatar_url} name={creator.full_name} size="sm" />
            <span className="creator-row__meta">
              <span className="creator-row__name">{creator.full_name}</span>
              <span className="creator-row__sub">
                @{creator.username} · {formatCount(creator.followers)} followers
              </span>
            </span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Popular categories</h2>
          <Link href="/discover" className="panel__link">
            Explore
          </Link>
        </div>
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/explore?category=${encodeURIComponent(category.name)}`}
            className="tag-row"
          >
            <span>{category.name}</span>
            <span className="tag-row__count">{category.count}</span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Trending hashtags</h2>
        </div>
        <div className="post-card__tags" style={{ marginTop: 0 }}>
          {tags.map((item) => (
            <Link
              key={item.tag}
              href={`/explore?q=${encodeURIComponent(item.tag)}`}
              className="tag"
            >
              #{item.tag.replace(/\s+/g, "")}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Suggested to follow</h2>
        </div>
        {suggestions.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            You already follow every creator here.
          </p>
        ) : (
          suggestions.map((creator) => (
            <div key={creator.id} className="creator-row">
              <Link href={`/profile/${creator.username}`}>
                <Avatar src={creator.avatar_url} name={creator.full_name} size="sm" />
              </Link>
              <span className="creator-row__meta">
                <Link
                  href={`/profile/${creator.username}`}
                  className="creator-row__name"
                >
                  {creator.full_name}
                </Link>
                <span className="creator-row__sub">
                  {formatCount(creator.likes)} likes earned
                </span>
              </span>
              <FollowMini creator={creator} onDone={toast} />
            </div>
          ))
        )}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Platform activity</h2>
        </div>
        {activity.map((row) => (
          <div key={row.label} className="activity-row">
            <span>
              <span className="activity-dot" />
              {row.label}
            </span>
            <strong>{formatCount(row.value)}</strong>
          </div>
        ))}
        <p className="panel__note">
          NAYSPERA AI · creator community running locally on this device.
        </p>
      </section>
    </aside>
  );
}

function FollowMini({ creator, onDone }) {
  const { toggleFollow } = useApp();
  return (
    <button
      type="button"
      className="follow-chip"
      onClick={() => {
        const following = toggleFollow(creator.id);
        if (following) onDone?.(`Following ${creator.full_name}.`, "success");
      }}
    >
      Follow
    </button>
  );
}
