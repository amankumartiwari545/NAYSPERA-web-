"use client";

import Link from "next/link";
import { useApp } from "@/app/providers";
import { formatCount } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

export default function CreatorResultRow({ creator }) {
  const { toggleFollow, toast, viewerId } = useApp();

  return (
    <div className="creator-row" style={{ padding: "8px 0" }}>
      <Link href={`/profile/${creator.username}`}>
        <Avatar src={creator.avatar_url} name={creator.full_name} size="sm" />
      </Link>
      <span className="creator-row__meta">
        <Link href={`/profile/${creator.username}`} className="creator-row__name">
          {creator.full_name}
        </Link>
        <span className="creator-row__sub">
          @{creator.username} · {formatCount(creator.followers)} followers ·{" "}
          {formatCount(creator.posts)} creations
        </span>
      </span>
      {creator.id !== viewerId ? (
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
      ) : null}
    </div>
  );
}
