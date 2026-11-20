"use client";

import Link from "next/link";
import { useApp } from "@/app/providers";
import { formatCount } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

export default function CreatorCard({ creator }) {
  const { toggleFollow, toast, viewerId } = useApp();

  return (
    <div className="creator-card">
      <div className="creator-card__top">
        <Link href={`/profile/${creator.username}`}>
          <Avatar src={creator.avatar_url} name={creator.full_name} size="md" ring />
        </Link>
        <div style={{ minWidth: 0 }}>
          <Link href={`/profile/${creator.username}`} className="creator-card__name">
            {creator.full_name}
          </Link>
          <p className="creator-card__handle">@{creator.username}</p>
        </div>
      </div>
      <p className="creator-card__bio">{creator.bio || "Creator on NAYSPERA AI."}</p>
      <div className="creator-card__foot">
        <span className="creator-card__meta">
          {formatCount(creator.followers)} followers · {formatCount(creator.posts)} posts
        </span>
        {creator.id === viewerId ? (
          <Link href="/settings" className="btn btn--ghost btn--sm">
            Edit
          </Link>
        ) : (
          <button
            type="button"
            className={`follow-chip ${creator.isFollowing ? "is-following" : ""}`}
            onClick={() => {
              const following = toggleFollow(creator.id);
              if (following) toast(`Following ${creator.full_name}.`, "success");
            }}
          >
            {creator.isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
